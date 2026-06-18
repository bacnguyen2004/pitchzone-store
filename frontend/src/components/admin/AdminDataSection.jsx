function AdminDataSection({ children, className = "" }) {
  return (
    <section className={`admin-data-section${className ? ` ${className}` : ""}`}>
      {children}
    </section>
  );
}

export default AdminDataSection;