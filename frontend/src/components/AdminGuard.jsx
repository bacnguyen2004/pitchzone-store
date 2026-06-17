import { Link } from "react-router-dom";

import { ShieldCheckIcon } from "./StoreIcons";
import { useAuth } from "../contexts/AuthContext";

function AdminGuard({ children }) {
  const { user, isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return (
      <main className="admin-shell flex min-h-screen items-center justify-center">
        <div className="admin-guard-panel">
          <div className="admin-guard-icon">
            <ShieldCheckIcon className="h-7 w-7" />
          </div>
          <p className="text-sm text-slate-500">Đang kiểm tra quyền truy cập...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-shell flex min-h-screen items-center justify-center px-4">
        <div className="admin-guard-panel">
          <div className="admin-guard-icon">
            <ShieldCheckIcon className="h-7 w-7" />
          </div>
          <h1>Quản trị PitchZone</h1>
          <p>Bạn cần đăng nhập bằng tài khoản admin để tiếp tục.</p>
          <Link to="/login" className="admin-btn admin-btn-primary mt-6">
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  if (!user?.is_staff) {
    return (
      <main className="admin-shell flex min-h-screen items-center justify-center px-4">
        <div className="admin-guard-panel">
          <div className="admin-guard-icon">
            <ShieldCheckIcon className="h-7 w-7" />
          </div>
          <h1>Không có quyền</h1>
          <p>Tài khoản hiện tại không có quyền quản trị cửa hàng.</p>
          <Link to="/" className="admin-btn admin-btn-secondary mt-6">
            Về cửa hàng
          </Link>
        </div>
      </main>
    );
  }

  return children;
}

export default AdminGuard;