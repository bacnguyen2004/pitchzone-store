import { UserIcon } from "../components/AuthIcons";
import {
  BrandIcon,
  CategoryIcon,
  GridIcon,
  PackageIcon,
  ProductsIcon,
  SparklesIcon,
  TagIcon,
} from "../components/StoreIcons";

export const adminNavGroups = [
  {
    label: "Tổng quan",
    items: [
      {
        to: "/admin",
        label: "Dashboard",
        end: true,
        Icon: GridIcon,
      },
      {
        to: "/admin/orders",
        label: "Đơn hàng",
        Icon: PackageIcon,
      },
    ],
  },
  {
    label: "Cửa hàng",
    items: [
      {
        to: "/admin/products",
        label: "Sản phẩm",
        Icon: ProductsIcon,
      },
      {
        to: "/admin/categories",
        label: "Danh mục",
        Icon: CategoryIcon,
      },
      {
        to: "/admin/brands",
        label: "Thương hiệu",
        Icon: BrandIcon,
      },
    ],
  },
  {
    label: "Khuyến mãi",
    items: [
      {
        to: "/admin/promotions",
        label: "Deal sốc",
        Icon: SparklesIcon,
      },
      {
        to: "/admin/vouchers",
        label: "Voucher",
        Icon: TagIcon,
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        to: "/admin/users",
        label: "Người dùng",
        Icon: UserIcon,
      },
    ],
  },
];

export const adminNavItems = adminNavGroups.flatMap((group) => group.items);