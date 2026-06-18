import { Link } from "react-router-dom";

import bannerSlide1 from "../assets/banner-slide-1.jpg";
import bannerSlide2 from "../assets/banner-slide-2.jpg";
import AnimateIn from "../components/AnimateIn";
import CategoryMedia from "../components/CategoryMedia";
import InfoPageHero from "../components/InfoPageHero";
import { LogoMark } from "../components/Logo";
import SectionHeader from "../components/SectionHeader";
import {
  aboutHeroTags,
  aboutOfferings,
  aboutProcess,
  aboutStats,
  aboutStory,
  aboutValues,
  aboutWhyPoints,
} from "../config/aboutContent";
import { siteContact } from "../config/siteContact";
import { ChevronRightIcon, ContactIcon } from "../components/StoreIcons";
import { buildProductsUrl } from "../utils/productFilters";

function AboutPage() {
  const { hotline, foundedYear } = siteContact;

  return (
    <main className="info-page">
      <InfoPageHero
        banner={bannerSlide1}
        breadcrumbLabel="Giới thiệu"
        eyebrow={`Từ ${foundedYear} · Đồ bóng đá chính hãng`}
        title={
          <>
            Cửa hàng trang bị bóng đá{" "}
            <span className="text-emerald-300">cho mọi trận đấu</span>
          </>
        }
        description={`${siteContact.brandName} tuyển chọn giày, áo đấu, bóng và phụ kiện chính hãng — giá minh bạch, giao nhanh toàn quốc và tư vấn size miễn phí.`}
        panel={
          <div className="grid grid-cols-2 gap-3">
            {aboutStats.map((stat, index) => (
              <AnimateIn key={stat.label} delay={index * 60}>
                <div className="products-hero-stat">
                  <span className="products-hero-stat-value">{stat.value}</span>
                  <span className="products-hero-stat-label">{stat.label}</span>
                </div>
              </AnimateIn>
            ))}
          </div>
        }
      />

      <section className="info-page-section">
        <div className="page-container">
          <div className="mb-6 flex flex-wrap gap-2">
            {aboutHeroTags.map((tag) => (
              <span key={tag} className="pill pill-inactive text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
            <AnimateIn className="about-bento lg:col-span-5">
              <p className="sport-eyebrow">Câu chuyện</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Mua đồ bóng đá không cần phải phức tạp
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {aboutStory.slice(0, 2).map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={buildProductsUrl()} className="btn-primary rounded-xl">
                  Khám phá sản phẩm
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="btn-secondary rounded-xl">
                  <ContactIcon />
                  Tư vấn size
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn className="relative overflow-hidden rounded-2xl lg:col-span-7" delay={80}>
              <img
                src={bannerSlide2}
                alt="Store đồ bóng đá PitchZone"
                className="h-full min-h-[260px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-sm font-semibold text-emerald-300">Store · Quận 1</p>
                <p className="mt-1 text-lg font-bold text-white">Thử giày trước — mua yên tâm sau</p>
                <p className="mt-1 text-sm text-emerald-100/80">
                  Đặt lịch qua hotline {hotline}
                </p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section className="info-page-section is-muted pitch-pattern">
        <div className="page-container">
          <SectionHeader
            title="Cam kết với mỗi đơn hàng"
            description="Bốn trụ cột định hình mọi quyết định — từ chọn giày đến chăm sóc sau bán."
            align="center"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutValues.map((item, index) => (
              <AnimateIn key={item.title} delay={index * 60}>
                <div className="about-value-card">
                  <span className="about-value-icon">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <section className="info-page-section">
        <div className="page-container">
          <SectionHeader
            title="Vì sao chọn PitchZone?"
            description="Sáu lý do khách hàng quay lại mỗi khi cần trang bị ra sân."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aboutWhyPoints.map((point, index) => (
              <AnimateIn key={point.title} delay={index * 50}>
                <div className="about-why-card group">
                  <span className="about-why-index">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-bold text-slate-900">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{point.text}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <section className="info-page-section is-muted about-process-section !border-b-0">
        <div className="page-container">
          <SectionHeader
            title="Quy trình mua hàng"
            description="Bốn bước rõ ràng — không thủ tục rườm rà."
            align="center"
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {aboutProcess.map((step) => (
              <div key={step.step} className="about-process-card">
                <span className="about-process-step">{step.step}</span>
                <span className="about-process-icon">
                  <step.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="info-page-section">
        <div className="page-container">
          <SectionHeader
            title="Danh mục sản phẩm"
            description="Giày, áo đấu, bóng và phụ kiện — đủ bộ cho tập luyện và thi đấu."
            action={
              <Link to="/categories" className="link-action hidden sm:inline-flex">
                Tất cả danh mục
                <ChevronRightIcon />
              </Link>
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutOfferings.map((item, index) => (
              <AnimateIn key={item.slug} delay={index * 50}>
                <Link
                  to={buildProductsUrl({ category: item.slug })}
                  className="group about-category-card"
                >
                  <CategoryMedia slug={item.slug} size="lg" variant="photo" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-slate-900 group-hover:text-primary">
                        {item.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                        {item.count}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-500">{item.description}</p>
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <section className="info-page-cta">
        <div className="page-container">
          <AnimateIn>
            <div className="home-cta-pitch pitch-lines">
              <div className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-4">
                  <LogoMark size="lg" className="opacity-90" />
                  <div>
                    <p className="home-kicker text-emerald-200">Sẵn sàng ra sân?</p>
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                      Trang bị đủ bộ cho trận đấu tới
                    </h2>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:ml-auto">
                  <Link
                    to={buildProductsUrl()}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-hover shadow-lg"
                  >
                    Mua sắm ngay
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                  <Link to="/faq" className="btn-secondary !border-white/30 !bg-white/10 !text-white">
                    FAQ
                  </Link>
                  <Link to="/policy" className="btn-secondary !border-white/30 !bg-white/10 !text-white">
                    Chính sách
                  </Link>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;