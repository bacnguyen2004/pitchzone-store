export const adminOrderStatus = {
  pending: { label: "Chờ xử lý", badge: "is-pending" },
  processing: { label: "Đang xử lý", badge: "is-processing" },
  shipping: { label: "Đang giao", badge: "is-shipping" },
  completed: { label: "Hoàn thành", badge: "is-completed" },
  cancelled: { label: "Đã hủy", badge: "is-cancelled" },
};

export const adminOrderStatusOptions = Object.entries(adminOrderStatus).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
);