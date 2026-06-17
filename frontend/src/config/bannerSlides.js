import { homeImages } from "./homeImages";

export const bannerSlides = [
  {
    id: "football-boots",
    image: homeImages.banner.boots,
    alt: "Giày đá bóng chính hãng",
    eyebrow: "Giày đá bóng",
    title: "Tăng tốc trên mọi mặt sân",
    description:
      "Giày đá bóng chính hãng từ Nike, Adidas, Puma — chọn đôi phù hợp phong cách chơi của bạn.",
    cta: { label: "Xem giày đá bóng", to: "/products?category=football-boots" },
  },
  {
    id: "clothing",
    image: homeImages.banner.jerseys,
    alt: "Áo đấu và bóng đá",
    eyebrow: "Áo đấu & Bóng",
    title: "Ra sân đúng chất, đúng team",
    description:
      "Áo sân nhà, sân khách và bóng thi đấu size 5 — đủ bộ cho buổi tập và trận đấu.",
    cta: { label: "Khám phá ngay", to: "/products?category=clothing" },
  },
  {
    id: "stadium",
    image: homeImages.banner.stadium,
    alt: "Sân bóng và thi đấu",
    eyebrow: "PitchZone Store",
    title: "Trang bị toàn diện cho cầu thủ",
    description:
      "Quần short, tất, phụ kiện và đồ tập — mọi thứ bạn cần trước khi bước lên sân.",
    cta: { label: "Xem tất cả", to: "/products" },
  },
];
