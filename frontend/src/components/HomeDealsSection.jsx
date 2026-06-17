import { Link } from "react-router-dom";

import { buildProductsUrl } from "../utils/productFilters";
import AnimateIn from "./AnimateIn";
import DealCountdown from "./DealCountdown";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { ChevronRightIcon } from "./StoreIcons";

const DEAL_LIMIT = 3;

function HomeDealsSection({ promotion, status }) {
  const isLoading = status === "loading";
  const items = promotion?.items || [];
  const visibleDeals = items.slice(0, DEAL_LIMIT);
  const hasDeals = visibleDeals.length > 0;
  const endDate = promotion?.ends_at ? new Date(promotion.ends_at) : null;

  if (!isLoading && !hasDeals) {
    return null;
  }

  return (
    <section id="deals" className="home-deals">
      <div className="page-container section">
        <AnimateIn>
          <div className="deal-header-bar">
            <div className="deal-header-copy">
              <p className="deal-header-eyebrow">
                {promotion?.eyebrow || "Flash sale"}
              </p>
              <h2 className="deal-header-title">
                {promotion?.title || "Deal sốc"}
              </h2>
              {promotion?.description && (
                <p className="deal-header-desc">{promotion.description}</p>
              )}
            </div>

            <div className="deal-header-actions">
              {endDate && <DealCountdown endDate={endDate} variant="compact" />}
              <Link
                to={buildProductsUrl({ on_sale: "true" })}
                className="deal-header-link"
              >
                Xem tất cả deal
                <ChevronRightIcon />
              </Link>
            </div>
          </div>
        </AnimateIn>

        <div className="deal-product-grid">
          {isLoading &&
            Array.from({ length: DEAL_LIMIT }).map((_, index) => (
              <AnimateIn key={index} delay={index * 60}>
                <ProductCardSkeleton compact />
              </AnimateIn>
            ))}

          {!isLoading &&
            visibleDeals.map(({ product }, index) => (
              <AnimateIn key={product.id} delay={index * 60} className="h-full">
                <ProductCard product={product} compact deal />
              </AnimateIn>
            ))}
        </div>
      </div>
    </section>
  );
}

export default HomeDealsSection;