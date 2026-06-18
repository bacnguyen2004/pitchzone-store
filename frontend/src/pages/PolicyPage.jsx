import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide1 from "../assets/banner-slide-1.jpg";
import InfoPageHero from "../components/InfoPageHero";
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
      <div className="flex gap-4">
        <span className={`info-channel-icon bg-gradient-to-br ${section.accent}`}>
          <section.Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{section.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{section.summary}</p>
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {section.points.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-6 text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PolicyPage() {
  const [activeSection, setActiveSection] = useState(policySections[0].id);

  useEffect(() => {
    const observers = policySections.map((section) => {
      const element = document.getElementById(section.id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section.id);
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
      );

      observer.observe(element);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  return (
    <main className="info-page">
      <InfoPageHero
        banner={bannerSlide1}
        breadcrumbLabel="Chính sách"
        eyebrow="Pháp lý & quy định"
        title="Chính sách PitchZone"
        description="Quy định rõ ràng về mua hàng, giao hàng, đổi trả và bảo mật — giúp bạn yên tâm mỗi lần đặt đồ bóng đá."
        meta={
          <>
            Cập nhật lần cuối:{" "}
            <time dateTime="2026-06-15">{policyLastUpdated}</time>
          </>
        }
        compact
      />

      <section className="info-page-section">
        <div className="page-container">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {policyHighlights.map((item) => (
              <div key={item.title} className="info-highlight-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <item.Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="info-page-section is-muted !border-b-0">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-12">
            <aside className="lg:col-span-4">
              <div className="info-page-aside-card">
                <nav className="about-bento" aria-label="Mục lục chính sách">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mục lục</p>
                  <ul className="mt-3 space-y-0.5">
                    {policySections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={() => setActiveSection(section.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                            activeSection === section.id
                              ? "bg-primary-light font-bold text-primary"
                              : "text-slate-600 hover:bg-slate-50"
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
                  <a
                    href={`tel:${siteContact.hotlineTel}`}
                    className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                      <PhoneIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Hotline</p>
                      <p className="text-sm font-bold text-primary">{siteContact.hotline}</p>
                    </div>
                  </a>
                  <Link to="/contact" className="btn-primary mt-3 w-full rounded-xl">
                    <ContactIcon />
                    Gửi yêu cầu
                  </Link>
                </div>

                <div className="about-bento">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Liên quan</p>
                  <ul className="mt-2 space-y-1">
                    {policyRelatedLinks.map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} className="link-action text-sm">
                          {link.label}
                          <ChevronRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            <div className="space-y-4 lg:col-span-8">
              <div className="about-bento border-dashed border-primary/25 bg-primary-light/40 text-sm text-slate-700">
                <strong className="text-slate-900">Lưu ý:</strong> Bằng việc sử dụng website và đặt
                hàng tại PitchZone, bạn đồng ý với các chính sách dưới đây.
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
    </main>
  );
}

export default PolicyPage;