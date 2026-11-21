export function ProgressBar({ pct }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Chips({ items }) {
  if (!items || items.length === 0) return <span className="muted">None</span>;
  return (
    <span className="chips">
      {items.map((s) => (
        <span className="chip" key={s}>{s}</span>
      ))}
    </span>
  );
}

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  return <div className={`alert alert-${type}`} role="alert">{children}</div>;
}

export function Stat({ label, value, hint }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="muted small">{hint}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
  );
}
