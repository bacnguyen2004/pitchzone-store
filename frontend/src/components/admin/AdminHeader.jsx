import { Link, useLocation } from "react-router-dom";

import { LogoutIcon } from "../AuthIcons";
import { HomeIcon } from "../StoreIcons";
import { getAdminPageMeta } from "../../config/adminPageMeta";
import { useAuth } from "../../contexts/AuthContext";

function getInitials(username = "") {
  return username.slice(0, 2).toUpperCase() || "AD";
}

function AdminHeader() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const meta = getAdminPageMeta(pathname);

  return (
    <header className="admin-header">
      <div className="admin-header-main">
        <nav className="admin-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin" className="admin-breadcrumb-link">
            Admin
          </Link>
          {meta.breadcrumb.map((segment, index) => (
            <span key={segment} className="admin-breadcrumb-segment">
              <span className="admin-breadcrumb-divider" aria-hidden="true">
                /
              </span>
              <span className={index === meta.breadcrumb.length - 1 ? "font-semibold text-slate-800" : ""}>
                {segment}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="admin-header-actions">
        <Link to="/" className="admin-store-link">
          <HomeIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Về cửa hàng</span>
        </Link>
        <div className="admin-header-user">
          <span className="admin-header-avatar">{getInitials(user?.username)}</span>
          <div>
            <p className="admin-header-username">{user?.username}</p>
            <p className="admin-header-role">
              {user?.is_staff ? "Quản trị viên" : "Nhân viên"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="admin-btn admin-btn-ghost hidden sm:inline-flex"
          aria-label="Đăng xuất"
        >
          <LogoutIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;