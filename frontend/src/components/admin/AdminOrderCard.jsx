import OrderStatusBadge from "../OrderStatusBadge";
import { formatCurrency } from "../../utils/format";
import {
  paymentMethodLabels,
  paymentStatusLabels,
} from "../../utils/orderStatus";

function formatShortDate(value) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminOrderCard({ order, isSelected, onSelect }) {
  const itemCount = (order.items || []).reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const previewItems = (order.items || []).slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className={`admin-order-card${isSelected ? " is-selected" : ""}`}
    >
      <div className="admin-order-card-top">
        <div className="min-w-0 text-left">
          <p className="admin-order-card-id">#{order.id}</p>
          <p className="admin-order-card-customer">{order.full_name}</p>
        </div>
        <div className="admin-order-card-top-end">
          <OrderStatusBadge status={order.status} size="sm" />
          <strong className="admin-order-card-price">
            {formatCurrency(order.total_price)}
          </strong>
        </div>
      </div>

      <div className="admin-order-card-meta">
        <span>{order.phone}</span>
        <span>·</span>
        <span>{itemCount} SP</span>
        <span>·</span>
        <span>
          {paymentMethodLabels[order.payment_method] || "COD"}
          {order.payment_method === "vnpay" && order.payment_status && (
            <> · {paymentStatusLabels[order.payment_status] || order.payment_status}</>
          )}
        </span>
        <span>·</span>
        <span>{formatShortDate(order.created_at)}</span>
      </div>

      {previewItems.length > 0 && (
        <ul className="admin-order-card-preview">
          {previewItems.map((item) => (
            <li key={item.id}>
              {item.quantity}× {item.product_name}
              {item.variant_name ? ` · ${item.variant_name}` : ""}
            </li>
          ))}
          {(order.items || []).length > 2 && (
            <li className="is-more">
              +{(order.items || []).length - 2} sản phẩm khác
            </li>
          )}
        </ul>
      )}
    </button>
  );
}

export default AdminOrderCard;