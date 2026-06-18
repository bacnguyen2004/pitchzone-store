function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`admin-empty-state${compact ? " is-compact" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {Icon && (
        <span className="admin-empty-state-icon" aria-hidden>
          <Icon className="h-8 w-8" />
        </span>
      )}
      <h3 className="admin-empty-state-title">{title}</h3>
      {description && <p className="admin-empty-state-desc">{description}</p>}
      {action && <div className="admin-empty-state-action">{action}</div>}
    </div>
  );
}

export default AdminEmptyState;