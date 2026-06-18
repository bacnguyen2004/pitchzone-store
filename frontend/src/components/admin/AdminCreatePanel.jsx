function AdminCreatePanel({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}) {
  return (
    <section className={`admin-panel admin-create-panel${className ? ` ${className}` : ""}`}>
      <header className="admin-panel-head">
        <div className="admin-create-panel-head">
          {Icon && (
            <span className="admin-create-panel-icon" aria-hidden>
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div>
            <h2>{title}</h2>
            {description && <p className="admin-panel-head-desc">{description}</p>}
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}

export default AdminCreatePanel;