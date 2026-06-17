import { Link } from "react-router-dom";

import bannerSlide2 from "../../assets/banner-slide-2.jpg";
import { HomeIcon } from "../StoreIcons";

function ProfileHero({ title, subtitle }) {
  return (
    <section className="cart-hero pitch-lines">
      <div className="cart-hero-bg" aria-hidden>
        <img src={bannerSlide2} alt="" className="h-full w-full object-cover" />
        <div className="products-hero-overlay" />
      </div>
      <div className="page-container cart-hero-content">
        <nav className="products-breadcrumb">
          <Link to="/" className="products-breadcrumb-link">
            <HomeIcon className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-emerald-700/60">/</span>
          <span className="font-medium text-emerald-100/90">Tài khoản</span>
        </nav>
        <h1 className="products-hero-title mt-6">{title}</h1>
        {subtitle && <p className="products-hero-desc mt-2">{subtitle}</p>}
      </div>
    </section>
  );
}

export default ProfileHero;