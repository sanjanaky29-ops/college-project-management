import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import * as db from './services/storage.js';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Teams from './pages/Teams.jsx';
import MyTeam from './pages/MyTeam.jsx';
import FacultyMonitor from './pages/FacultyMonitor.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  const { user, logout, refresh } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState('dashboard');

  // Generate deadline reminders (FR9) whenever someone logs in.
  useEffect(() => {
    if (user) {
      db.checkDeadlines(user.id);
      refresh();
    } else {
      setPage('dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* ---------- logged out: login / register ---------- */
  if (!user) {
    return mode === 'login' ? (
      <Login notice={notice} onSwitch={() => { setNotice(''); setMode('register'); }} />
    ) : (
      <Register
        onSwitch={() => setMode('login')}
        onSuccess={(msg) => { setNotice(msg); setMode('login'); }}
      />
    );
  }

  /* ---------- logged in ---------- */
  const unread = db.unreadCount(user.id);

  const renderPage = () => {
    switch (page) {
      case 'teams': return <Teams user={user} navigate={setPage} />;
      case 'myteam': return <MyTeam user={user} navigate={setPage} />;
      case 'monitor': return <FacultyMonitor user={user} />;
      case 'users': return <AdminUsers user={user} />;
      case 'notifications': return <Notifications user={user} />;
      case 'profile': return <Profile user={user} onLogout={logout} />;
      default: return <Dashboard user={user} navigate={setPage} />;
    }
  };

  return (
    <>
      <Navbar user={user} page={page} setPage={setPage} unread={unread} onLogout={logout} />
      <main className="container">{renderPage()}</main>
    </>
  );
}
