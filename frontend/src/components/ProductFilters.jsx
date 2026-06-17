import {
  BrandIcon,
  FilterIcon,
  InStockIcon,
  PriceIcon,
  ResetIcon,
  SearchIcon,
  SortIcon,
} from "./StoreIcons";

const pricePresets = [
  { label: "Dưới 1tr", hint: "< 1M", min: "", max: "1000000" },
  { label: "1–2tr", hint: "1M–2M", min: "1000000", max: "2000000" },
  { label: "Trên 2tr", hint: "> 2M", min: "2000000", max: "" },
];

const sortOptions = [
  { value: "-created_at", label: "Mới nhất" },
  { value: "-sales", label: "Bán chạy" },
  { value: "price", label: "Giá ↑" },
  { value: "-price", label: "Giá ↓" },
  { value: "name", label: "A–Z" },
];

function countActiveFilters(filters) {
  let count = 0;

  if (filters.category) count += 1;
  if (filters.brand) count += 1;
  if (filters.min_price || filters.max_price) count += 1;
  if (filters.in_stock === "true") count += 1;
  if (filters.on_sale === "true") count += 1;
  if (filters.search) count += 1;

  return count;
}

function FilterBlock({ icon: Icon, title, hint, children }) {
  return (
    <section className="filter-block">
      <div className="filter-block-head">
        {Icon && (
          <span className="filter-block-icon">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="filter-block-title">{title}</h3>
          {hint && <p className="filter-block-hint">{hint}</p>}
        </div>
      </div>
      <div className="filter-block-body">{children}</div>
    </section>
  );
}

function ProductFilters({
  filters,
  categories,
  brands,
  onFilterChange,
  onReset,
  onPricePreset,
  hideSearch = false,
  compact = false,
}) {
  const activePreset = pricePresets.find(
    (preset) =>
      preset.min === filters.min_price && preset.max === filters.max_price,
  )?.label;

  const activeCount = countActiveFilters(filters);

  function patchFilter(name, value) {
    onFilterChange({ target: { name, value } });
  }

  function togglePricePreset(preset) {
    if (activePreset === preset.label) {
      onPricePreset("", "");
      return;
    }

    onPricePreset(preset.min, preset.max);
  }

  return (
    <div className={`product-filters ${compact ? "product-filters-compact" : ""}`}>
      <header className="filter-panel-head">
        <div className="filter-panel-head-main">
          <span className="filter-panel-badge">
            <FilterIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="filter-panel-title">Tinh chỉnh kết quả</h2>
              {activeCount > 0 && (
                <span className="filter-panel-count">{activeCount} đang bật</span>
              )}
            </div>
            <p className="filter-panel-desc">
              Lọc nhanh theo danh mục, thương hiệu và ngân sách
            </p>
          </div>
        </div>
        <button type="button" onClick={onReset} className="filter-panel-reset">
          <ResetIcon className="h-3.5 w-3.5" />
          Xóa lọc
        </button>
      </header>

      {!hideSearch && (
        <FilterBlock icon={SearchIcon} title="Tìm kiếm" hint="Tên sản phẩm, đội bóng...">
          <label className="filter-search">
            <SearchIcon className="h-4 w-4" />
            <input
              name="search"
              value={filters.search}
              onChange={onFilterChange}
              placeholder="Giày Nike, áo MU, bóng Adidas..."
            />
          </label>
        </FilterBlock>
      )}

      <FilterBlock title="Danh mục" hint="Chọn loại trang bị">
        <div className="filter-chip-grid">
          <button
            type="button"
            onClick={() => patchFilter("category", "")}
            className={`filter-chip ${!filters.category ? "is-active" : ""}`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => patchFilter("category", category.slug)}
              className={`filter-chip ${
                filters.category === category.slug ? "is-active" : ""
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock
        icon={BrandIcon}
        title="Thương hiệu"
        hint="Nike, Adidas, Puma..."
      >
        <div className="filter-brand-grid">
          <button
            type="button"
            onClick={() => patchFilter("brand", "")}
            className={`filter-brand-chip ${!filters.brand ? "is-active" : ""}`}
          >
            Tất cả
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => patchFilter("brand", brand.slug)}
              className={`filter-brand-chip ${
                filters.brand === brand.slug ? "is-active" : ""
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock icon={PriceIcon} title="Khoảng giá" hint="VNĐ">
        <div className="filter-price-segments">
          {pricePresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => togglePricePreset(preset)}
              className={`filter-price-segment ${
                activePreset === preset.label ? "is-active" : ""
              }`}
            >
              <span className="filter-price-segment-label">{preset.label}</span>
              <span className="filter-price-segment-hint">{preset.hint}</span>
            </button>
          ))}
        </div>
        <div className="filter-price-range">
          <label className="filter-price-field">
            <span>Từ</span>
            <input
              name="min_price"
              type="number"
              min="0"
              step="10000"
              value={filters.min_price}
              onChange={onFilterChange}
              placeholder="0"
            />
          </label>
          <span className="filter-price-divider" aria-hidden />
          <label className="filter-price-field">
            <span>Đến</span>
            <input
              name="max_price"
              type="number"
              min="0"
              step="10000"
              value={filters.max_price}
              onChange={onFilterChange}
              placeholder="∞"
            />
          </label>
        </div>
      </FilterBlock>

      <label className="filter-stock-toggle">
        <input
          type="checkbox"
          name="in_stock"
          checked={filters.in_stock === "true"}
          onChange={(event) => {
            patchFilter("in_stock", event.target.checked ? "true" : "");
          }}
          className="filter-stock-input"
        />
        <span className="filter-stock-track" aria-hidden>
          <span className="filter-stock-thumb" />
        </span>
        <span className="filter-stock-copy">
          <span className="filter-stock-title">
            <InStockIcon className="h-4 w-4" />
            Chỉ còn hàng
          </span>
          <span className="filter-stock-desc">Ẩn sản phẩm hết size / hết hàng</span>
        </span>
      </label>

      <label className="filter-stock-toggle">
        <input
          type="checkbox"
          name="on_sale"
          checked={filters.on_sale === "true"}
          onChange={(event) => {
            patchFilter("on_sale", event.target.checked ? "true" : "");
          }}
          className="filter-stock-input"
        />
        <span className="filter-stock-track" aria-hidden>
          <span className="filter-stock-thumb" />
        </span>
        <span className="filter-stock-copy">
          <span className="filter-stock-title">Đang giảm giá</span>
          <span className="filter-stock-desc">Deal sốc và sản phẩm sale</span>
        </span>
      </label>

      <FilterBlock icon={SortIcon} title="Sắp xếp" hint="Thứ tự hiển thị">
        <div className="filter-sort-grid">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => patchFilter("ordering", option.value)}
              className={`filter-sort-chip ${
                filters.ordering === option.value ? "is-active" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterBlock>
    </div>
  );
}

export default ProductFilters;