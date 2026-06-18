import {
  orderStatusLabels,
  orderStatusTones,
} from "../utils/orderStatus";

function OrderStatusBadge({ status, size = "md", className = "" }) {
  const tone = orderStatusTones[status] || "pending";
  const label = orderStatusLabels[status] || status;
  const isActive = ["pending", "processing", "shipping"].includes(status);

  return (
    <span
      className={`order-status-badge is-${tone} is-${size}${
        isActive ? " is-active" : ""
      } ${className}`.trim()}
    >
      <span className="order-status-badge-dot" aria-hidden />
      {label}
    </span>
  );
}

export default OrderStatusBadge;