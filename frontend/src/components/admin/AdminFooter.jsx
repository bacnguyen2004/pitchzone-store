import { Link } from "react-router-dom";

function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div className="admin-footer-inner">
        <p className="admin-footer-copy">
          <span className="admin-footer-status" aria-hidden="true" />
          © {year} PitchZone Store
        </p>
        <span className="admin-footer-version">v1.0.0</span>
        <nav className="admin-footer-links" aria-label="Liên kết admin">
          <Link to="/" className="admin-footer-link">
            Cửa hàng
          </Link>
          <Link to="/contact" className="admin-footer-link">
            Liên hệ
          </Link>
          <Link to="/admin" className="admin-footer-link">
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default AdminFooter;