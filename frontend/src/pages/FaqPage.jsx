import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide3 from "../assets/banner-slide-3.jpg";
import {
  faqCategories,
  faqItems,
  faqQuickLinks,
} from "../config/faqContent";
import { siteContact } from "../config/siteContact";
import {
  ChevronRightIcon,
  ContactIcon,
  HomeIcon,
  PhoneIcon,
  SearchIcon,
} from "../components/StoreIcons";

function FaqAccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="about-faq-item">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition hover:bg-primary-light/80 sm:px-6"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-semibold leading-6 text-slate-900 sm:text-base">
          {item.question}
        </span>
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
            isOpen
              ? "rotate-90 border-primary/30 bg-primary-light text-primary"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6">
          <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState(faqItems.find((i) => i.popular)?.id || faqItems[0]?.id);

  const popularItems = useMemo(() => faqItems.filter((item) => item.popular), []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        query === "" ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    if (activeCategory !== "all" || searchQuery.trim()) {
      return [{ id: "results", label: "Kết quả", items: filteredItems }];
    }

    return faqCategories
      .filter((cat) => cat.id !== "all")
      .map((cat) => ({
        id: cat.id,
        label: cat.label,
        Icon: cat.Icon,
        items: filteredItems.filter((item) => item.category === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeCategory, searchQuery, filteredItems]);

  return (
    <main className="about-page-body">
      {/* Hero */}
      <section className="products-hero pitch-lines relative overflow-hidden">
        <div className="products-hero-bg" aria-hidden>
          <img src={bannerSlide3} alt="" className="h-full w-full object-cover" />
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
            <span className="font-medium text-emerald-100/90">FAQ</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-end">
            <div>
              <p className="sport-eyebrow-light">Trung tâm trợ giúp</p>
              <h1 className="products-hero-title mt-4">Câu hỏi thường gặp</h1>
              <p className="products-hero-desc mt-5 sm:text-lg">
                Giải đáp về mua hàng, giao hàng, đổi trả, size giày và sản phẩm — tìm nhanh
                bằng ô tìm kiếm hoặc lọc theo chủ đề.
              </p>
            </div>

            <div className="products-hero-panel">
              <label className="products-hero-search">
                <span className="products-hero-search-icon">
                  <SearchIcon className="h-5 w-5" />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm: giao hàng, size giày, đổi trả..."
                  className="products-hero-search-input"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Popular */}
      {!searchQuery.trim() && activeCategory === "all" && (
        <section className="border-b border-slate-200 bg-white py-8">
          <div className="page-container">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Được hỏi nhiều nhất
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOpenId(item.id);
                    setActiveCategory("all");
                    setSearchQuery("");
                    document
                      .getElementById(`faq-${item.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary-light hover:text-primary"
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main */}
      <section className="section">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`pill ${
                      activeCategory === cat.id ? "pill-active" : "pill-inactive"
                    }`}
                  >
                    <cat.Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>

              {filteredItems.length === 0 ? (
                <div className="about-bento mt-6 px-6 py-14 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    Không tìm thấy câu hỏi phù hợp
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Thử từ khóa khác hoặc liên hệ trực tiếp với chúng tôi.
                  </p>
                  <Link to="/contact" className="btn-primary mt-5 rounded-xl">
                    <ContactIcon />
                    Liên hệ hỗ trợ
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-8">
                  {groupedItems.map((group) => (
                    <div key={group.id}>
                      {group.id !== "results" && (
                        <div className="mb-4 flex items-center gap-2">
                          {group.Icon && (
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                              <group.Icon className="h-4 w-4" />
                            </span>
                          )}
                          <h2 className="text-lg font-bold text-slate-900">{group.label}</h2>
                          <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {group.items.length}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {group.items.map((item) => (
                          <div key={item.id} id={`faq-${item.id}`}>
                            <FaqAccordionItem
                              item={item}
                              isOpen={openId === item.id}
                              onToggle={() =>
                                setOpenId(openId === item.id ? null : item.id)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="about-bento about-mission-card">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Cần hỗ trợ thêm?
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Không tìm thấy câu trả lời? Đội ngũ PitchZone sẵn sàng tư vấn size giày và hỗ
                    trợ đơn hàng.
                  </p>
                  <a
                    href={`tel:${siteContact.hotlineTel}`}
                    className="mt-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:ring-primary/20"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                      <PhoneIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Hotline</p>
                      <p className="font-bold text-primary">{siteContact.hotline}</p>
                    </div>
                  </a>
                  <Link to="/contact" className="btn-primary mt-4 w-full rounded-xl">
                    <ContactIcon />
                    Gửi tin nhắn
                  </Link>
                </div>

                {faqQuickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="about-bento group flex gap-4 !p-4 transition hover:-translate-y-0.5 hover:border-primary/25"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary transition group-hover:bg-primary group-hover:text-white">
                      <link.Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-primary">
                        {link.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-slate-500">
                        {link.description}
                      </p>
                    </div>
                    <ChevronRightIcon className="ml-auto h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="page-container">
          <div className="home-cta-pitch pitch-lines">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <p className="home-kicker text-emerald-200">Vẫn còn thắc mắc?</p>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Chúng tôi luôn sẵn sàng hỗ trợ
              </h2>
              <p className="mt-3 text-base leading-7 text-emerald-100/85">
                Gọi {siteContact.hotline} ({siteContact.hotlineHours}) hoặc ghé store Quận 1 —
                tư vấn size giày và đơn hàng miễn phí.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/contact" className="btn-primary rounded-xl px-6">
                  <ContactIcon />
                  Liên hệ ngay
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/45 hover:bg-white/20"
                >
                  Về PitchZone
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default FaqPage;