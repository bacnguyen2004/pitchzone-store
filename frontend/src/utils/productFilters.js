export const defaultOrdering = "-created_at";

export function filtersFromParams(searchParams) {
  return {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    in_stock: searchParams.get("in_stock") === "true" ? "true" : "",
    on_sale: searchParams.get("on_sale") === "true" ? "true" : "",
    ordering: searchParams.get("ordering") || defaultOrdering,
  };
}

export function hasActiveFilters(filters, page) {
  return (
    page > 1 ||
    filters.search !== "" ||
    filters.category !== "" ||
    filters.brand !== "" ||
    filters.min_price !== "" ||
    filters.max_price !== "" ||
    filters.in_stock !== "" ||
    filters.on_sale !== "" ||
    filters.ordering !== defaultOrdering
  );
}

export function getActiveFilterChips(filters, { categories = [], brands = [] } = {}) {
  const chips = [];

  if (filters.search) {
    chips.push({
      key: "search",
      label: `Từ khóa: ${filters.search}`,
      clear: { search: "" },
    });
  }

  if (filters.category) {
    const name =
      categories.find((item) => item.slug === filters.category)?.name ||
      filters.category;
    chips.push({
      key: "category",
      label: name,
      clear: { category: "" },
    });
  }

  if (filters.brand) {
    const name =
      brands.find((item) => item.slug === filters.brand)?.name || filters.brand;
    chips.push({
      key: "brand",
      label: name,
      clear: { brand: "" },
    });
  }

  if (filters.min_price || filters.max_price) {
    const min = filters.min_price
      ? `${Number(filters.min_price).toLocaleString("vi-VN")}đ`
      : "0đ";
    const max = filters.max_price
      ? `${Number(filters.max_price).toLocaleString("vi-VN")}đ`
      : "∞";
    chips.push({
      key: "price",
      label: `Giá ${min} – ${max}`,
      clear: { min_price: "", max_price: "" },
    });
  }

  if (filters.in_stock === "true") {
    chips.push({
      key: "in_stock",
      label: "Còn hàng",
      clear: { in_stock: "" },
    });
  }

  if (filters.on_sale === "true") {
    chips.push({
      key: "on_sale",
      label: "Đang giảm giá",
      clear: { on_sale: "" },
    });
  }

  if (filters.ordering !== defaultOrdering) {
    const orderingLabels = {
      "-created_at": "Mới nhất",
      "-sales": "Bán chạy",
      price: "Giá thấp → cao",
      "-price": "Giá cao → thấp",
      name: "Tên A–Z",
    };

    chips.push({
      key: "ordering",
      label: orderingLabels[filters.ordering] || "Đã sắp xếp",
      clear: { ordering: defaultOrdering },
    });
  }

  return chips;
}

export function buildProductsUrl(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `/products?${query}` : "/products";
}