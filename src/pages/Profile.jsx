import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as db from '../services/storage.js';
import { Alert, PageHeader } from '../components/ui.jsx';

// FR10: update profile information and log out.
export default function Profile({ user, onLogout }) {
  const { refresh } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email, skills: user.skills.join(', ') });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const saveProfile = (e) => {
    e.preventDefault();
    try {
      if (!form.name.trim()) throw new Error('Name cannot be empty.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) throw new Error('Enter a valid email address.');
      db.updateProfile(user.id, { name: form.name, email: form.email, skills: db.parseSkills(form.skills) });
      setMsg({ type: 'success', text: 'Profile updated.' });
      refresh();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      if (pw.next.length < 8 || !/[A-Za-z]/.test(pw.next) || !/\d/.test(pw.next)) {
        throw new Error('New password needs 8+ characters with letters and numbers.');
      }
      await db.changePassword(user.id, pw.current, pw.next);
      setPw({ current: '', next: '' });
      setMsg({ type: 'success', text: 'Password changed.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <>
      <PageHeader title="My profile" subtitle={`${user.role} · ${user.regNo}`} />
      <Alert type={msg.type || 'error'}>{msg.text}</Alert>

      <form className="card" onSubmit={saveProfile}>
        <h2>Profile details</h2>
        <label className="field">
          <span>Full name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="field">
          <span>Skills <span className="muted small">(comma separated)</span></span>
          <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </label>
        <button className="btn btn-primary">Save changes</button>
      </form>

      <form className="card" onSubmit={savePassword}>
        <h2>Change password</h2>
        <div className="grid-2">
          <label className="field">
            <span>Current password</span>
            <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          </label>
        </div>
        <button className="btn btn-primary">Update password</button>
      </form>

      <div className="card row-between">
        <div>
          <strong>Done for today?</strong>
          <div className="small muted">Logging out ends your session on this device.</div>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Log out</button>
      </div>
    </>
  );
}
