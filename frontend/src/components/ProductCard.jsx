import { Link } from "react-router-dom";

import {
  formatCurrency,
  getMainImage,
  getProductPricing,
  resolveMediaUrl,
} from "../utils/format";
import {
  ChevronRightIcon,
  ImagePlaceholderIcon,
  InStockIcon,
  LowStockIcon,
  OutOfStockIcon,
} from "./StoreIcons";

const NEW_PRODUCT_DAYS = 14;

function isNewProduct(createdAt) {
  if (!createdAt) {
    return false;
  }

  const created = new Date(createdAt);
  const ageDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= NEW_PRODUCT_DAYS;
}

function ProductCardBadges({ isNew, isLowStock, isOutOfStock, discountPercent }) {
  if (isOutOfStock) {
    return null;
  }

  return (
    <div className="product-card-badges">
      {discountPercent > 0 && (
        <span className="product-card-badge product-card-badge-sale">
          -{discountPercent}%
        </span>
      )}
      {isNew && (
        <span className="product-card-badge product-card-badge-new">Mới</span>
      )}
      {isLowStock && (
        <span className="product-card-badge product-card-badge-low">
          <LowStockIcon className="h-3 w-3" />
          Sắp hết
        </span>
      )}
    </div>
  );
}

function ProductCardStock({ isOutOfStock, isLowStock, stock }) {
  if (isOutOfStock) {
    return (
      <span className="product-card-stock product-card-stock-out">
        <OutOfStockIcon className="h-3 w-3" />
        Hết hàng
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span className="product-card-stock product-card-stock-low">
        <LowStockIcon className="h-3 w-3" />
        Còn {stock}
      </span>
    );
  }

  return (
    <span className="product-card-stock product-card-stock-in">
      <InStockIcon className="h-3 w-3" />
      Sẵn hàng
    </span>
  );
}

function ProductCard({ product, deal = false, compact = false }) {
  const mainImage = getMainImage(product);
  const imageUrl = resolveMediaUrl(mainImage?.image);
  const catalogPricing = getProductPricing(product);
  const isDeal = deal || catalogPricing.isDeal;
  const displayPrice = catalogPricing.price;
  const showOriginal = catalogPricing.hasDiscount && catalogPricing.original;
  const originalPrice = catalogPricing.original;
  const savings = showOriginal
    ? Number(originalPrice) - Number(displayPrice)
    : 0;
  const discountPercent = catalogPricing.discountPercent;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const isNew = !isDeal && !catalogPricing.hasDiscount && isNewProduct(product.created_at);

  return (
    <Link
      to={`/products/${product.slug || product.id}`}
      className={[
        "product-card group flex h-full flex-col",
        compact ? "product-card-compact" : "",
        isDeal ? "product-card-deal" : "",
        isOutOfStock ? "is-unavailable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="product-card-visual">
        <div className="product-card-media-glow" aria-hidden />
        <div className="product-card-media-pattern pitch-pattern" aria-hidden />

        <div className="product-card-stage">
          <ProductCardBadges
            isNew={isNew}
            isLowStock={isLowStock}
            isOutOfStock={isOutOfStock}
            discountPercent={discountPercent}
          />

          <div className="product-card-image-wrap">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={mainImage?.alt_text || product.name}
                loading="lazy"
                decoding="async"
                className={`product-card-image ${
                  isOutOfStock ? "is-grayscale" : ""
                }`}
              />
            ) : (
              <div className="product-card-placeholder">
                <ImagePlaceholderIcon className="h-10 w-10 text-slate-300" />
                <span>Chưa có ảnh</span>
              </div>
            )}
          </div>

          {isOutOfStock && (
            <div className="product-card-soldout">
              <span className="product-card-soldout-pill">
                <OutOfStockIcon className="h-3.5 w-3.5" />
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {!isOutOfStock && !compact && (
          <div className="product-card-hover-bar">
            <span>Xem chi tiết</span>
            <ChevronRightIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-topline">
          <span className="product-card-brand">
            {product.brand?.name || "Football Gear"}
          </span>
          {product.category?.name && (
            <span className="product-card-category">{product.category.name}</span>
          )}
        </div>

        <h3 className="product-card-title">{product.name}</h3>

        <div className="product-card-footer">
          <div className="min-w-0 flex-1">
            <div className="product-card-prices">
              <p className="product-card-price">{formatCurrency(displayPrice)}</p>
              {showOriginal && (
                <p className="product-card-price-original">
                  {formatCurrency(originalPrice)}
                </p>
              )}
            </div>

            <div className="product-card-footer-meta">
              <ProductCardStock
                isOutOfStock={isOutOfStock}
                isLowStock={isLowStock}
                stock={product.stock}
              />
              {savings > 0 && (
                <span className="product-card-save">
                  Tiết kiệm {formatCurrency(savings)}
                </span>
              )}
            </div>
          </div>

          <span className="product-card-action" aria-hidden>
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton({ compact = false }) {
  return (
    <div
      className={`product-card overflow-hidden ${compact ? "product-card-compact" : ""}`}
    >
      <div className="product-card-visual">
        <div className="product-card-stage">
          <div className="skeleton-shimmer aspect-square w-full rounded-xl" />
        </div>
      </div>
      <div className="product-card-body space-y-2.5">
        <div className="skeleton-shimmer h-3 w-2/5 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-4/5 rounded" />
        <div className="skeleton-shimmer h-7 w-1/2 rounded" />
      </div>
    </div>
  );
}

export { ProductCardSkeleton };
export default ProductCard;
