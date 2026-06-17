import { Link } from "react-router-dom";

import { buildProductsUrl } from "../utils/productFilters";
import AnimateIn from "./AnimateIn";
import HomeSectionBanner from "./HomeSectionBanner";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import SectionHeader from "./SectionHeader";
import { ChevronRightIcon } from "./StoreIcons";

const sectionThemes = {
  new: {
    banner: "emerald",
    body: "home-section-body-emerald",
    link: "text-emerald-300 hover:text-white",
    sectionClass: "home-products border-b border-slate-100/80",
    accent: "emerald",
  },
  bestseller: {
    banner: "amber",
    body: "home-section-body-amber",
    link: "text-amber-100 hover:text-white",
    sectionClass: "home-bestsellers border-b border-slate-100/80",
    accent: "amber",
  },
};

function FeaturedProducts({
  products,
  status,
  id = "products",
  eyebrow = "Match day ready",
  title = "Hàng mới về cửa hàng",
  description = "Giày, áo đấu và phụ kiện vừa được nhập — sẵn sàng cho buổi tập và trận đấu tới",
  variant = "new",
}) {
  const isLoading = status === "loading";
  const theme = sectionThemes[variant] || sectionThemes.new;

  return (
    <section id={id} className={theme.sectionClass}>
      <HomeSectionBanner variant={theme.banner}>
        <AnimateIn>
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            light
            accent={theme.accent}
            action={
              <Link
                to={buildProductsUrl()}
                className={`inline-flex items-center gap-1 text-sm font-semibold transition ${theme.link}`}
              >
                Xem tất cả
                <ChevronRightIcon />
              </Link>
            }
          />
        </AnimateIn>
      </HomeSectionBanner>

      <div className={`home-section-body ${theme.body}`}>
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <AnimateIn key={index} delay={index * 80}>
                <ProductCardSkeleton />
              </AnimateIn>
            ))}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {products.map((product, index) => (
              <AnimateIn key={product.id} className="h-full" delay={index * 80}>
                <ProductCard product={product} />
              </AnimateIn>
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <p className="text-sm text-slate-500">Chưa có sản phẩm.</p>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;