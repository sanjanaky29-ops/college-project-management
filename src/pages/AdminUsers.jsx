import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as db from '../services/storage.js';
import { PageHeader } from '../components/ui.jsx';

// FR1 (admin side): view and manage registered accounts.
export default function AdminUsers({ user }) {
  const { refresh } = useAuth();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');

  const q = query.trim().toLowerCase();
  const users = db.getUsers().filter((u) => {
    if (role !== 'all' && u.role !== role) return false;
    return !q || [u.name, u.email, u.regNo].join(' ').toLowerCase().includes(q);
  });

  const toggle = (u) => {
    db.setUserActive(u.id, !u.active);
    refresh();
  };

  return (
    <>
      <PageHeader title="Manage users" subtitle="Review registered accounts and suspend or restore access." />
      <div className="toolbar">
        <input className="search" type="search" placeholder="Search name, email or registration number" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Reg. / Emp. No.</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.regNo}</td>
                <td>{u.email}</td>
                <td><span className="role-tag">{u.role}</span></td>
                <td><span className={`status ${u.active ? 'status-completed' : 'status-pending'}`}>{u.active ? 'active' : 'suspended'}</span></td>
                <td>
                  {u.id !== user.id && (
                    <button className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggle(u)}>
                      {u.active ? 'Suspend' : 'Restore'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="muted">No users found.</p>}
      </div>
    </>
  );
}
