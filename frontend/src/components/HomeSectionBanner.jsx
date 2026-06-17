function HomeSectionBanner({ variant = "emerald", children, className = "" }) {
  return (
    <div className={`home-section-banner home-section-banner-${variant} pitch-lines ${className}`}>
      <div className="home-section-banner-glow" aria-hidden />
      <div className="page-container relative z-10 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}

export default HomeSectionBanner;