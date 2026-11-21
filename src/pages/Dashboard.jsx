import * as db from '../services/storage.js';
import { PageHeader, Stat, ProgressBar } from '../components/ui.jsx';

export default function Dashboard({ user, navigate }) {
  if (user.role === 'admin') return <AdminDashboard user={user} navigate={navigate} />;
  if (user.role === 'faculty') return <FacultyDashboard user={user} navigate={navigate} />;
  return <StudentDashboard user={user} navigate={navigate} />;
}

function StudentDashboard({ user, navigate }) {
  const team = db.getTeamOfUser(user.id);
  const tasks = team ? db.getTasksForTeam(team.id) : [];
  const mine = tasks.filter((t) => t.assigneeId === user.id);
  const pending = mine.filter((t) => t.status !== 'completed').length;
  const progress = team ? db.teamProgress(team.id) : { pct: 0, done: 0, total: 0 };
  const isLeader = team && team.leaderId === user.id;

  const steps = [
    { label: 'Register and log in', done: true },
    { label: 'Create or join a project team', done: !!team, go: 'teams' },
    { label: 'Select or propose a project topic', done: !!team?.topic, go: 'myteam' },
    { label: 'Assign and complete tasks', done: tasks.length > 0 && progress.pct === 100, go: 'myteam' },
  ];

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]}`} subtitle="Here is where your project stands." />
      <div className="grid-4">
        <Stat label="Your team" value={team ? team.name : '—'} hint={team ? (isLeader ? 'You are the team leader' : 'Team member') : 'Not in a team yet'} />
        <Stat label="Project topic" value={team?.topic ? '✓' : '—'} hint={team?.topic?.title || 'Not chosen yet'} />
        <Stat label="My open tasks" value={pending} hint={`${mine.length} assigned in total`} />
        <Stat label="Unread notifications" value={db.unreadCount(user.id)} />
      </div>

      <div className="grid-2">
        <section className="card">
          <h2>Getting started</h2>
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.label} className={s.done ? 'done' : ''}>
                <span className="step-dot">{s.done ? '✓' : ''}</span>
                <span>{s.label}</span>
                {!s.done && s.go && (
                  <button className="link" onClick={() => navigate(s.go)}>Go</button>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h2>Team progress</h2>
          {team ? (
            <>
              <ProgressBar pct={progress.pct} />
              <p className="small muted">{progress.done} of {progress.total} tasks completed ({progress.pct}%)</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('myteam')}>Open my team</button>
            </>
          ) : (
            <>
              <p className="muted">You are not part of a team yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('teams')}>Find or create a team</button>
            </>
          )}
        </section>
      </div>
    </>
  );
}

function FacultyDashboard({ user, navigate }) {
  const teams = db.getTeams();
  const mine = teams.filter((t) => t.guideId === user.id);
  const unguided = teams.filter((t) => !t.guideId).length;

  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} subtitle="Monitor team formation and project progress." />
      <div className="grid-4">
        <Stat label="Total teams" value={teams.length} />
        <Stat label="Teams I guide" value={mine.length} />
        <Stat label="Teams without a guide" value={unguided} />
        <Stat label="Unread notifications" value={db.unreadCount(user.id)} />
      </div>

      <section className="card">
        <h2>My teams</h2>
        {mine.length === 0 ? (
          <p className="muted">You are not guiding any team yet. Open <button className="link" onClick={() => navigate('monitor')}>Teams</button> to pick one.</p>
        ) : (
          mine.map((t) => {
            const p = db.teamProgress(t.id);
            return (
              <div key={t.id} className="list-row">
                <div>
                  <strong>{t.name}</strong>
                  <div className="small muted">{t.topic?.title || 'No topic yet'} · {t.memberIds.length} members</div>
                </div>
                <div className="row-progress">
                  <ProgressBar pct={p.pct} />
                  <span className="small muted">{p.pct}%</span>
                </div>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}

function AdminDashboard() {
  const users = db.getUsers();
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Overview of registered accounts and teams." />
      <div className="grid-4">
        <Stat label="Total users" value={users.length} />
        <Stat label="Students" value={users.filter((u) => u.role === 'student').length} />
        <Stat label="Faculty" value={users.filter((u) => u.role === 'faculty').length} />
        <Stat label="Teams" value={db.getTeams().length} hint={`${users.filter((u) => !u.active).length} suspended accounts`} />
      </div>
    </>
  );
}
