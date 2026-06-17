import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getBrands, getCategories, getProducts } from "../api/catalog";
import AnimateIn from "../components/AnimateIn";
import { ErrorIcon } from "../components/AuthIcons";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import ProductsActiveFilters from "../components/ProductsActiveFilters";
import ProductsCategoryRail from "../components/ProductsCategoryRail";
import ProductsPageHero from "../components/ProductsPageHero";
import { orderingLabels } from "../config/productsPage";
import { categoryDescriptions, categoryHeadings } from "../config/siteNav";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EmptyBoxIcon,
  FilterIcon,
  ResetIcon,
  SortIcon,
} from "../components/StoreIcons";
import {
  filtersFromParams,
  getActiveFilterChips,
  hasActiveFilters,
} from "../utils/productFilters";

const defaultHeading = {
  title: "Trang bị bóng đá",
  description:
    "Giày đá bóng, áo đấu, bóng size 5 và phụ kiện — lọc theo danh mục, thương hiệu và ngân sách.",
};

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(
    () => filtersFromParams(searchParams),
    [searchParams],
  );
  const page = Number(searchParams.get("page")) || 1;

  const activeParams = useMemo(() => {
    const params = { page };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "") {
        params[key] = value;
      }
    });

    return params;
  }, [filters, page]);

  const heading = categoryHeadings[filters.category] || defaultHeading;

  const listTitle = filters.category
    ? categories.find((item) => item.slug === filters.category)?.name ||
      "Sản phẩm"
    : "Tất cả sản phẩm";

  const activeBrandName = filters.brand
    ? brands.find((item) => item.slug === filters.brand)?.name
    : null;

  const showReset = hasActiveFilters(filters, page);

  const filterChips = useMemo(
    () => getActiveFilterChips(filters, { categories, brands }),
    [filters, categories, brands],
  );

  useEffect(() => {
    async function loadOptions() {
      try {
        const [categoryData, brandData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        setCategories(categoryData);
        setBrands(brandData);
      } catch {
        setCategories([]);
        setBrands([]);
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setStatus("loading");
      setError("");

      try {
        const data = await getProducts(activeParams);
        const list = data.results || data;

        setProducts(list);
        setPageInfo({
          count: data.count || list.length,
          next: data.next || null,
          previous: data.previous || null,
        });
        setStatus("success");
      } catch {
        setError("Không tải được danh sách sản phẩm.");
        setStatus("error");
      }
    }

    fetchProducts();
  }, [activeParams]);

  function updateSearchParams(updates) {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (!Object.prototype.hasOwnProperty.call(updates, "page")) {
      next.delete("page");
    }

    setSearchParams(next);
  }

  function updateFilter(event) {
    const { name, value } = event.target;
    updateSearchParams({ [name]: value });
  }

  function setCategory(slug) {
    updateSearchParams({ category: slug });
  }

  function setBrand(slug) {
    updateSearchParams({ brand: slug });
  }

  function applyPricePreset(min, max) {
    updateSearchParams({ min_price: min, max_price: max });
  }

  function resetFilters() {
    setSearchParams({});
    setMobileFiltersOpen(false);
  }

  function clearFilterChip(clearUpdates) {
    updateSearchParams(clearUpdates);
  }

  function goToPage(nextPage) {
    updateSearchParams({ page: nextPage > 1 ? nextPage : "" });
  }

  return (
    <main className="products-page">
      <ProductsPageHero
        heading={heading}
        listTitle={listTitle}
        filters={filters}
        brands={brands}
        productCount={pageInfo.count}
        categoryCount={categories.length}
        status={status}
        onSearchChange={updateFilter}
        onBrandChange={setBrand}
      />

      <section className="products-page-body pitch-pattern">
        <div className="page-container py-8 sm:py-10">
          <AnimateIn>
            <ProductsCategoryRail
              categories={categories}
              activeSlug={filters.category}
              onSelect={setCategory}
            />
          </AnimateIn>

          <div className="mt-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <aside className="hidden lg:block">
              <div className="products-filter-panel sticky top-24">
                <ProductFilters
                  filters={filters}
                  categories={categories}
                  brands={brands}
                  onFilterChange={updateFilter}
                  onReset={resetFilters}
                  onPricePreset={applyPricePreset}
                  hideSearch
                />
              </div>
            </aside>

            <div className="products-main">
              <div className="products-mobile-bar lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  className="products-mobile-filter-btn"
                >
                  <FilterIcon className="h-4 w-4" />
                  Bộ lọc
                  {filterChips.length > 0 && (
                    <span className="products-mobile-filter-badge">
                      {filterChips.length}
                    </span>
                  )}
                  <ChevronDownIcon
                    className={`h-4 w-4 transition ${mobileFiltersOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <label className="products-mobile-sort">
                  <SortIcon className="h-4 w-4 text-slate-400" />
                  <select
                    name="ordering"
                    value={filters.ordering}
                    onChange={updateFilter}
                    className="input-field !border-0 !bg-transparent !py-0 !pl-0 !ring-0"
                  >
                    <option value="-created_at">Mới nhất</option>
                    <option value="-sales">Bán chạy</option>
                    <option value="price">Giá thấp → cao</option>
                    <option value="-price">Giá cao → thấp</option>
                    <option value="name">Tên A–Z</option>
                  </select>
                </label>
              </div>

              {mobileFiltersOpen && (
                <div className="products-filter-panel mb-5 lg:hidden">
                  <ProductFilters
                    filters={filters}
                    categories={categories}
                    brands={brands}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                    onPricePreset={applyPricePreset}
                    hideSearch
                    compact
                  />
                </div>
              )}

              <ProductsActiveFilters
                chips={filterChips}
                onClear={clearFilterChip}
                onResetAll={resetFilters}
              />

              <div className="products-toolbar">
                <div className="products-toolbar-copy">
                  <p className="products-toolbar-eyebrow">Kết quả lọc</p>
                  <h2 className="products-toolbar-title">
                    {activeBrandName
                      ? `${listTitle} · ${activeBrandName}`
                      : listTitle}
                  </h2>
                  <p className="products-toolbar-meta">
                    {status === "loading"
                      ? "Đang tải sản phẩm..."
                      : `${pageInfo.count} sản phẩm · ${orderingLabels[filters.ordering] || "Mới nhất"}`}
                  </p>
                  {filters.category && categoryDescriptions[filters.category] && (
                    <p className="products-toolbar-desc">
                      {categoryDescriptions[filters.category]}
                    </p>
                  )}
                </div>

                <div className="products-toolbar-actions">
                  {showReset && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="btn-secondary !py-2 text-xs sm:text-sm"
                    >
                      <ResetIcon className="h-3.5 w-3.5" />
                      Xóa lọc
                    </button>
                  )}
                  <label className="products-sort-field hidden sm:block">
                    <span className="sr-only">Sắp xếp</span>
                    <select
                      name="ordering"
                      value={filters.ordering}
                      onChange={updateFilter}
                      className="input-field !py-2 text-sm"
                    >
                      <option value="-created_at">Mới nhất</option>
                      <option value="-sales">Bán chạy</option>
                      <option value="price">Giá thấp → cao</option>
                      <option value="-price">Giá cao → thấp</option>
                      <option value="name">Tên A–Z</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="products-results-panel">
                {status === "error" && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <ErrorIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    {error}
                  </div>
                )}

                {status === "loading" && (
                  <div className="products-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                  </div>
                )}

                {status === "success" && products.length === 0 && (
                  <div className="products-empty">
                    <div className="products-empty-icon">
                      <EmptyBoxIcon className="h-8 w-8" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                      Không tìm thấy sản phẩm phù hợp
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Thử đổi danh mục, thương hiệu hoặc khoảng giá — hoặc xem
                      toàn bộ trang bị bóng đá.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="btn-primary mt-6"
                    >
                      <ResetIcon />
                      Xem tất cả sản phẩm
                    </button>
                  </div>
                )}

                {status === "success" && products.length > 0 && (
                  <div className="products-grid">
                    {products.map((product, index) => (
                      <AnimateIn key={product.id} className="h-full" delay={index * 50}>
                        <ProductCard product={product} />
                      </AnimateIn>
                    ))}
                  </div>
                )}
              </div>

              {(pageInfo.previous || pageInfo.next) && (
                <div className="products-pagination">
                  <button
                    type="button"
                    disabled={!pageInfo.previous}
                    onClick={() => goToPage(page - 1)}
                    className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Trước
                  </button>
                  <span className="products-pagination-page">Trang {page}</span>
                  <button
                    type="button"
                    disabled={!pageInfo.next}
                    onClick={() => goToPage(page + 1)}
                    className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sau
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductsPage;