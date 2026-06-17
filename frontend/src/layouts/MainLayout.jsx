import { Link, NavLink, Outlet } from "react-router-dom";

import { CartIcon, UserIcon } from "../components/AuthIcons";
import CategoryNavMenu from "../components/CategoryNavMenu";
import Logo from "../components/Logo";
import SiteFooter from "../components/SiteFooter";
import UserMenu from "../components/UserMenu";
import VoucherCorner from "../components/VoucherCorner";
import { siteNavItems } from "../config/siteNav";
import { useAuth } from "../contexts/AuthContext";
import { useCartCount } from "../hooks/useCartCount";

const navLinkClass = ({ isActive }) =>
  `shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-primary-light text-primary"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const actionLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-primary-light text-primary"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const iconActionClass = ({ isActive }) =>
  `inline-flex h-9 w-9 items-center justify-center rounded-lg transition sm:h-auto sm:w-auto sm:px-3 sm:py-2 ${
    isActive
      ? "bg-primary-light text-primary"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

function SiteNav({ linkClassName, menuMode = "desktop" }) {
  return siteNavItems.map((item) => {
    if (item.to === "/categories") {
      return (
        <CategoryNavMenu
          key={item.to}
          mode={menuMode}
          linkClassName={linkClassName}
        />
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={linkClassName}
      >
        {item.label}
      </NavLink>
    );
  });
}

function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count: cartCount } = useCartCount();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
            <Logo />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex">
            <SiteNav linkClassName={navLinkClass} />
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink
              className={({ isActive }) => `${iconActionClass({ isActive })} relative`}
              to="/cart"
              title="Giỏ hàng"
            >
              <CartIcon />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="header-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
              )}
            </NavLink>

            {isAuthenticated ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <>
                <NavLink className={actionLinkClass} to="/login">
                  <UserIcon className="h-4 w-4" />
                  Đăng nhập
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-primary-hover bg-primary-hover text-white"
                        : "border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover"
                    }`
                  }
                  to="/register"
                >
                  Đăng ký
                </NavLink>
              </>
            )}
          </div>
        </div>

        <nav className="flex flex-wrap items-start gap-1 border-t border-slate-100 px-4 py-2 md:hidden sm:px-6">
          <SiteNav linkClassName={navLinkClass} menuMode="mobile" />
        </nav>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <SiteFooter />
      <VoucherCorner />
    </div>
  );
}

export default MainLayout;