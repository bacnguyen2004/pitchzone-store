import {
  ClockIcon,
  ContactIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  ReturnBoxIcon,
  SupportIcon,
} from "../components/StoreIcons";

export const contactTopics = [
  { value: "product", label: "Tư vấn chọn sản phẩm / size giày" },
  { value: "order", label: "Đơn hàng & giao hàng" },
  { value: "warranty", label: "Bảo hành & đổi trả" },
  { value: "partnership", label: "Hợp tác đội bóng / CLB" },
  { value: "other", label: "Khác" },
];

export const contactChannels = [
  {
    title: "Gọi hotline",
    description: "Tư vấn size giày, đơn hàng — phản hồi nhanh trong giờ hành chính.",
    valueKey: "hotline",
    hintKey: "hotlineHours",
    Icon: PhoneIcon,
    accent: "from-primary to-primary-hover",
    action: "tel",
  },
  {
    title: "Gửi email",
    description: "Chi tiết yêu cầu — phản hồi trong 24 giờ làm việc.",
    valueKey: "email",
    hintKey: "support",
    Icon: ContactIcon,
    accent: "from-emerald-700 to-emerald-900",
    action: "mailto",
  },
  {
    title: "Store",
    description: "Thử giày, xem áo đấu và phụ kiện tại Quận 1.",
    valueKey: "addressShort",
    hintKey: "store",
    Icon: MapPinIcon,
    accent: "from-teal-600 to-emerald-800",
    action: "none",
  },
  {
    title: "Giờ hỗ trợ",
    description: "Hotline, email và store — lịch rõ ràng mỗi ngày.",
    valueKey: "weekdays",
    hintKey: "support",
    Icon: ClockIcon,
    accent: "from-emerald-600 to-teal-700",
    action: "none",
  },
];

export const contactQuickHelp = [
  {
    title: "Theo dõi đơn hàng",
    description: "Đăng nhập và vào mục Đơn hàng để xem trạng thái giao.",
    to: "/orders",
    Icon: PackageIcon,
  },
  {
    title: "Chính sách đổi trả",
    description: "Đổi trả 7 ngày nếu lỗi NSX — đọc điều kiện trước khi gửi yêu cầu.",
    to: "/policy",
    Icon: ReturnBoxIcon,
  },
  {
    title: "Câu hỏi thường gặp",
    description: "Giải đáp nhanh về mua hàng, size giày và bảo hành.",
    to: "/faq",
    Icon: SupportIcon,
  },
];

export const contactFormTips = [
  "Ghi rõ size chân, mặt sân và vị trí thi đấu nếu cần tư vấn giày.",
  "Nếu hỏi về đơn hàng, kèm mã đơn hoặc email đặt hàng.",
  "Store đông cuối tuần — gọi trước nếu muốn thử mẫu giày cụ thể.",
];

export const contactMiniFaqs = [
  {
    question: "Phản hồi form mất bao lâu?",
    answer: "Trong 24 giờ làm việc qua email. Khẩn gọi hotline 1900 6363.",
  },
  {
    question: "Có tư vấn size giày miễn phí?",
    answer: "Có — mô tả size chân, mặt sân và ngân sách, chúng tôi gợi ý 2–3 mẫu phù hợp.",
  },
  {
    question: "Store có cần đặt lịch?",
    answer: "Không bắt buộc, nhưng nên gọi trước nếu muốn thử giày size hiếm hoặc vào cuối tuần.",
  },
];