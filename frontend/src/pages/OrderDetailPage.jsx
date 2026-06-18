import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import bannerSlide3 from "../assets/banner-slide-3.jpg";
import { cancelOrder, getOrder } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatCurrency, resolveMediaUrl } from "../utils/format";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { ErrorPanel, LoadingPanel } from "../components/PageStatus";
import EmptyState from "../components/EmptyState";
import {
  ORDER_TIMELINE,
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from "../utils/orderStatus";
import {
  HomeIcon,
  ImagePlaceholderIcon,
  PriceIcon,
  TruckIcon,
} from "../components/StoreIcons";

function formatOrderDate(value) {
  return new Date(value).toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderDetailHero({ order }) {
  return (
    <section className="order-detail-hero pitch-lines">
      <div className="cart-hero-bg" aria-hidden>
        <img src={bannerSlide3} alt="" className="h-full w-full object-cover" />
        <div className="products-hero-overlay" />
      </div>
      <div className="page-container order-detail-hero-content">
        <nav className="products-breadcrumb">
          <Link to="/" className="products-breadcrumb-link">
            <HomeIcon className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-emerald-700/60">/</span>
          <Link to="/orders" className="products-breadcrumb-link">
            Đơn hàng
          </Link>
          <span className="text-emerald-700/60">/</span>
          <span className="font-medium text-emerald-100/90">
            #{order.id}
          </span>
        </nav>

        <div className="order-detail-hero-row">
          <div>
            <p className="order-detail-hero-eyebrow">Chi tiết đơn hàng</p>
            <h1 className="products-hero-title mt-2">Đơn #{order.id}</h1>
            <p className="order-detail-hero-date">{formatOrderDate(order.created_at)}</p>
          </div>
          <OrderStatusBadge
            status={order.status}
            size="lg"
            className="order-detail-hero-badge"
          />
        </div>
      </div>
    </section>
  );
}

function OrderDetailTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="order-detail-timeline-cancelled">
        <span className="order-detail-timeline-cancelled-icon">×</span>
        <div>
          <p className="font-semibold text-slate-800">Đơn hàng đã hủy</p>
          <p className="text-sm text-slate-500">Giao dịch không còn được xử lý.</p>
        </div>
      </div>
    );
  }

  const activeIndex = ORDER_TIMELINE.findIndex((step) => step.key === status);

  return (
    <ol className="order-detail-timeline">
      {ORDER_TIMELINE.map((step, index) => {
        const isDone = index <= activeIndex;
        const isActive = index === activeIndex;

        return (
          <li
            key={step.key}
            className={[
              isDone ? "is-done" : "",
              isActive ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="order-detail-timeline-dot">
              {isDone && !isActive ? "✓" : index + 1}
            </span>
            <span className="order-detail-timeline-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderInfoCard({ icon: Icon, title, children, tone = "default" }) {
  return (
    <article className={`order-detail-info-card is-${tone}`}>
      <span className="order-detail-info-icon" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </article>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="order-detail-skeleton-layout">
      <div className="order-detail-skeleton-main skeleton-shimmer" />
      <div className="order-detail-skeleton-aside skeleton-shimmer" />
    </div>
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
  const [copiedTracking, setCopiedTracking] = useState(false);

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

  async function handleCopyTracking(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTracking(true);
      window.setTimeout(() => setCopiedTracking(false), 2000);
    } catch {
      setCopiedTracking(false);
    }
  }

  const canCancel =
    order && ["pending", "processing"].includes(order.status);

  const itemCount = order?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (authStatus === "loading") {
    return (
      <main className="cart-page">
        <div className="page-container py-10">
          <LoadingPanel message="Đang kiểm tra đăng nhập..." />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="cart-page">
        <div className="page-container py-14">
          <EmptyState
            title="Đăng nhập để xem đơn"
            description="Bạn cần đăng nhập để xem chi tiết đơn hàng này."
            actionTo={`/login?next=/orders/${id}`}
            actionLabel="Đăng nhập"
            tone="orders"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page order-detail-page">
      {order && <OrderDetailHero order={order} />}

      <div className="page-container order-detail-body-wrap">
        {!order && (
          <Link to="/orders" className="order-back-link">
            ← Quay lại đơn hàng
          </Link>
        )}

        {status === "loading" && <OrderDetailSkeleton />}

        {status === "error" && (
          <ErrorPanel
            className="order-alert is-error"
            message={error}
            onRetry={loadOrder}
          />
        )}
        {actionError && (
          <ErrorPanel className="order-alert is-error" message={actionError} />
        )}

        {order && (
          <div className="order-detail-layout">
            <section className="order-detail-main">
              <section className="order-detail-section">
                <h2 className="order-detail-section-title">Tiến độ đơn hàng</h2>
                <OrderDetailTimeline status={order.status} />
              </section>

              {order.tracking_code && (
                <div className="order-detail-tracking-banner">
                  <div className="order-detail-tracking-icon" aria-hidden>
                    <TruckIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="order-detail-tracking-label">
                      Vận chuyển {order.carrier?.toUpperCase() || "GHN"}
                    </p>
                    <p className="order-detail-tracking-code">{order.tracking_code}</p>
                    {order.carrier_status && (
                      <p className="order-detail-tracking-status">{order.carrier_status}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTracking(order.tracking_code)}
                    className="order-detail-copy-btn"
                  >
                    {copiedTracking ? "Đã copy" : "Copy mã"}
                  </button>
                </div>
              )}

              {order.payment_method === "vnpay" && order.payment_status === "unpaid" && (
                <div className="order-detail-alert is-warning">
                  <PriceIcon className="h-5 w-5 shrink-0" />
                  <p>
                    Đơn chưa thanh toán VNPay. Vui lòng hoàn tất thanh toán hoặc liên hệ
                    hỗ trợ nếu đã bị trừ tiền.
                  </p>
                </div>
              )}

              <section className="order-detail-section">
                <h2 className="order-detail-section-title">Thông tin giao hàng</h2>
                <div className="order-detail-info-grid">
                  <OrderInfoCard icon={TruckIcon} title="Người nhận">
                    <p className="order-detail-info-primary">{order.full_name}</p>
                    <p className="order-detail-info-muted">{order.phone}</p>
                  </OrderInfoCard>

                  <OrderInfoCard icon={HomeIcon} title="Địa chỉ">
                    <p className="order-detail-info-primary">{order.address}</p>
                    {order.city && (
                      <p className="order-detail-info-muted">{order.city}</p>
                    )}
                  </OrderInfoCard>

                  <OrderInfoCard
                    icon={PriceIcon}
                    title="Thanh toán"
                    tone={order.payment_status === "paid" ? "success" : "default"}
                  >
                    <p className="order-detail-info-primary">
                      {paymentMethodLabels[order.payment_method] || order.payment_method}
                    </p>
                    {order.payment_status && (
                      <p
                        className={
                          order.payment_status === "paid"
                            ? "order-detail-info-success"
                            : order.payment_status === "failed"
                              ? "order-detail-info-error"
                              : "order-detail-info-muted"
                        }
                      >
                        {paymentStatusLabels[order.payment_status] || order.payment_status}
                      </p>
                    )}
                  </OrderInfoCard>
                </div>
              </section>

              {order.note && (
                <section className="order-detail-note-card">
                  <h3>Ghi chú khách hàng</h3>
                  <p>{order.note}</p>
                </section>
              )}

              <section className="order-detail-section">
                <div className="order-detail-items-head">
                  <h2 className="order-detail-section-title">Sản phẩm</h2>
                  <span className="order-detail-items-count">{itemCount} món</span>
                </div>

                <ul className="order-detail-product-list">
                  {order.items.map((item) => {
                    const productId = item.product?.id || item.product;
                    const imageUrl = resolveMediaUrl(item.product_image);
                    const thumb = imageUrl ? (
                      <img src={imageUrl} alt={item.product_name} loading="lazy" />
                    ) : (
                      <ImagePlaceholderIcon className="h-7 w-7 text-emerald-300" />
                    );
                    const thumbClass = `order-detail-product-thumb${
                      imageUrl ? " is-image" : ""
                    }`;

                    return (
                      <li key={item.id} className="order-detail-product-row">
                        {productId ? (
                          <Link
                            to={`/products/${productId}`}
                            className={thumbClass}
                            aria-label={item.product_name}
                          >
                            {thumb}
                          </Link>
                        ) : (
                          <div className={thumbClass} aria-hidden>
                            {thumb}
                          </div>
                        )}

                        <div className="order-detail-product-body">
                          {productId ? (
                            <Link
                              to={`/products/${productId}`}
                              className="order-detail-product-name"
                            >
                              {item.product_name}
                            </Link>
                          ) : (
                            <p className="order-detail-product-name">{item.product_name}</p>
                          )}
                          {item.variant_name && (
                            <p className="order-detail-product-variant">{item.variant_name}</p>
                          )}
                          <p className="order-detail-product-qty">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>

                        <strong className="order-detail-product-total">
                          {formatCurrency(item.total_price)}
                        </strong>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {canCancel && (
                <div className="order-detail-actions">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="order-detail-cancel-btn"
                  >
                    {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                  </button>
                </div>
              )}
            </section>

            <aside className="order-detail-summary">
              <div className="order-detail-summary-sticky">
                <h2>Tóm tắt thanh toán</h2>

                <dl className="order-detail-summary-list">
                  <div>
                    <dt>Tạm tính</dt>
                    <dd>{formatCurrency(order.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Phí vận chuyển</dt>
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
                  <span>Tổng thanh toán</span>
                  <strong>{formatCurrency(order.total_price)}</strong>
                </div>

                <div className="order-detail-summary-meta">
                  <div>
                    <span>Phương thức</span>
                    <p>{paymentMethodLabels[order.payment_method] || order.payment_method}</p>
                  </div>
                  <div>
                    <span>Trạng thái</span>
                    <p>{orderStatusLabels[order.status] || order.status}</p>
                  </div>
                </div>

                <Link to="/orders" className="order-detail-back-btn">
                  ← Danh sách đơn
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default OrderDetailPage;