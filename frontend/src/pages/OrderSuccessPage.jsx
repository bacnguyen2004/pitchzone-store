import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { CheckIcon } from "../components/AuthIcons";
import { getOrder } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatCurrency } from "../utils/format";
import { paymentMethodLabels } from "../utils/orderStatus";
import { HomeIcon } from "../components/StoreIcons";

function OrderSuccessPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  usePageTitle(order ? `Đặt hàng thành công #${order.id}` : "Đặt hàng thành công");

  useEffect(() => {
    async function load() {
      if (!isAuthenticated) {
        setStatus("guest");
        return;
      }

      try {
        const data = await getOrder(id);
        setOrder(data);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }

    load();
  }, [id, isAuthenticated]);

  if (status === "guest") {
    return (
      <main className="cart-page">
        <div className="page-container py-14 text-center">
          <p className="text-slate-600">Bạn cần đăng nhập để xem đơn hàng.</p>
          <Link to="/login" className="btn-primary mt-6 inline-flex rounded-xl px-6 py-3">
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="cart-page">
        <div className="page-container py-14">
          <p className="text-slate-500">Đang tải thông tin đơn hàng...</p>
        </div>
      </main>
    );
  }

  if (status === "error" || !order) {
    return (
      <main className="cart-page">
        <div className="page-container py-14 text-center">
          <p className="text-red-600">Không tìm thấy đơn hàng.</p>
          <Link to="/orders" className="btn-secondary mt-6 inline-flex rounded-xl px-6 py-3">
            Xem đơn hàng
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="page-container py-10 sm:py-14">
        <div className="order-success-card">
          <span className="order-success-icon">
            <CheckIcon className="h-8 w-8" />
          </span>
          <h1>Đặt hàng thành công!</h1>
          <p>
            Cảm ơn bạn đã mua hàng tại PitchZone. Mã đơn{" "}
            <strong>#{order.id}</strong> đã được ghi nhận.
          </p>

          <dl className="order-success-summary">
            <div>
              <dt>Tổng thanh toán</dt>
              <dd>{formatCurrency(order.total_price)}</dd>
            </div>
            <div>
              <dt>Phí vận chuyển</dt>
              <dd>
                {Number(order.shipping_fee) === 0
                  ? "Miễn phí"
                  : formatCurrency(order.shipping_fee)}
              </dd>
            </div>
            <div>
              <dt>Hình thức</dt>
              <dd>
                {paymentMethodLabels[order.payment_method] || order.payment_method}
              </dd>
            </div>
            <div>
              <dt>Giao tới</dt>
              <dd>{order.address}</dd>
            </div>
          </dl>

          <div className="order-success-actions">
            <Link to={`/orders/${order.id}`} className="btn-primary rounded-xl px-6 py-3">
              Xem chi tiết đơn
            </Link>
            <Link to="/" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3">
              <HomeIcon className="h-4 w-4" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccessPage;