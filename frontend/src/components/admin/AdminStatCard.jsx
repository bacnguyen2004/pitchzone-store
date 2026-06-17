function AdminStatCard({ label, value, hint, tone = "default", icon }) {
  return (
    <article className={`admin-stat-card is-${tone}`}>
      <div className="admin-stat-card-top">
        <p className="admin-stat-label">{label}</p>
        {icon && <div className="admin-stat-icon">{icon}</div>}
      </div>
      <p className="admin-stat-value">{value}</p>
      {hint && <p className="admin-stat-hint">{hint}</p>}
    </article>
  );
}

export default AdminStatCard;