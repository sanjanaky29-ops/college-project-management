import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert } from '../components/ui.jsx';

// FR2: registered users log in securely with email / registration number + password.
export default function Login({ onSwitch, notice }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your email / registration number and password.');
      return;
    }
    setBusy(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand brand-center"><span className="brand-mark">PT</span> Project Team Manager</div>
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your project team.</p>

        <Alert type="success">{notice}</Alert>
        <Alert>{error}</Alert>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email or Registration Number</span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@college.edu or 21CS1001"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-row">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="small center">
          New here?{' '}
          <button className="link" onClick={onSwitch}>Create an account</button>
        </p>

        <details className="demo-box">
          <summary>Demo accounts</summary>
          <p className="small">Admin: <code>admin@college.edu</code> / <code>Admin@123</code></p>
          <p className="small">Faculty: <code>faculty@college.edu</code> / <code>Faculty@123</code></p>
          <p className="small">Students: register your own account.</p>
        </details>
      </div>
    </div>
  );
}
