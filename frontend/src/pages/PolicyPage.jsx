import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide1 from "../assets/banner-slide-1.jpg";
import {
  policyHighlights,
  policyLastUpdated,
  policyRelatedLinks,
  policySections,
} from "../config/policyContent";
import { siteContact } from "../config/siteContact";
import {
  ChevronRightIcon,
  ContactIcon,
  HomeIcon,
  PhoneIcon,
} from "../components/StoreIcons";

function PolicySection({ section, isActive }) {
  return (
    <section
      id={section.id}
      className={`scroll-mt-28 about-bento transition ${
        isActive ? "ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          className={`info-channel-icon bg-gradient-to-br ${section.accent}`}
        >
          <section.Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {section.title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">{section.summary}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
        {section.points.map((point) => (
          <li key={point} className="flex gap-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PolicyPage() {
  const [activeSection, setActiveSection] = useState(policySections[0].id);

  useEffect(() => {
    const observers = policySections.map((section) => {
      const element = document.getElementById(section.id);
      if (!element) {
        return null;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section.id);
          }
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <main className="about-page-body">
      {/* Hero */}
      <section className="products-hero pitch-lines relative overflow-hidden">
        <div className="products-hero-bg" aria-hidden>
          <img src={bannerSlide1} alt="" className="h-full w-full object-cover" />
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
            <span className="font-medium text-emerald-100/90">Chính sách</span>
          </nav>

          <div className="mt-8 max-w-2xl">
            <p className="sport-eyebrow-light">Pháp lý & quy định</p>
            <h1 className="products-hero-title mt-4">Chính sách PitchZone</h1>
            <p className="products-hero-desc mt-5 sm:text-lg">
              Quy định rõ ràng về mua hàng, giao hàng, đổi trả, bảo mật và điều khoản sử dụng —
              giúp bạn yên tâm mỗi lần đặt đồ bóng đá.
            </p>
            <p className="mt-4 text-sm text-emerald-200/70">
              Cập nhật lần cuối:{" "}
              <time dateTime="2026-06-15">{policyLastUpdated}</time>
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="page-container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {policyHighlights.map((item) => (
              <div key={item.title} className="info-highlight-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <item.Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <nav className="about-bento" aria-label="Mục lục chính sách">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Mục lục
                  </p>
                  <ul className="mt-4 space-y-1">
                    {policySections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={() => setActiveSection(section.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                            activeSection === section.id
                              ? "bg-primary-light font-bold text-primary"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <section.Icon className="h-4 w-4 shrink-0" />
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="about-bento about-mission-card">
                  <p className="text-sm font-bold text-slate-900">Cần giải thích thêm?</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Liên hệ CSKH nếu bạn có thắc mắc về điều khoản áp dụng cho đơn hàng cụ thể.
                  </p>
                  <a
                    href={`tel:${siteContact.hotlineTel}`}
                    className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                      <PhoneIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Hotline</p>
                      <p className="text-sm font-bold text-primary">
                        {siteContact.hotline}
                      </p>
                    </div>
                  </a>
                  <Link to="/contact" className="btn-primary mt-3 w-full rounded-xl">
                    <ContactIcon />
                    Gửi yêu cầu
                  </Link>
                </div>

                <div className="about-bento">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Liên quan
                  </p>
                  <ul className="mt-3 space-y-2">
                    {policyRelatedLinks.map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} className="link-action">
                          {link.label}
                          <ChevronRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            <div className="space-y-6 lg:col-span-8">
              <div className="about-bento border-dashed border-primary/25 bg-primary-light/40">
                <p className="text-sm leading-7 text-slate-700">
                  <strong className="text-slate-900">Lưu ý:</strong> Bằng việc sử dụng website và
                  đặt hàng tại PitchZone, bạn đồng ý với các chính sách dưới đây. Vui lòng đọc
                  kỹ trước khi mua — đặc biệt các mục về đổi trả, size giày và bảo hành.
                </p>
              </div>

              {policySections.map((section) => (
                <PolicySection
                  key={section.id}
                  section={section}
                  isActive={activeSection === section.id}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="page-container">
          <div className="home-cta-pitch pitch-lines">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <p className="home-kicker text-emerald-200">Minh bạch từ đầu đến cuối</p>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Có câu hỏi về chính sách?
              </h2>
              <p className="mt-3 text-base leading-7 text-emerald-100/85">
                Xem FAQ hoặc liên hệ — chúng tôi giải thích rõ ràng, không né tránh.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/faq" className="btn-primary rounded-xl px-6">
                  Xem FAQ
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/45 hover:bg-white/20"
                >
                  <ContactIcon />
                  Liên hệ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PolicyPage;