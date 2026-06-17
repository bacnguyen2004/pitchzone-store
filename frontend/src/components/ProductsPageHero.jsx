import { Link } from "react-router-dom";

import { getCategoryImage } from "../config/categoryVisuals";
import { homeImages } from "../config/homeImages";
import { productsPagePerks } from "../config/productsPage";
import RemoteImage from "./RemoteImage";
import {
  HomeIcon,
  ProductsIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
} from "./StoreIcons";

function ProductsPageHero({
  heading,
  listTitle,
  filters,
  brands,
  productCount,
  categoryCount,
  status,
  onSearchChange,
  onBrandChange,
}) {
  const heroImage =
    getCategoryImage(filters.category) || homeImages.banner.boots;

  return (
    <section className="products-hero pitch-lines">
      <div className="products-hero-bg" aria-hidden>
        <RemoteImage
          src={heroImage}
          alt=""
          loading="eager"
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900"
        />
        <div className="products-hero-overlay" />
        <div className="products-hero-glow" />
      </div>

      <div className="page-container products-hero-content">
        <nav className="products-breadcrumb">
          <Link to="/" className="products-breadcrumb-link">
            <HomeIcon className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-emerald-700/60">/</span>
          <span className="text-emerald-100/90">Sản phẩm</span>
          {filters.category && listTitle !== "Tất cả sản phẩm" && (
            <>
              <span className="text-emerald-700/60">/</span>
              <span className="font-medium text-white">{listTitle}</span>
            </>
          )}
        </nav>

        <div className="products-hero-main">
          <div className="products-hero-copy">
            <p className="products-hero-eyebrow">
              <SparklesIcon className="h-4 w-4" />
              Match day catalog
            </p>
            <h1 className="products-hero-title">{heading.title}</h1>
            <p className="products-hero-desc">{heading.description}</p>

            <div className="products-hero-stats">
              <div className="products-hero-stat">
                <span className="products-hero-stat-value">
                  {status === "loading" ? "—" : productCount}
                </span>
                <span className="products-hero-stat-label">Sản phẩm</span>
              </div>
              <div className="products-hero-stat">
                <span className="products-hero-stat-value">{categoryCount || "—"}</span>
                <span className="products-hero-stat-label">Danh mục</span>
              </div>
              <div className="products-hero-stat">
                <span className="products-hero-stat-value">{brands.length || "—"}</span>
                <span className="products-hero-stat-label">Thương hiệu</span>
              </div>
            </div>
          </div>

          <div className="products-hero-panel">
            <label className="products-hero-search">
              <span className="products-hero-search-icon">
                <SearchIcon className="h-5 w-5" />
              </span>
              <input
                name="search"
                value={filters.search}
                onChange={onSearchChange}
                placeholder="Tìm giày Nike, áo MU, bóng Adidas..."
                className="products-hero-search-input"
              />
            </label>

            <div className="products-hero-perks">
              <span className="products-hero-perk">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Chính hãng
              </span>
              <span className="products-hero-perk">
                <TruckIcon className="h-3.5 w-3.5" />
                {productsPagePerks[0]}
              </span>
              <span className="products-hero-perk">
                <ProductsIcon className="h-3.5 w-3.5" />
                {productsPagePerks[1]}
              </span>
            </div>
          </div>
        </div>

        {brands.length > 0 && (
          <div className="products-hero-brands">
            <span className="products-hero-brands-label">Thương hiệu</span>
            <div className="products-hero-brands-row">
              <button
                type="button"
                onClick={() => onBrandChange("")}
                className={`products-brand-pill ${!filters.brand ? "is-active" : ""}`}
              >
                Tất cả
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => onBrandChange(brand.slug)}
                  className={`products-brand-pill ${
                    filters.brand === brand.slug ? "is-active" : ""
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductsPageHero;