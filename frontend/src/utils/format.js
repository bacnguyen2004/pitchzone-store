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

