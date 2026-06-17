import { Link } from "react-router-dom";

import { usePageTitle } from "../hooks/usePageTitle";
import { buildProductsUrl } from "../utils/productFilters";

function NotFoundPage() {
  usePageTitle("Không tìm thấy trang");

  return (
    <main className="cart-page">
      <div className="page-container py-16 text-center sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Không tìm thấy trang
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Đường dẫn không tồn tại hoặc đã bị di chuyển. Quay lại cửa hàng để
          tiếp tục mua sắm.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary rounded-xl px-6 py-3">
            Trang chủ
          </Link>
          <Link to={buildProductsUrl()} className="btn-secondary rounded-xl px-6 py-3">
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;