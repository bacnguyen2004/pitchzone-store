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
  vnpay: "VNPay",
};

export const paymentStatusLabels = {
  unpaid: "Chưa thanh toán",
  pending: "Chờ xác nhận",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
};

export const orderStatusDescriptions = {
  pending: "Đơn đã được ghi nhận, chờ xác nhận",
  processing: "Đang chuẩn bị và đóng gói",
  shipping: "Đơn đang trên đường giao",
  completed: "Giao hàng thành công",
  cancelled: "Đơn đã được hủy",
};

export const ORDER_TIMELINE = [
  { key: "pending", label: "Đã đặt" },
  { key: "processing", label: "Xử lý" },
  { key: "shipping", label: "Giao hàng" },
  { key: "completed", label: "Hoàn tất" },
];