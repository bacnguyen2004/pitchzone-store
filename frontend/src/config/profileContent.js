import { LockIcon, UserIcon } from "../components/AuthIcons";
import { MapPinIcon, PackageIcon } from "../components/StoreIcons";

export const profileSections = [
  {
    id: "account",
    label: "Tài khoản",
    description: "Email và tên đăng nhập",
    Icon: UserIcon,
  },
  {
    id: "password",
    label: "Mật khẩu",
    description: "Đổi mật khẩu đăng nhập",
    Icon: LockIcon,
  },
  {
    id: "addresses",
    label: "Địa chỉ",
    description: "Địa chỉ nhận hàng",
    Icon: MapPinIcon,
  },
  {
    id: "orders",
    label: "Đơn hàng",
    description: "Đơn gần đây",
    Icon: PackageIcon,
  },
];