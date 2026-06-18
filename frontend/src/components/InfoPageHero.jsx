import { Link } from "react-router-dom";

import { HomeIcon } from "./StoreIcons";

function InfoPageHero({
  banner,
  breadcrumbLabel,
  eyebrow,
  title,
  description,
  meta,
  panel,
  compact = false,
}) {
  return (
    <section
      className={`info-page-hero products-hero pitch-lines relative overflow-hidden${
        compact ? " is-compact" : ""
      }`}
    >
      <div className="products-hero-bg" aria-hidden>
        <img src={banner} alt="" className="h-full w-full object-cover" />
        <div className="products-hero-overlay" />
        <div className="products-hero-glow" />
      </div>

      <div className="page-container products-hero-content">
        <nav className="products-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="products-breadcrumb-link">
            <HomeIcon className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-emerald-700/60">/</span>
          <span className="font-medium text-emerald-100/90">{breadcrumbLabel}</span>
        </nav>

        <div
          className={`info-page-hero-body${
            panel ? " info-page-hero-body-with-panel" : ""
          }`}
        >
          <div className="info-page-hero-main">
            {eyebrow && <p className="sport-eyebrow-light">{eyebrow}</p>}
            <h1 className="products-hero-title mt-4">
              {typeof title === "string" ? title : <>{title}</>}
            </h1>
            {description && (
              <p className="products-hero-desc mt-4 sm:text-lg">{description}</p>
            )}
            {meta && <div className="info-page-hero-meta">{meta}</div>}
          </div>
          {panel && <div className="info-page-hero-panel">{panel}</div>}
        </div>
      </div>
    </section>
  );
}

export default InfoPageHero;