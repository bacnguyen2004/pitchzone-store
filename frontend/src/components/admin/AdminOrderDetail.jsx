import OrderStatusBadge from "../OrderStatusBadge";
import { formatCurrency } from "../../utils/format";
import {
  paymentMethodLabels,
  paymentStatusLabels,
} from "../../utils/orderStatus";
import AdminOrderStatusActions from "./AdminOrderStatusActions";
import AdminOrderTimeline from "./AdminOrderTimeline";

function formatOrderDate(value) {
  return new Date(value).toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminOrderDetail({
  order,
  onClose,
  onStatusChange,
  isUpdating = false,
  isMobile = false,
}) {
  if (!order) {
    return (
      <div className="admin-order-detail-empty">
        <p className="admin-order-detail-empty-title">Chọn một đơn hàng</p>
        <p className="admin-order-detail-empty-desc">
          Bấm đơn bên trái để xem chi tiết, sản phẩm và cập nhật trạng thái.
        </p>
      </div>
    );
  }

  const itemCount = (order.items || []).reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className={`admin-order-detail${isMobile ? " is-mobile" : ""}`}>
      <header className="admin-order-detail-head">
        <div className="min-w-0">
          <p className="admin-order-detail-eyebrow">Đơn hàng #{order.id}</p>
          <div className="admin-order-detail-head-row">
            <h2>{formatCurrency(order.total_price)}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="admin-order-detail-date">{formatOrderDate(order.created_at)}</p>
        </div>
        {isMobile && onClose && (
          <button type="button" onClick={onClose} className="admin-order-detail-close">
            Đóng
          </button>
        )}
      </header>

      <div className="admin-order-detail-body">
        <section className="admin-order-detail-block">
          <h3>Cập nhật trạng thái</h3>
          <AdminOrderStatusActions
            value={order.status}
            disabled={isUpdating}
            onChange={(nextStatus) => onStatusChange?.(order.id, nextStatus)}
          />
          {isUpdating && <p className="admin-order-detail-saving">Đang lưu...</p>}
        </section>

        <section className="admin-order-detail-block">
          <h3>Tiến độ</h3>
          <AdminOrderTimeline status={order.status} />
          {order.tracking_code && (
            <div className="admin-order-detail-tracking">
              <p>
                Mã vận đơn <strong>{order.tracking_code}</strong>
                {order.carrier ? ` · ${order.carrier.toUpperCase()}` : ""}
              </p>
              {order.carrier_status && (
                <p className="text-xs text-slate-500">GHN: {order.carrier_status}</p>
              )}
            </div>
          )}
        </section>

        <section className="admin-order-detail-block">
          <h3>Khách hàng</h3>
          <dl className="admin-order-detail-facts">
            <div>
              <dt>Người nhận</dt>
              <dd>{order.full_name}</dd>
            </div>
            <div>
              <dt>Số điện thoại</dt>
              <dd>{order.phone}</dd>
            </div>
            <div>
              <dt>Tài khoản</dt>
              <dd>{order.user?.username || "—"}</dd>
            </div>
            {order.user?.email && (
              <div>
                <dt>Email</dt>
                <dd>{order.user.email}</dd>
              </div>
            )}
            <div>
              <dt>Địa chỉ giao</dt>
              <dd>
                {order.address}
                {order.city ? `, ${order.city}` : ""}
              </dd>
            </div>
          </dl>
        </section>

        <section className="admin-order-detail-block">
          <h3>Sản phẩm · {itemCount} SP</h3>
          <ul className="admin-order-detail-items">
            {(order.items || []).map((item) => (
              <li key={item.id}>
                <div className="min-w-0 flex-1">
                  <p className="admin-order-detail-item-name">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="admin-order-detail-item-variant">{item.variant_name}</p>
                  )}
                  <p className="admin-order-detail-item-qty">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="admin-order-detail-item-total">
                  {formatCurrency(item.total_price)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-order-detail-block">
          <h3>Thanh toán</h3>
          <dl className="admin-order-detail-checkout">
            <div>
              <dt>Tạm tính</dt>
              <dd>{formatCurrency(order.subtotal ?? order.total_price)}</dd>
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
                <dd className="is-discount">-{formatCurrency(order.discount_amount)}</dd>
              </div>
            )}
            <div>
              <dt>Hình thức</dt>
              <dd>{paymentMethodLabels[order.payment_method] || order.payment_method}</dd>
            </div>
            {order.payment_status && (
              <div>
                <dt>Trạng thái TT</dt>
                <dd>
                  {paymentStatusLabels[order.payment_status] || order.payment_status}
                </dd>
              </div>
            )}
            <div className="is-total">
              <dt>Tổng cộng</dt>
              <dd>{formatCurrency(order.total_price)}</dd>
            </div>
          </dl>
        </section>

        {order.note && (
          <section className="admin-order-detail-block">
            <h3>Ghi chú</h3>
            <p className="admin-order-detail-note">{order.note}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminOrderDetail;