import { Link } from "react-router-dom";

import { buildProductsUrl } from "../utils/productFilters";
import { ChevronRightIcon } from "./StoreIcons";

const quickLinks = [
  {
    label: "Giày đá bóng",
    hint: "Nike · Adidas · Puma",
    slug: "football-boots",
  },
  {
    label: "Quần áo",
    hint: "Áo đấu · Quần short",
    slug: "clothing",
  },
  {
    label: "Phụ kiện",
    hint: "Tất · Bóng · Ống đồng",
    slug: "accessories",
  },
];

function HomeQuickLinks() {
  return (
    <nav
      className="page-container"
      aria-label="Danh mục nhanh"
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {quickLinks.map((item) => (
          <Link
            key={item.slug}
            to={buildProductsUrl({ category: item.slug })}
            className="home-quick-link group"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">
                {item.label}
              </span>
              <span className="block truncate text-xs text-emerald-200/80">
                {item.hint}
              </span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-emerald-300/60 transition duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default HomeQuickLinks;