import { Link } from "react-router-dom";

import { buildProductsUrl } from "../utils/productFilters";
import AnimateIn from "./AnimateIn";
import SectionHeader from "./SectionHeader";

function BrandSkeleton() {
  return (
    <span className="skeleton-shimmer inline-block h-12 w-32 rounded-xl bg-slate-700/80" />
  );
}

function BrandStrip({ brands, status }) {
  const isLoading = status === "loading";
  const hasBrands = brands.length > 0;

  if (!isLoading && !hasBrands) {
    return null;
  }

  return (
    <section className="home-brand-band section-home !py-12 sm:!py-14">
      <div className="page-container relative z-10">
        <AnimateIn>
          <SectionHeader
            eyebrow="Official partners"
            title="Thương hiệu bạn tin dùng"
            description="Nike, Adidas, Puma và nhiều hãng hàng đầu — lọc nhanh theo thương hiệu yêu thích"
            align="center"
            light
            accent="emerald"
          />
        </AnimateIn>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <AnimateIn key={index} delay={index * 50}>
                <BrandSkeleton />
              </AnimateIn>
            ))}

          {!isLoading &&
            brands.map((brand, index) => (
              <AnimateIn key={brand.id} delay={index * 50}>
                <Link
                  to={buildProductsUrl({ brand: brand.slug })}
                  className="brand-pill-sport"
                >
                  {brand.name}
                </Link>
              </AnimateIn>
            ))}
        </div>
      </div>
    </section>
  );
}

export default BrandStrip;