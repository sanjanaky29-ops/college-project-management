import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as db from '../services/storage.js';
import { Alert, Chips, PageHeader, ProgressBar } from '../components/ui.jsx';
import TaskTable from '../components/TaskTable.jsx';

// FR5 (members), FR6 (topic) and FR7 (tasks) in one page.
export default function MyTeam({ user, navigate }) {
  const { refresh } = useAuth();
  const [error, setError] = useState('');
  const team = db.getTeamOfUser(user.id);

  const run = (fn) => {
    try {
      fn();
      setError('');
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!team) {
    return (
      <>
        <PageHeader title="My team" />
        <div className="card center">
          <p>You are not part of any team yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('teams')}>Find or create a team</button>
        </div>
      </>
    );
  }

  const isLeader = team.leaderId === user.id;
  const progress = db.teamProgress(team.id);

  return (
    <>
      <PageHeader
        title={team.name}
        subtitle={team.description || 'No description provided.'}
      />
      <Alert>{error}</Alert>

      <div className="card">
        <div className="row-between">
          <div>
            <div className="small muted">Project guide</div>
            <strong>{team.guideId ? db.userName(team.guideId) : 'Not assigned yet'}</strong>
          </div>
          <div>
            <div className="small muted">Looking for skills</div>
            <Chips items={team.requiredSkills} />
          </div>
          <div style={{ minWidth: 180 }}>
            <div className="small muted">Progress · {progress.pct}%</div>
            <ProgressBar pct={progress.pct} />
          </div>
        </div>
      </div>

      <TopicCard team={team} user={user} run={run} />
      <MembersCard team={team} user={user} isLeader={isLeader} run={run} navigate={navigate} />
      <TasksCard team={team} user={user} isLeader={isLeader} run={run} />
    </>
  );
}

/* ---------- FR6: select or propose a topic ---------- */
function TopicCard({ team, user, run }) {
  const [choice, setChoice] = useState('');
  const [custom, setCustom] = useState('');

  const save = (e) => {
    e.preventDefault();
    run(() => {
      if (custom.trim()) db.setTopic(team.id, user.id, { title: custom.trim(), type: 'proposed' });
      else if (choice) db.setTopic(team.id, user.id, { title: choice, type: 'selected' });
      else throw new Error('Choose a topic from the list or type a new proposal.');
      setChoice('');
      setCustom('');
    });
  };

  return (
    <section className="card">
      <h2>Project topic</h2>
      <p>
        {team.topic ? (
          <>
            <strong>{team.topic.title}</strong>{' '}
            <span className="badge">{team.topic.type}</span>
          </>
        ) : (
          <span className="muted">No topic yet. Select one below or propose your own.</span>
        )}
      </p>
      <form onSubmit={save} className="grid-2">
        <label className="field">
          <span>Select an existing topic</span>
          <select value={choice} onChange={(e) => { setChoice(e.target.value); setCustom(''); }}>
            <option value="">— choose —</option>
            {db.TOPIC_CATALOG.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="field">
          <span>…or propose a new topic</span>
          <input value={custom} onChange={(e) => { setCustom(e.target.value); setChoice(''); }} placeholder="Your own idea" />
        </label>
        <div><button className="btn btn-primary btn-sm">Save topic</button></div>
      </form>
    </section>
  );
}

/* ---------- FR5: leader adds / removes members ---------- */
function MembersCard({ team, user, isLeader, run, navigate }) {
  const [toAdd, setToAdd] = useState('');
  const available = db.getStudentsWithoutTeam();

  return (
    <section className="card">
      <h2>Members ({team.memberIds.length}/{db.MAX_TEAM_SIZE})</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Reg. No.</th><th>Skills</th><th>Role</th><th></th></tr>
          </thead>
          <tbody>
            {team.memberIds.map((id) => {
              const m = db.getUser(id);
              return (
                <tr key={id}>
                  <td>{m.name}</td>
                  <td>{m.regNo}</td>
                  <td><Chips items={m.skills} /></td>
                  <td>{id === team.leaderId ? <span className="badge badge-accent">Leader</span> : 'Member'}</td>
                  <td>
                    {isLeader && id !== team.leaderId && (
                      <button className="btn btn-danger btn-sm" onClick={() => run(() => db.removeMember(team.id, id))}>Remove</button>
                    )}
                    {!isLeader && id === user.id && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => run(() => { db.leaveTeam(team.id, user.id); navigate('teams'); })}
                      >
                        Leave team
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isLeader && (
        <>
          <h3>Join requests</h3>
          {team.requests.length === 0 ? (
            <p className="muted small">No pending requests.</p>
          ) : (
            team.requests.map((id) => {
              const r = db.getUser(id);
              return (
                <div className="list-row" key={id}>
                  <div>
                    <strong>{r.name}</strong> <span className="small muted">{r.regNo}</span>
                    <div><Chips items={r.skills} /></div>
                  </div>
                  <div className="btn-row">
                    <button className="btn btn-primary btn-sm" onClick={() => run(() => db.respondToRequest(team.id, id, true))}>Accept</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => run(() => db.respondToRequest(team.id, id, false))}>Decline</button>
                  </div>
                </div>
              );
            })
          )}

          <h3>Add a member</h3>
          <div className="input-row">
            <select value={toAdd} onChange={(e) => setToAdd(e.target.value)}>
              <option value="">— select a student without a team —</option>
              {available.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.regNo}){s.skills.length ? ` – ${s.skills.join(', ')}` : ''}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={() => toAdd && run(() => { db.addMember(team.id, toAdd); setToAdd(''); })}
              disabled={!toAdd}
            >
              Add
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- FR7: assign tasks and track status ---------- */
function TasksCard({ team, user, isLeader, run }) {
  const [form, setForm] = useState({ title: '', assigneeId: '', deadline: '' });
  const tasks = db.getTasksForTeam(team.id);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  const submit = (e) => {
    e.preventDefault();
    run(() => {
      if (!form.title.trim() || !form.assigneeId || !form.deadline) throw new Error('Fill in the task, assignee and deadline.');
      db.addTask({ teamId: team.id, ...form });
      setForm({ title: '', assigneeId: '', deadline: '' });
    });
  };

  return (
    <section className="card">
      <h2>Tasks</h2>

      {isLeader && (
        <form onSubmit={submit} className="task-form">
          <input placeholder="Task title" value={form.title} onChange={set('title')} />
          <select value={form.assigneeId} onChange={set('assigneeId')}>
            <option value="">Assign to…</option>
            {team.memberIds.map((id) => <option key={id} value={id}>{db.userName(id)}</option>)}
          </select>
          <input type="date" min={today} value={form.deadline} onChange={set('deadline')} />
          <button className="btn btn-primary">Assign</button>
        </form>
      )}

      <TaskTable
        tasks={tasks}
        canEdit={(t) => isLeader || t.assigneeId === user.id}
        canDelete={isLeader}
        onStatus={(id, status) => run(() => db.updateTaskStatus(id, user.id, status))}
        onDelete={(id) => run(() => db.deleteTask(id))}
      />
    </section>
  );
}
