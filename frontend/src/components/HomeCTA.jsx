import { Link } from "react-router-dom";

import AnimateIn from "./AnimateIn";
import { ContactIcon, FootballBootsCategoryIcon } from "./StoreIcons";
import { buildProductsUrl } from "../utils/productFilters";

function HomeCTA() {
  return (
    <AnimateIn as="section" className="page-container section-home">
      <div className="home-cta-pitch pitch-lines overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="home-kicker text-emerald-200">Sẵn sàng ra sân?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Trang bị đủ bộ cho trận đấu tới
            </h2>
            <p className="mt-3 text-sm leading-7 text-emerald-100/90 sm:text-base sm:leading-8">
              Giày bóng đá, áo đấu, bóng size 5 — lọc theo danh mục và thương hiệu
              bạn tin dùng.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={buildProductsUrl()}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-emerald-900 shadow-lg shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <FootballBootsCategoryIcon className="h-4 w-4" />
              Mua sắm ngay
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/45 hover:bg-white/20"
            >
              Danh mục
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-emerald-100 transition hover:border-white/40 hover:text-white"
            >
              <ContactIcon />
              Tư vấn size
            </Link>
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

export default HomeCTA;