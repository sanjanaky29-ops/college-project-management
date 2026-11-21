import { useAuth } from '../context/AuthContext.jsx';
import * as db from '../services/storage.js';
import { PageHeader } from '../components/ui.jsx';

// FR9: team activities, task deadlines and project updates.
export default function Notifications({ user }) {
  const { refresh } = useAuth();
  const notes = db.getNotifications(user.id);

  return (
    <>
      <PageHeader title="Notifications" subtitle="Team activity, task deadlines and project updates." />
      {notes.length > 0 && (
        <div className="toolbar">
          <button className="btn btn-ghost btn-sm" onClick={() => { db.markAllRead(user.id); refresh(); }}>
            Mark all as read
          </button>
        </div>
      )}
      {notes.length === 0 ? (
        <div className="card center muted">You are all caught up.</div>
      ) : (
        <div className="card">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`note ${n.read ? '' : 'unread'}`}
              onClick={() => { db.markRead(n.id); refresh(); }}
            >
              <span className="dot" />
              <div>
                <div>{n.message}</div>
                <div className="small muted">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
