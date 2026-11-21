const NAV = {
  student: [
    ['dashboard', 'Dashboard'],
    ['teams', 'Find Teams'],
    ['myteam', 'My Team'],
    ['notifications', 'Notifications'],
    ['profile', 'Profile'],
  ],
  faculty: [
    ['dashboard', 'Dashboard'],
    ['monitor', 'Teams'],
    ['notifications', 'Notifications'],
    ['profile', 'Profile'],
  ],
  admin: [
    ['dashboard', 'Dashboard'],
    ['users', 'Manage Users'],
    ['profile', 'Profile'],
  ],
};

export default function Navbar({ user, page, setPage, unread, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand" onClick={() => setPage('dashboard')}>
          <span className="brand-mark">PT</span> Project Team Manager
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          {NAV[user.role].map(([key, label]) => (
            <button
              key={key}
              className={`nav-link ${page === key ? 'active' : ''}`}
              onClick={() => setPage(key)}
            >
              {label}
              {key === 'notifications' && unread > 0 && <span className="badge-count">{unread}</span>}
            </button>
          ))}
        </nav>
        <div className="nav-user">
          <span className="small">
            {user.name} <span className="role-tag">{user.role}</span>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Log out</button>
        </div>
      </div>
    </header>
  );
}
