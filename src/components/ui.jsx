export function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

export function StatusBadge({ estado }) {
  const statusClass = estado.replace(/\s+/g, "-");
  return <span className={`status-badge status-${statusClass}`}>{estado}</span>;
}

export function RoleBadge({ role, label }) {
  return <span className={`role-badge role-${role}`}>{label}</span>;
}

export function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
