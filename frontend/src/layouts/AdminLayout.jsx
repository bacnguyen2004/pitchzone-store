import { NavLink, Outlet } from "react-router-dom";

import { LogoutIcon } from "../components/AuthIcons";
import AdminFooter from "../components/admin/AdminFooter";
import AdminHeader from "../components/admin/AdminHeader";
import Logo from "../components/Logo";
import { adminNavGroups } from "../config/adminNav";
import { useAuth } from "../contexts/AuthContext";

const sidebarLinkClass = ({ isActive }) =>
  `admin-sidebar-link${isActive ? " is-active" : ""}`;

function getInitials(username = "") {
  return username.slice(0, 2).toUpperCase() || "AD";
}

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Logo variant="light" showText />
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Quản trị">
          {adminNavGroups.map((group) => (
            <div key={group.label} className="admin-sidebar-group">
              <p className="admin-sidebar-group-label">{group.label}</p>
              {group.items.map((item) => {
                const { Icon } = item;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={sidebarLinkClass}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-user-card">
            <span className="admin-sidebar-avatar">
              {getInitials(user?.username)}
            </span>
            <div className="min-w-0">
              <p className="admin-sidebar-user">{user?.username}</p>
              <p className="admin-sidebar-role">Bảng quản trị</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="admin-sidebar-logout">
            <LogoutIcon className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-mobile-top">
          <nav className="admin-mobile-nav" aria-label="Quản trị di động">
            {adminNavGroups.flatMap((group) => group.items).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-mobile-nav-link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <AdminHeader />

        <div className="admin-content">
          <div className="admin-page">
            <Outlet />
          </div>
        </div>

        <AdminFooter />
      </div>
    </div>
  );
}

export default AdminLayout;