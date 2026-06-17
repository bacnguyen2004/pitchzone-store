function AdminAlert({ tone = "info", children }) {
  return (
    <p role="alert" className={`admin-alert is-${tone}`}>
      {children}
    </p>
  );
}

export default AdminAlert;