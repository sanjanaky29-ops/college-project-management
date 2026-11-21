import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { parseSkills } from '../services/storage.js';
import { Alert } from '../components/ui.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// FR1: new students (and faculty) register with name, registration number, email and password.
export default function Register({ onSwitch, onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    role: 'student', name: '', regNo: '', email: '', skills: '', password: '', confirm: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.';
    if (!form.regNo.trim()) return 'Please enter your registration / employee number.';
    if (!EMAIL_RE.test(form.email.trim())) return 'Please enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return 'Password must contain letters and numbers.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError('');
    setBusy(true);
    try {
      await register({
        role: form.role, name: form.name, regNo: form.regNo, email: form.email,
        password: form.password, skills: parseSkills(form.skills),
      });
      onSuccess('Account created successfully. Please log in.');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card wide">
        <div className="brand brand-center"><span className="brand-mark">PT</span> Project Team Manager</div>
        <h1>Create your account</h1>
        <p className="muted">Register to form teams and manage your college project.</p>

        <Alert>{error}</Alert>

        <form onSubmit={handleSubmit} noValidate>
          <div className="segmented" role="radiogroup" aria-label="I am a">
            {['student', 'faculty'].map((r) => (
              <button
                type="button" key={r}
                className={form.role === r ? 'seg active' : 'seg'}
                onClick={() => setForm({ ...form, role: r })}
              >
                {r === 'student' ? 'Student' : 'Faculty / Guide'}
              </button>
            ))}
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Full name</span>
              <input value={form.name} onChange={set('name')} placeholder="Sanjana" autoComplete="name" />
            </label>
            <label className="field">
              <span>{form.role === 'student' ? 'Registration number' : 'Employee ID'}</span>
              <input value={form.regNo} onChange={set('regNo')} placeholder={form.role === 'student' ? '21CS1001' : 'FAC102'} />
            </label>
          </div>

          <label className="field">
            <span>Email ID</span>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" autoComplete="email" />
          </label>

          <label className="field">
            <span>Skills <span className="muted small">(comma separated, used for team matching)</span></span>
            <input value={form.skills} onChange={set('skills')} placeholder="React, Python, UI Design" />
          </label>

          <div className="grid-2">
            <label className="field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="Min 8 chars, letters + numbers" />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </label>
          </div>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="small center">
          Already registered?{' '}
          <button className="link" onClick={onSwitch}>Log in</button>
        </p>
      </div>
    </div>
  );
}
