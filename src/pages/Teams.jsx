import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as db from '../services/storage.js';
import { Alert, Chips, PageHeader } from '../components/ui.jsx';

// FR3 (create a team) and FR4 (search for and join teams)
export default function Teams({ user, navigate }) {
  const { refresh } = useAuth();
  const myTeam = db.getTeamOfUser(user.id);
  const [query, setQuery] = useState('');
  const [openOnly, setOpenOnly] = useState(true);
  const [error, setError] = useState('');

  const run = (fn) => {
    try {
      fn();
      setError('');
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const q = query.trim().toLowerCase();
  const teams = db.getTeams().filter((t) => {
    if (openOnly && t.memberIds.length >= db.MAX_TEAM_SIZE) return false;
    if (!q) return true;
    const haystack = [t.name, t.description, t.topic?.title, ...t.requiredSkills].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  return (
    <>
      <PageHeader title="Find teams" subtitle="Search by project topic or skills, then send a request to join." />
      <Alert>{error}</Alert>

      {myTeam ? (
        <div className="card info">
          You are already in <strong>{myTeam.name}</strong>.{' '}
          <button className="link" onClick={() => navigate('myteam')}>Open my team</button>
        </div>
      ) : (
        <CreateTeamForm user={user} run={run} navigate={navigate} />
      )}

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search by team, topic or skill (e.g. React)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="check">
          <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
          Only teams with open spots
        </label>
      </div>

      {teams.length === 0 ? (
        <p className="muted">No teams match your search.</p>
      ) : (
        <div className="grid-3">
          {teams.map((t) => {
            const requested = t.requests.includes(user.id);
            const full = t.memberIds.length >= db.MAX_TEAM_SIZE;
            return (
              <div className="card team-card" key={t.id}>
                <h3>{t.name}</h3>
                <p className="small muted">{t.description || 'No description provided.'}</p>
                <p className="small"><strong>Topic:</strong> {t.topic?.title || 'Not decided'}</p>
                <p className="small"><strong>Leader:</strong> {db.userName(t.leaderId)}</p>
                <p className="small"><strong>Members:</strong> {t.memberIds.length}/{db.MAX_TEAM_SIZE}</p>
                <p className="small"><strong>Looking for:</strong> <Chips items={t.requiredSkills} /></p>
                {requested ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => run(() => db.cancelRequest(t.id, user.id))}>
                    Requested · Cancel
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!!myTeam || full}
                    onClick={() => run(() => db.requestToJoin(t.id, user.id))}
                  >
                    {full ? 'Team full' : 'Request to join'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function CreateTeamForm({ user, run, navigate }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', skills: '', topic: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return run(() => { throw new Error('Please enter a team name.'); });
    run(() => {
      db.createTeam(user.id, {
        name: form.name,
        description: form.description,
        requiredSkills: db.parseSkills(form.skills),
        topic: form.topic ? { title: form.topic, type: 'selected' } : null,
      });
      navigate('myteam');
    });
  };

  if (!open) {
    return (
      <div className="card row-between">
        <div>
          <strong>Want to lead your own team?</strong>
          <div className="small muted">Creating a team makes you the team leader.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>Create a team</button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Create a new team</h2>
      <div className="grid-2">
        <label className="field">
          <span>Team name</span>
          <input value={form.name} onChange={set('name')} placeholder="Code Crusaders" />
        </label>
        <label className="field">
          <span>Project topic (optional)</span>
          <select value={form.topic} onChange={set('topic')}>
            <option value="">Decide later</option>
            {db.TOPIC_CATALOG.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Project details</span>
        <textarea rows="3" value={form.description} onChange={set('description')} placeholder="What does the team want to build?" />
      </label>
      <label className="field">
        <span>Skills you are looking for <span className="muted small">(comma separated)</span></span>
        <input value={form.skills} onChange={set('skills')} placeholder="Node.js, Database, Testing" />
      </label>
      <div className="btn-row">
        <button className="btn btn-primary">Create team</button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
