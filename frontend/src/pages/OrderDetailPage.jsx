import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { cancelOrder, getOrder } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatCurrency } from "../utils/format";
import {
  ORDER_TIMELINE,
  orderStatusLabels,
  orderStatusTones,
  paymentMethodLabels,
} from "../utils/orderStatus";

function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <p className="order-timeline-cancelled">Đơn hàng đã được hủy.</p>
    );
  }

  const activeIndex = ORDER_TIMELINE.findIndex((step) => step.key === status);

  return (
    <ol className="order-timeline">
      {ORDER_TIMELINE.map((step, index) => {
        const isDone = index <= activeIndex;
        return (
          <li key={step.key} className={isDone ? "is-done" : ""}>
            <span className="order-timeline-dot" />
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, status: authStatus } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  usePageTitle(order ? `Đơn #${order.id}` : "Chi tiết đơn");

  async function loadOrder() {
    setStatus("loading");
    setError("");

    try {
      const data = await getOrder(id);
      setOrder(data);
      setStatus("success");
    } catch {
      setError("Không tải được chi tiết đơn hàng.");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadOrder();
    }
  }, [id, isAuthenticated]);

  async function handleCancel() {
    if (!window.confirm("Hủy đơn hàng này?")) {
      return;
    }

    setActionError("");
    setIsCancelling(true);

    try {
      const data = await cancelOrder(id);
      setOrder(data);
    } catch (err) {
      setActionError(
        err?.response?.data?.detail || "Không thể hủy đơn hàng.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  const canCancel =
    order && ["pending", "processing"].includes(order.status);

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
            <h2>Chi tiết đơn hàng</h2>
            <p>Bạn cần đăng nhập để xem đơn.</p>
            <Link
              to={`/login?next=/orders/${id}`}
              className="btn-primary rounded-xl px-7 py-3"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="page-container py-8 sm:py-10">
        <Link to="/orders" className="order-back-link">
          ← Quay lại đơn hàng
        </Link>

        {status === "loading" && (
          <div className="order-detail-skeleton skeleton-shimmer" />
        )}

        {status === "error" && <p className="order-alert is-error">{error}</p>}
        {actionError && <p className="order-alert is-error">{actionError}</p>}

        {order && (
          <div className="order-detail-layout">
            <section className="order-detail-main">
              <header className="order-detail-head">
                <div>
                  <h1>Đơn hàng #{order.id}</h1>
                  <p>{new Date(order.created_at).toLocaleString("vi-VN")}</p>
                </div>
                <span
                  className={`order-status-badge is-${orderStatusTones[order.status] || "pending"}`}
                >
                  {orderStatusLabels[order.status] || order.status}
                </span>
              </header>

              <OrderTimeline status={order.status} />

              <div className="order-detail-grid">
                <div>
                  <h3>Người nhận</h3>
                  <p>{order.full_name}</p>
                  <p className="is-muted">{order.phone}</p>
                </div>
                <div>
                  <h3>Địa chỉ giao</h3>
                  <p>{order.address}</p>
                </div>
                <div>
                  <h3>Thanh toán</h3>
                  <p>{paymentMethodLabels[order.payment_method] || order.payment_method}</p>
                </div>
              </div>

              {order.note && (
                <div className="order-detail-note">
                  <h3>Ghi chú</h3>
                  <p>{order.note}</p>
                </div>
              )}

              <section className="order-detail-items">
                <h2>Sản phẩm</h2>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <div>
                        <p className="order-item-name">{item.product_name}</p>
                        {item.variant_name && (
                          <p className="order-item-variant">{item.variant_name}</p>
                        )}
                        <p className="order-item-qty">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <strong>{formatCurrency(item.total_price)}</strong>
                    </li>
                  ))}
                </ul>
              </section>

              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="btn-secondary rounded-xl px-5 py-2.5 text-red-700"
                >
                  {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                </button>
              )}
            </section>

            <aside className="order-detail-summary">
              <h2>Tóm tắt</h2>
              <dl>
                <div>
                  <dt>Tạm tính</dt>
                  <dd>{formatCurrency(order.subtotal)}</dd>
                </div>
                <div>
                  <dt>Phí ship</dt>
                  <dd>
                    {Number(order.shipping_fee) === 0
                      ? "Miễn phí"
                      : formatCurrency(order.shipping_fee)}
                  </dd>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div>
                    <dt>Voucher {order.voucher_code}</dt>
                    <dd className="is-discount">
                      -{formatCurrency(order.discount_amount)}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="order-detail-total">
                <span>Tổng</span>
                <strong>{formatCurrency(order.total_price)}</strong>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default OrderDetailPage;