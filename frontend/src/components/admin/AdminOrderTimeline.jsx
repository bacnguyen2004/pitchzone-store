import { ORDER_TIMELINE } from "../../utils/orderStatus";

function AdminOrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <p className="admin-order-timeline-cancelled">Đơn hàng đã bị hủy.</p>
    );
  }

  const activeIndex = ORDER_TIMELINE.findIndex((step) => step.key === status);

  return (
    <ol className="admin-order-timeline">
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
            <span className="admin-order-timeline-dot" />
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default AdminOrderTimeline;