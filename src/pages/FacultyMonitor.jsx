import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as db from '../services/storage.js';
import { Alert, Chips, PageHeader, ProgressBar } from '../components/ui.jsx';
import TaskTable from '../components/TaskTable.jsx';

// FR8: faculty view teams, project details and task progress.
export default function FacultyMonitor({ user }) {
  const { refresh } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');

  const q = query.trim().toLowerCase();
  const teams = db.getTeams().filter((t) => {
    if (filter === 'mine' && t.guideId !== user.id) return false;
    if (filter === 'unguided' && t.guideId) return false;
    if (!q) return true;
    return [t.name, t.topic?.title, db.userName(t.leaderId)].join(' ').toLowerCase().includes(q);
  });

  const guide = (teamId) => {
    try {
      db.becomeGuide(teamId, user.id);
      setError('');
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Teams" subtitle="View team members, project topics and task progress." />
      <Alert>{error}</Alert>

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search team, topic or leader" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All teams</option>
          <option value="mine">Teams I guide</option>
          <option value="unguided">Without a guide</option>
        </select>
      </div>

      {teams.length === 0 && <p className="muted">No teams found.</p>}

      {teams.map((t) => {
        const p = db.teamProgress(t.id);
        const open = openId === t.id;
        return (
          <div className="card" key={t.id}>
            <div className="row-between">
              <div>
                <h3 style={{ margin: 0 }}>{t.name}</h3>
                <div className="small muted">
                  Leader: {db.userName(t.leaderId)} · {t.memberIds.length} members · Guide: {t.guideId ? db.userName(t.guideId) : 'none'}
                </div>
                <div className="small"><strong>Topic:</strong> {t.topic?.title || 'Not decided'}</div>
              </div>
              <div className="row-progress">
                <ProgressBar pct={p.pct} />
                <span className="small muted">{p.done}/{p.total} tasks</span>
              </div>
              <div className="btn-row">
                {!t.guideId && <button className="btn btn-primary btn-sm" onClick={() => guide(t.id)}>Become guide</button>}
                <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(open ? null : t.id)}>
                  {open ? 'Hide details' : 'View details'}
                </button>
              </div>
            </div>

            {open && (
              <div className="details">
                <p className="small">{t.description || 'No project description.'}</p>
                <h4>Members</h4>
                <ul className="plain">
                  {t.memberIds.map((id) => {
                    const m = db.getUser(id);
                    return (
                      <li key={id}>
                        {m.name} <span className="muted small">({m.regNo})</span>
                        {id === t.leaderId && <span className="badge badge-accent">Leader</span>}
                        <Chips items={m.skills} />
                      </li>
                    );
                  })}
                </ul>
                <h4>Task progress</h4>
                <TaskTable tasks={db.getTasksForTeam(t.id)} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
