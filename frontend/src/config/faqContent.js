import {
  ContactIcon,
  PackageIcon,
  ReturnBoxIcon,
  ShieldCheckIcon,
  SupportIcon,
  TruckIcon,
} from "../components/StoreIcons";

export const faqCategories = [
  { id: "all", label: "Tất cả", Icon: SupportIcon },
  { id: "shopping", label: "Mua hàng", Icon: PackageIcon },
  { id: "shipping", label: "Giao hàng", Icon: TruckIcon },
  { id: "returns", label: "Đổi trả", Icon: ReturnBoxIcon },
  { id: "account", label: "Tài khoản", Icon: ShieldCheckIcon },
  { id: "product", label: "Sản phẩm", Icon: ContactIcon },
];

export const faqItems = [
  {
    id: "authentic",
    category: "product",
    popular: true,
    question: "Sản phẩm PitchZone có chính hãng không?",
    answer:
      "Có. PitchZone chỉ kinh doanh sản phẩm có nguồn gốc rõ ràng từ các nhà phân phối uy tín. Mỗi trang sản phẩm hiển thị đầy đủ thương hiệu, mô tả và chính sách bảo hành theo hãng.",
  },
  {
    id: "how-to-buy",
    category: "shopping",
    popular: true,
    question: "Làm sao để mua hàng trên website?",
    answer:
      "Chọn sản phẩm → Thêm vào giỏ hàng → Đăng nhập hoặc đăng ký → Vào giỏ hàng → Thanh toán (checkout) → Điền địa chỉ và xác nhận đơn. Đơn hàng được lưu tại mục Đơn hàng trên header.",
  },
  {
    id: "login-required",
    category: "account",
    question: "Tôi có cần đăng nhập để xem sản phẩm không?",
    answer:
      "Không. Bạn có thể duyệt sản phẩm, danh mục và tìm kiếm mà không cần tài khoản. Đăng nhập chỉ cần khi thêm giỏ hàng, đặt hàng và theo dõi lịch sử đơn.",
  },
  {
    id: "payment-methods",
    category: "shopping",
    popular: true,
    question: "Website hỗ trợ những hình thức thanh toán nào?",
    answer:
      "Hiện hỗ trợ thanh toán khi nhận hàng (COD) và VNPay (thẻ ATM, Visa, Mastercard, QR). Sau khi đặt hàng, bạn nhận email xác nhận.",
  },
  {
    id: "track-order",
    category: "shopping",
    question: "Làm sao theo dõi đơn hàng?",
    answer:
      "Đăng nhập tài khoản → bấm Đơn hàng trên header → chọn đơn cần xem. Trang chi tiết hiển thị trạng thái, sản phẩm, tổng tiền và thông tin giao hàng.",
  },
  {
    id: "cancel-order",
    category: "shopping",
    question: "Tôi có thể hủy đơn sau khi đặt không?",
    answer:
      "Liên hệ hotline hoặc email ngay sau khi đặt — nếu đơn chưa được xử lý giao, chúng tôi hỗ trợ hủy miễn phí. Đơn đã bàn giao vận chuyển có thể không hủy được; bạn có thể từ chối nhận theo quy định COD.",
  },
  {
    id: "shipping-time",
    category: "shipping",
    popular: true,
    question: "Giao hàng mất bao lâu?",
    answer:
      "Nội thành TP.HCM: 1–2 ngày làm việc. Các tỉnh thành khác: 2–5 ngày làm việc. Thời gian có thể thay đổi nhẹ vào dịp cao điểm hoặc thời tiết xấu — chúng tôi sẽ thông báo nếu có chậm trễ.",
  },
  {
    id: "free-shipping",
    category: "shipping",
    question: "Khi nào được miễn phí vận chuyển?",
    answer:
      "Đơn hàng từ 2.000.000đ được miễn phí giao tiêu chuẩn toàn quốc. Đơn dưới mức này có thể phát sinh phí ship theo khu vực — hiển thị rõ trước khi xác nhận đơn.",
  },
  {
    id: "shipping-fee",
    category: "shipping",
    question: "Phí giao hàng tính như thế nào?",
    answer:
      "Phí ship phụ thuộc khu vực và trọng lượng đơn hàng. Bạn thấy tổng chi phí cuối cùng tại bước checkout trước khi đặt — không có phí ẩn sau khi xác nhận.",
  },
  {
    id: "return-policy",
    category: "returns",
    popular: true,
    question: "Chính sách đổi trả như thế nào?",
    answer:
      "Sản phẩm lỗi do nhà sản xuất được đổi mới hoặc hoàn tiền trong 7 ngày kể từ khi nhận hàng. Sản phẩm cần còn nguyên tem, chưa qua sử dụng và đầy đủ phụ kiện. Chi tiết xem trang Chính sách.",
  },
  {
    id: "warranty",
    category: "returns",
    question: "Bảo hành được bao lâu?",
    answer:
      "Thời gian bảo hành theo chính sách từng hãng (giày, áo, bóng thường 3–12 tháng tùy loại). PitchZone hỗ trợ kích hoạt bảo hành và hướng dẫn trung tâm bảo hành gần nhất.",
  },
  {
    id: "wrong-item",
    category: "returns",
    question: "Nhận sai hoặc thiếu sản phẩm thì làm sao?",
    answer:
      "Chụp ảnh kiện hàng và liên hệ hotline/email trong vòng 48 giờ. Chúng tôi xác minh và gửi bổ sung hoặc đổi đúng sản phẩm — miễn phí vận chuyển phát sinh do lỗi cửa hàng.",
  },
  {
    id: "register",
    category: "account",
    question: "Làm sao tạo tài khoản?",
    answer:
      "Bấm Đăng ký trên header → điền username, email và mật khẩu → xác nhận. Sau đó đăng nhập để thêm giỏ, đặt hàng và lưu lịch sử mua.",
  },
  {
    id: "forgot-password",
    category: "account",
    question: "Quên mật khẩu thì xử lý ra sao?",
    answer:
      "Liên hệ support qua email hoặc hotline kèm email đăng ký. Đội ngũ xác minh danh tính và hướng dẫn đặt lại mật khẩu an toàn.",
  },
  {
    id: "advise-boots",
    category: "product",
    question: "Tôi chưa biết chọn size giày — có tư vấn miễn phí không?",
    answer:
      "Có. Gọi hotline 1900 6363 hoặc gửi form Liên hệ kèm size chân, mặt sân (cỏ tự nhiên, sân nhân tạo) và vị trí thi đấu. Chúng tôi gợi ý 2–3 mẫu phù hợp, không ép mua.",
  },
  {
    id: "stock",
    category: "product",
    question: "Số lượng tồn kho trên web có chính xác không?",
    answer:
      "Có. Hệ thống cập nhật tồn kho realtime — nếu hết hàng, nút mua sẽ bị vô hiệu và hiển thị trạng thái Hết hàng. Trường hợp hiếm (trùng đơn), chúng tôi liên hệ đề xuất thay thế hoặc hoàn tiền.",
  },
  {
    id: "store",
    category: "product",
    question: "Có thể ghé store trải nghiệm không?",
    answer:
      "Có. Store tại Tầng 3, 42 Nguyễn Huệ, Quận 1, TP.HCM — mở 9:00–20:00. Nên gọi trước nếu muốn thử mẫu cụ thể hoặc vào cuối tuần.",
  },
  {
    id: "price-match",
    category: "shopping",
    question: "Giá trên website có thay đổi không?",
    answer:
      "Giá có thể điều chỉnh theo chương trình khuyến mãi hoặc biến động từ nhà phân phối. Giá áp dụng là giá tại thời điểm bạn xác nhận đơn hàng thành công.",
  },
];

export const faqQuickLinks = [
  {
    title: "Liên hệ hỗ trợ",
    description: "Gửi form hoặc gọi hotline — phản hồi trong 24h.",
    to: "/contact",
    Icon: ContactIcon,
  },
  {
    title: "Chính sách cửa hàng",
    description: "Đổi trả, giao hàng, bảo mật và điều khoản sử dụng.",
    to: "/policy",
    Icon: ShieldCheckIcon,
  },
  {
    title: "Xem sản phẩm",
    description: "Duyệt giày, áo đấu, bóng và lọc theo nhu cầu.",
    to: "/products",
    Icon: PackageIcon,
  },
];