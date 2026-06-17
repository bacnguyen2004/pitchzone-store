function AdminPageHeader({ title, description, action }) {
  return (
    <header className="admin-page-header">
      <div className="min-w-0">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="admin-page-header-action">{action}</div>}
    </header>
  );
}

export default AdminPageHeader;