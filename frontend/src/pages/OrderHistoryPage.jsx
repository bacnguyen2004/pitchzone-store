import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide2 from "../assets/banner-slide-2.jpg";
import { getOrders } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatCurrency, resolveMediaUrl } from "../utils/format";
import EmptyState from "../components/EmptyState";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { ErrorPanel, LoadingPanel } from "../components/PageStatus";
import {
  paymentMethodLabels,
  paymentStatusLabels,
} from "../utils/orderStatus";
import { buildProductsUrl } from "../utils/productFilters";
import {
  ChevronRightIcon,
  EmptyBoxIcon,
  HomeIcon,
  ImagePlaceholderIcon,
  TruckIcon,
} from "../components/StoreIcons";

function formatOrderDate(value) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderListHero({ orderCount }) {
  return (
    <section className="order-list-hero pitch-lines">
      <div className="cart-hero-bg" aria-hidden>
        <img src={bannerSlide2} alt="" className="h-full w-full object-cover" />
        <div className="products-hero-overlay" />
      </div>
      <div className="page-container order-list-hero-content">
        <nav className="products-breadcrumb">
          <Link to="/" className="products-breadcrumb-link">
            <HomeIcon className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-emerald-700/60">/</span>
          <span className="font-medium text-emerald-100/90">Đơn hàng</span>
        </nav>

        <div className="order-list-hero-row">
          <div>
            <p className="order-list-hero-eyebrow">Lịch sử mua hàng</p>
            <h1 className="products-hero-title mt-2">Đơn hàng của tôi</h1>
            <p className="order-list-hero-desc">
              Theo dõi trạng thái, vận chuyển và chi tiết từng đơn.
            </p>
          </div>
          {orderCount > 0 && (
            <div className="order-list-hero-stat">
              <strong>{orderCount}</strong>
              <span>đơn đã đặt</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function OrderItemThumb({ item }) {
  const imageUrl = resolveMediaUrl(item.product_image);

  return (
    <span
      className={`order-card-thumb${imageUrl ? " is-image" : ""}`}
      title={item.product_name}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" loading="lazy" />
      ) : (
        <ImagePlaceholderIcon className="h-4 w-4 text-emerald-300" />
      )}
    </span>
  );
}

function OrderCard({ order }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 3);
  const extraItems = order.items.length - previewItems.length;

  return (
    <article className="order-card">
      <div className="order-card-head">
        <div className="order-card-head-main">
          <Link to={`/orders/${order.id}`} className="order-card-id">
            Đơn #{order.id}
          </Link>
          <p className="order-card-date">{formatOrderDate(order.created_at)}</p>
        </div>
        <div className="order-card-meta">
          <OrderStatusBadge status={order.status} />
          <strong>{formatCurrency(order.total_price)}</strong>
        </div>
      </div>

      <div className="order-card-preview">
        <div className="order-card-thumbs" aria-hidden>
          {previewItems.map((item) => (
            <OrderItemThumb key={item.id} item={item} />
          ))}
          {extraItems > 0 && (
            <span className="order-card-thumb-more">+{extraItems}</span>
          )}
        </div>

        <ul className="order-card-items">
          {previewItems.map((item) => (
            <li key={item.id}>
              <span className="order-card-item-qty">{item.quantity}×</span>
              <span className="order-card-item-name">
                {item.product_name}
                {item.variant_name ? ` · ${item.variant_name}` : ""}
              </span>
            </li>
          ))}
          {extraItems > 0 && (
            <li className="is-muted">và {extraItems} sản phẩm khác</li>
          )}
        </ul>
      </div>

      <div className="order-card-tags">
        <span className="order-card-tag">
          {paymentMethodLabels[order.payment_method] || "COD"}
        </span>
        {order.payment_status && (
          <span
            className={`order-card-tag${
              order.payment_status === "paid" ? " is-paid" : ""
            }`}
          >
            {paymentStatusLabels[order.payment_status] || order.payment_status}
          </span>
        )}
        <span className="order-card-tag">{itemCount} món</span>
        {order.tracking_code && (
          <span className="order-card-tag is-tracking">
            <TruckIcon className="h-3.5 w-3.5" />
            {order.tracking_code}
          </span>
        )}
      </div>

      <div className="order-card-foot">
        <p className="order-card-address">
          Giao tới <strong>{order.city || order.address}</strong>
        </p>
        <Link to={`/orders/${order.id}`} className="order-card-link">
          Xem chi tiết
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function OrderListSkeleton() {
  return (
    <div className="order-skeleton-list">
      {[1, 2, 3].map((item) => (
        <div key={item} className="order-card-skeleton skeleton-shimmer" />
      ))}
    </div>
  );
}

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
            icon={EmptyBoxIcon}
            title="Đăng nhập để xem đơn hàng"
            description="Theo dõi trạng thái giao hàng và lịch sử mua hàng của bạn."
            actionTo="/login?next=/orders"
            actionLabel="Đăng nhập"
            tone="orders"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page order-list-page">
      <OrderListHero orderCount={orders.length} />

      <div className="page-container order-list-body">
        {status === "loading" && <OrderListSkeleton />}

        {status === "error" && (
          <ErrorPanel
            className="order-alert is-error"
            message={error}
            onRetry={() => {
              setStatus("loading");
              getOrders()
                .then((data) => {
                  setOrders(data);
                  setStatus("success");
                  setError("");
                })
                .catch(() => {
                  setError("Không tải được lịch sử đơn hàng.");
                  setStatus("error");
                });
            }}
          />
        )}

        {status === "success" && orders.length === 0 && (
          <EmptyState
            className="order-list-empty"
            icon={EmptyBoxIcon}
            title="Chưa có đơn hàng"
            description="Thêm sản phẩm vào giỏ và thanh toán để tạo đơn đầu tiên."
            actionTo={buildProductsUrl()}
            actionLabel="Khám phá sản phẩm"
            secondaryActionTo="/cart"
            secondaryActionLabel="Xem giỏ hàng"
            tone="orders"
          />
        )}

        <div className="order-list">
          {status === "success" &&
            orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      </div>
    </main>
  );
}

export default OrderHistoryPage;