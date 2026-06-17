import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  CartIcon,
  LogoutIcon,
  OrdersIcon,
  UserIcon,
} from "./AuthIcons";
import { ChevronDownIcon, GridIcon } from "./StoreIcons";

const baseMenuItems = [
  { to: "/profile", label: "Tài khoản", Icon: UserIcon },
  { to: "/orders", label: "Đơn hàng", Icon: OrdersIcon },
  { to: "/cart", label: "Giỏ hàng", Icon: CartIcon },
];

function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const location = useLocation();

  const initials = user?.username?.charAt(0)?.toUpperCase() || "U";

  const menuItems = user?.is_staff
    ? [...baseMenuItems, { to: "/admin", label: "Quản trị", Icon: GridIcon }]
    : baseMenuItems;

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  function handleLogout() {
    closeMenu();
    onLogout();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex max-w-[10rem] items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition sm:px-2.5 ${
          isOpen
            ? "bg-primary-light text-primary"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Menu tài khoản"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {initials}
        </span>
        <span className="hidden truncate md:inline">{user?.username}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-full z-30 w-52 pt-1">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 bg-slate-50 px-3.5 py-3">
              <p className="truncate text-sm font-medium text-slate-900">
                {user?.username}
              </p>
              {user?.email && (
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              )}
            </div>

            <ul className="p-1.5">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    role="menuitem"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                  >
                    <item.Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogoutIcon className="h-4 w-4 shrink-0" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;