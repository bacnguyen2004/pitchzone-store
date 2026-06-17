import { Link } from "react-router-dom";

import { categoryDescriptions } from "../config/siteNav";
import { buildProductsUrl } from "../utils/productFilters";
import AnimateIn from "./AnimateIn";
import CategoryMedia from "./CategoryMedia";
import SectionHeader from "./SectionHeader";
import { ChevronRightIcon } from "./StoreIcons";

const bentoLayouts = [
  "col-span-12 sm:col-span-7 sm:row-span-2",
  "col-span-12 sm:col-span-5",
  "col-span-6 sm:col-span-4",
  "col-span-6 sm:col-span-4",
  "col-span-6 sm:col-span-4",
  "col-span-6 sm:col-span-4",
];

const imageHeights = [
  "h-52 sm:h-full sm:min-h-[320px]",
  "h-40 sm:h-44",
  "h-36 sm:h-40",
  "h-36 sm:h-40",
  "h-36 sm:h-40",
  "h-36 sm:h-40",
];

function CategorySkeleton({ tall = false }) {
  return (
    <div className="category-card-sport">
      <div
        className={`skeleton-shimmer ${tall ? "h-52 sm:min-h-[320px]" : "h-36 sm:h-40"}`}
      />
      <div className="space-y-3 p-4">
        <div className="skeleton-shimmer h-5 w-2/3 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
      </div>
    </div>
  );
}

function FeaturedCategories({ categories, status }) {
  const isLoading = status === "loading";
  const hasCategories = categories.length > 0;

  if (!isLoading && !hasCategories) {
    return null;
  }

  const displayCategories = isLoading ? categories : categories.slice(0, 6);

  return (
    <section className="home-categories pitch-pattern border-b border-slate-100/80 bg-gradient-to-b from-white via-emerald-50/25 to-white">
      <div className="page-container">
        <AnimateIn>
          <SectionHeader
            eyebrow="Shop by category"
            title="Trang bị theo vị trí & nhu cầu"
            description="Giày, áo đấu, bóng và phụ kiện — chọn nhanh trước khi ra sân"
            action={
              <Link
                to="/categories"
                className="link-action hidden sm:inline-flex"
              >
                Tất cả danh mục
                <ChevronRightIcon />
              </Link>
            }
          />
        </AnimateIn>

        <div className="mt-8 grid grid-cols-12 gap-3 sm:mt-10 sm:gap-4">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <AnimateIn
                key={index}
                className={bentoLayouts[index]}
                delay={index * 80}
              >
                <CategorySkeleton tall={index === 0} />
              </AnimateIn>
            ))}

          {!isLoading &&
            displayCategories.map((category, index) => (
              <AnimateIn
                key={category.id}
                className={`h-full ${bentoLayouts[index]}`}
                delay={index * 80}
              >
                <Link
                  to={buildProductsUrl({ category: category.slug })}
                  className="category-card-sport group relative block h-full overflow-hidden"
                >
                  <CategoryMedia
                    slug={category.slug}
                    size="lg"
                    variant="photo"
                    showIcon={false}
                    imageClassName={`${imageHeights[index]} w-full object-cover transition duration-500 group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/45 to-emerald-900/10 transition duration-300 group-hover:from-emerald-950/98" />
                  <div className="absolute inset-x-0 bottom-0 p-4 pt-20 sm:p-5 sm:pt-24">
                    <span className="inline-flex rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200 ring-1 ring-emerald-400/30">
                      0{index + 1}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-white sm:text-lg">
                      {category.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-emerald-100/85">
                      {categoryDescriptions[category.slug] ||
                        "Khám phá sản phẩm trong danh mục này."}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 transition duration-300 group-hover:gap-2">
                      Mua ngay
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </AnimateIn>
            ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCategories;