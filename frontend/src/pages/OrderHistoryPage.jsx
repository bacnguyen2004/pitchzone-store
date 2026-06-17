import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatCurrency } from "../utils/format";
import {
  orderStatusLabels,
  orderStatusTones,
  paymentMethodLabels,
} from "../utils/orderStatus";
import { buildProductsUrl } from "../utils/productFilters";
import { ChevronRightIcon, EmptyBoxIcon } from "../components/StoreIcons";

function OrderHistoryPage() {
  usePageTitle("Đơn hàng của tôi");
  const { isAuthenticated, status: authStatus } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) {
        return;
      }

      setStatus("loading");
      setError("");

      try {
        const data = await getOrders();
        setOrders(data);
        setStatus("success");
      } catch {
        setError("Không tải được lịch sử đơn hàng.");
        setStatus("error");
      }
    }

    loadOrders();
  }, [isAuthenticated]);

  if (authStatus === "loading") {
    return (
      <main className="cart-page">
        <div className="page-container py-10">
          <p className="text-slate-500">Đang kiểm tra đăng nhập...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="cart-page">
        <div className="page-container py-14">
          <div className="cart-guest-panel">
            <h2>Đơn hàng</h2>
            <p>Bạn cần đăng nhập để xem đơn hàng.</p>
            <div className="cart-guest-actions">
              <Link to="/login?next=/orders" className="btn-primary rounded-xl px-7 py-3">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="page-container py-8 sm:py-10">
        <header className="order-page-head">
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi trạng thái và chi tiết từng đơn.</p>
        </header>

        {status === "loading" && (
          <div className="order-skeleton-list">
            {[1, 2, 3].map((item) => (
              <div key={item} className="order-card-skeleton skeleton-shimmer" />
            ))}
          </div>
        )}

        {status === "error" && (
          <p className="order-alert is-error">{error}</p>
        )}

        {status === "success" && orders.length === 0 && (
          <section className="cart-empty">
            <span className="cart-empty-icon">
              <EmptyBoxIcon className="h-8 w-8" />
            </span>
            <h2>Chưa có đơn hàng</h2>
            <p>Checkout giỏ hàng để tạo đơn đầu tiên.</p>
            <Link to={buildProductsUrl()} className="btn-primary mt-6 rounded-xl">
              Xem sản phẩm
            </Link>
          </section>
        )}

        <div className="order-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card-head">
                <div>
                  <Link to={`/orders/${order.id}`} className="order-card-id">
                    Đơn #{order.id}
                  </Link>
                  <p className="order-card-date">
                    {new Date(order.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="order-card-meta">
                  <span className={`order-status-badge is-${orderStatusTones[order.status] || "pending"}`}>
                    {orderStatusLabels[order.status] || order.status}
                  </span>
                  <strong>{formatCurrency(order.total_price)}</strong>
                </div>
              </div>

              <ul className="order-card-items">
                {order.items.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product_name}
                    {item.variant_name ? ` (${item.variant_name})` : ""}
                  </li>
                ))}
                {order.items.length > 3 && (
                  <li className="is-muted">+{order.items.length - 3} sản phẩm khác</li>
                )}
              </ul>

              <div className="order-card-foot">
                <span className="order-card-payment">
                  {paymentMethodLabels[order.payment_method] || "COD"}
                </span>
                <Link to={`/orders/${order.id}`} className="order-card-link">
                  Chi tiết
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default OrderHistoryPage;