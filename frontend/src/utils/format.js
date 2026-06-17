export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export function resolveMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `http://127.0.0.1:8000${path}`;
}

export function getMainImage(product) {
  return product?.images?.find((image) => image.is_main) || product?.images?.[0];
}

export function getVariantPricing(variant) {
  const effective = Number(
    variant?.effective_price ?? variant?.price ?? 0,
  );
  const original = Number(
    variant?.compare_at_price ?? variant?.price ?? effective,
  );
  const discountPercent = Number(variant?.discount_percent ?? 0);
  const hasDiscount =
    Boolean(variant?.is_on_sale) ||
    (original > effective && effective > 0) ||
    discountPercent > 0;

  return {
    price: effective,
    original: hasDiscount ? original : null,
    hasDiscount,
    discountPercent:
      discountPercent ||
      (hasDiscount && original > 0
        ? Math.round((1 - effective / original) * 100)
        : 0),
    isDeal: Boolean(variant?.is_deal),
  };
}

export function getProductPricing(product) {
  const price = Number(product?.price ?? 0);
  const original = Number(product?.compare_at_price ?? product?.base_price ?? price);
  const discountPercent = Number(product?.discount_percent ?? 0);
  const hasDiscount =
    Boolean(product?.is_on_sale) ||
    (original > price && price > 0) ||
    discountPercent > 0;

  return {
    price,
    original: hasDiscount ? original : null,
    hasDiscount,
    discountPercent:
      discountPercent ||
      (hasDiscount && original > 0
        ? Math.round((1 - price / original) * 100)
        : 0),
    isDeal: Boolean(product?.is_deal),
  };
}

