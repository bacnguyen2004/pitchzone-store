import {
  PackageIcon,
  ReturnBoxIcon,
  ShieldCheckIcon,
  SupportIcon,
  TruckIcon,
} from "../components/StoreIcons";

export const policyLastUpdated = "15/06/2026";

export const policyHighlights = [
  {
    title: "Đổi trả 7 ngày",
    description: "Lỗi NSX — đổi mới hoặc hoàn tiền",
    Icon: ReturnBoxIcon,
  },
  {
    title: "Giao 2–5 ngày",
    description: "Miễn phí ship đơn từ 2 triệu",
    Icon: TruckIcon,
  },
  {
    title: "Chính hãng",
    description: "Nike, Adidas, Puma — bảo hành hãng",
    Icon: ShieldCheckIcon,
  },
  {
    title: "Hỗ trợ tư vấn",
    description: "Hotline 8:00–21:00, email 24h",
    Icon: SupportIcon,
  },
];

export const policySections = [
  {
    id: "purchase",
    title: "Chính sách mua hàng",
    Icon: PackageIcon,
    accent: "from-primary to-primary-hover",
    summary:
      "Quy định về đặt hàng, xác nhận đơn, giá sản phẩm và trách nhiệm của khách hàng khi mua đồ bóng đá tại PitchZone.",
    points: [
      "Khách hàng cần đăng ký hoặc đăng nhập tài khoản để thêm sản phẩm vào giỏ và hoàn tất đặt hàng.",
      "Giá hiển thị trên website là giá bán tại thời điểm bạn xem — giá áp dụng chính thức là giá tại thời điểm xác nhận đơn thành công.",
      "Đơn hàng được coi là hợp lệ sau khi bạn hoàn tất bước checkout và nhận email xác nhận từ PitchZone.",
      "PitchZone có quyền từ chối hoặc hủy đơn nếu phát hiện thông tin sai lệch, gian lận thanh toán hoặc sản phẩm hết tồn kho sau khi đã thông báo.",
      "Với giày và quần áo có size, vui lòng kiểm tra kỹ size trước khi đặt. Liên hệ tư vấn miễn phí nếu chưa chắc chắn.",
      "Mỗi tài khoản chịu trách nhiệm bảo mật thông tin đăng nhập. Mọi giao dịch phát sinh từ tài khoản được xem là do chủ tài khoản thực hiện.",
    ],
  },
  {
    id: "payment",
    title: "Chính sách thanh toán",
    Icon: ShieldCheckIcon,
    accent: "from-emerald-700 to-emerald-900",
    summary:
      "Các hình thức thanh toán được chấp nhận và quy trình xác nhận giao dịch.",
    points: [
      "Thanh toán khi nhận hàng (COD): thanh toán trực tiếp cho nhân viên giao hàng khi kiểm tra và nhận sản phẩm.",
      "VNPay: thanh toán online qua thẻ ATM, Visa, Mastercard hoặc QR. Đơn được xử lý sau khi VNPay xác nhận thanh toán thành công.",
      "PitchZone không thu thêm phí ẩn ngoài giá sản phẩm và phí vận chuyển (nếu có) hiển thị tại checkout.",
      "Hóa đơn bán hàng điện tử hoặc biên nhận được cung cấp theo yêu cầu trong vòng 7 ngày kể từ ngày giao hàng thành công.",
    ],
  },
  {
    id: "shipping",
    title: "Chính sách giao hàng",
    Icon: TruckIcon,
    accent: "from-teal-600 to-emerald-800",
    summary:
      "Phạm vi giao hàng, thời gian và phí vận chuyển áp dụng trên toàn quốc.",
    points: [
      "Nội thành TP.HCM: giao trong 1–2 ngày làm việc kể từ khi đơn được xác nhận.",
      "Các tỉnh thành khác: giao trong 2–5 ngày làm việc tùy khu vực.",
      "Miễn phí vận chuyển tiêu chuẩn cho đơn hàng từ 2.000.000đ trở lên.",
      "Giày, áo đấu và bóng được đóng gói cẩn thận, chống ẩm và va đập. Khách được kiểm tra tình trạng bên ngoài trước khi thanh toán COD.",
      "Trường hợp chậm giao do thiên tai hoặc sự cố vận chuyển — PitchZone chủ động thông báo và phối hợp xử lý.",
      "PitchZone không chịu trách nhiệm nếu khách cung cấp sai địa chỉ hoặc không liên lạc được tại thời điểm giao hàng sau 3 lần liên hệ.",
    ],
  },
  {
    id: "returns",
    title: "Chính sách đổi trả & bảo hành",
    Icon: ReturnBoxIcon,
    accent: "from-emerald-600 to-teal-700",
    summary:
      "Điều kiện đổi trả, hoàn tiền và bảo hành sản phẩm chính hãng.",
    points: [
      "Đổi trả trong 7 ngày kể từ ngày nhận hàng đối với sản phẩm lỗi do nhà sản xuất (đường may, keo, đế giày, sai model).",
      "Sản phẩm đổi trả phải còn nguyên tem, hộp (nếu có), chưa qua sử dụng thi đấu và đầy đủ phụ kiện kèm theo.",
      "Giày và quần áo đã qua sử dụng, có dấu hiệu mặc thử ngoài store PitchZone không được đổi vì thay đổi ý.",
      "Hoàn tiền được xử lý trong 5–7 ngày làm việc qua phương thức thanh toán ban đầu sau khi PitchZone nhận và kiểm tra hàng hoàn.",
      "Bảo hành chính hãng theo thời gian quy định của từng nhà sản xuất (giày, áo, bóng). PitchZone hỗ trợ tiếp nhận và chuyển trung tâm bảo hành ủy quyền.",
      "Phụ kiện (tất, ống đồng, túi đựng giày) chỉ đổi trả nếu lỗi NSX, không đổi vì không vừa ý về cảm giác sử dụng.",
    ],
  },
  {
    id: "privacy",
    title: "Bảo mật thông tin cá nhân",
    Icon: ShieldCheckIcon,
    accent: "from-primary to-emerald-800",
    summary:
      "Cam kết thu thập, sử dụng và bảo vệ dữ liệu khách hàng.",
    points: [
      "PitchZone thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, email, số điện thoại, địa chỉ giao hàng.",
      "Mật khẩu tài khoản được mã hóa (hash) phía server — PitchZone không lưu mật khẩu dạng văn bản thuần.",
      "Phiên đăng nhập sử dụng JWT với thời hạn xác định. Khách nên đăng xuất khi dùng thiết bị chung.",
      "Thông tin cá nhân không được bán hoặc chia sẻ cho bên thứ ba vì mục đích marketing mà không có sự đồng ý của bạn.",
      "Dữ liệu đơn hàng được lưu để hỗ trợ bảo hành, đổi trả và tra cứu lịch sử mua — bạn có thể yêu cầu cập nhật thông tin qua email support.",
      "PitchZone áp dụng biện pháp kỹ thuật hợp lý để bảo vệ hệ thống khỏi truy cập trái phép.",
    ],
  },
  {
    id: "terms",
    title: "Điều khoản sử dụng website",
    Icon: SupportIcon,
    accent: "from-emerald-800 to-slate-900",
    summary:
      "Quyền và nghĩa vụ khi sử dụng website PitchZone.",
    points: [
      "Người dùng cam kết cung cấp thông tin chính xác khi đăng ký và đặt hàng.",
      "Nghiêm cấm sử dụng website để gian lận, spam, tấn công hệ thống hoặc khai thác lỗ hổng bảo mật.",
      "Nội dung website (hình ảnh, mô tả, logo) thuộc quyền sở hữu PitchZone hoặc đối tác — không sao chép cho mục đích thương mại khi chưa được phép.",
      "PitchZone có quyền tạm khóa hoặc vô hiệu hóa tài khoản vi phạm điều khoản mà không cần báo trước.",
      "PitchZone có quyền cập nhật chính sách. Phiên bản mới có hiệu lực khi đăng tải trên trang này kèm ngày cập nhật.",
      "Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương lượng. Không giải quyết được sẽ theo pháp luật Việt Nam.",
    ],
  },
];

export const policyRelatedLinks = [
  { label: "Câu hỏi thường gặp", to: "/faq" },
  { label: "Liên hệ hỗ trợ", to: "/contact" },
  { label: "Giới thiệu PitchZone", to: "/about" },
];