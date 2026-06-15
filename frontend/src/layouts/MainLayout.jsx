import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
  }`;

function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-sm font-bold text-white">
              TG
            </span>
            <span>
              <span className="block text-lg font-bold leading-5 text-zinc-950">
                TechGear
              </span>
              <span className="text-xs font-medium text-zinc-500">
                Store
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink className={navLinkClass} to="/">
              Sản phẩm
            </NavLink>
            <NavLink className={navLinkClass} to="/cart">
              Giỏ hàng
            </NavLink>
            <NavLink className={navLinkClass} to="/orders">
              Đơn hàng
            </NavLink>
            {isAuthenticated ? (
              <div className="ml-auto flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 lg:ml-2">
                <span className="max-w-32 truncate text-sm font-medium text-zinc-700">
                  {user?.username}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <div className="ml-auto flex items-center gap-2 lg:ml-2">
                <NavLink className={navLinkClass} to="/login">
                  Đăng nhập
                </NavLink>
                <NavLink
                  className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  to="/register"
                >
                  Đăng ký
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>TechGear Store - Demo ecommerce project.</span>
          <span>Django REST Framework + React</span>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
