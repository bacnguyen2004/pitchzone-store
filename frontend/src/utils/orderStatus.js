export const orderStatusLabels = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const orderStatusTones = {
  pending: "pending",
  processing: "processing",
  shipping: "shipping",
  completed: "completed",
  cancelled: "cancelled",
};

export const paymentMethodLabels = {
  cod: "Thanh toán khi nhận hàng",
  transfer: "Chuyển khoản ngân hàng",
};

export const ORDER_TIMELINE = [
  { key: "pending", label: "Đã đặt" },
  { key: "processing", label: "Xử lý" },
  { key: "shipping", label: "Giao hàng" },
  { key: "completed", label: "Hoàn tất" },
];