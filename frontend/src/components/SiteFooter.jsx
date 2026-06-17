import { Link } from "react-router-dom";

import { footerLinks } from "../config/siteNav";
import Logo from "./Logo";

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-body">
        <div className="page-container site-footer-grid">
          <div className="md:col-span-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <Logo variant="light" />
            </Link>
            <p className="site-footer-brand-desc">
              Football Gear Ecommerce — giày đá bóng, áo đấu, bóng và phụ kiện
              chính hãng. Giao nhanh toàn quốc, tư vấn size miễn phí.
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="site-footer-heading">Mua sắm</h3>
            <div className="site-footer-links">
              {footerLinks.shop.map((item) => (
                <Link key={item.to} className="site-footer-link" to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="site-footer-heading">Website</h3>
            <div className="site-footer-links">
              {footerLinks.site.map((item) => (
                <Link key={item.to} className="site-footer-link" to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <h3 className="site-footer-heading">Dịch vụ</h3>
            <ul className="site-footer-services">
              <li>Tư vấn size giày miễn phí</li>
              <li>Giao hàng toàn quốc 2–5 ngày</li>
              <li>Đổi trả lỗi NSX trong 7 ngày</li>
            </ul>
            <div className="site-footer-tags">
              <span>Chính hãng</span>
              <span>Nike · Adidas</span>
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="page-container site-footer-bottom-inner">
          <span>© 2026 PitchZone</span>
          <Link to="/contact">Liên hệ hỗ trợ</Link>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;