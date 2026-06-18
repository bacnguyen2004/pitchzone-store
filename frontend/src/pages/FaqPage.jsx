import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide3 from "../assets/banner-slide-3.jpg";
import EmptyState from "../components/EmptyState";
import InfoFaqItem from "../components/InfoFaqItem";
import InfoPageHero from "../components/InfoPageHero";
import {
  faqCategories,
  faqItems,
  faqQuickLinks,
} from "../config/faqContent";
import { siteContact } from "../config/siteContact";
import {
  ContactIcon,
  PhoneIcon,
  SearchIcon,
} from "../components/StoreIcons";

function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState(faqItems.find((i) => i.popular)?.id || faqItems[0]?.id);

  const popularItems = useMemo(() => faqItems.filter((item) => item.popular), []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchCategory = activeCategory === "all" || item.category === activeCategory;
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
    <main className="info-page">
      <InfoPageHero
        banner={bannerSlide3}
        breadcrumbLabel="FAQ"
        eyebrow="Trung tâm trợ giúp"
        title="Câu hỏi thường gặp"
        description="Giải đáp về mua hàng, giao hàng, đổi trả và size giày — tìm nhanh bằng ô tìm kiếm hoặc lọc theo chủ đề."
        panel={
          <label className="products-hero-search">
            <span className="products-hero-search-icon">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm: giao hàng, size giày..."
              className="products-hero-search-input"
            />
          </label>
        }
        compact
      />

      {!searchQuery.trim() && activeCategory === "all" && (
        <section className="border-b border-slate-200 bg-white py-6">
          <div className="page-container">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Được hỏi nhiều nhất
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
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
                  className="pill pill-inactive text-xs"
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="info-page-section is-muted !border-b-0">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-12">
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
                <EmptyState
                  className="mt-6"
                  icon={SearchIcon}
                  title="Không tìm thấy câu hỏi phù hợp"
                  description="Thử từ khóa khác hoặc liên hệ trực tiếp với chúng tôi."
                  actionTo="/contact"
                  actionLabel="Liên hệ hỗ trợ"
                  tone="emerald"
                />
              ) : (
                <div className="mt-5 space-y-6">
                  {groupedItems.map((group) => (
                    <div key={group.id}>
                      {group.id !== "results" && (
                        <div className="mb-3 flex items-center gap-2">
                          {group.Icon && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary">
                              <group.Icon className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <h2 className="font-bold text-slate-900">{group.label}</h2>
                          <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                            {group.items.length}
                          </span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <div key={item.id} id={`faq-${item.id}`}>
                            <InfoFaqItem
                              item={item}
                              isOpen={openId === item.id}
                              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
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
              <div className="info-page-aside-card">
                <div className="about-bento about-mission-card">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Cần hỗ trợ?</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Đội ngũ PitchZone sẵn sàng tư vấn size giày và hỗ trợ đơn hàng.
                  </p>
                  <a
                    href={`tel:${siteContact.hotlineTel}`}
                    className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                      <PhoneIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Hotline</p>
                      <p className="font-bold text-primary">{siteContact.hotline}</p>
                    </div>
                  </a>
                  <Link to="/contact" className="btn-primary mt-3 w-full rounded-xl">
                    <ContactIcon />
                    Gửi tin nhắn
                  </Link>
                </div>

                {faqQuickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="about-bento group flex gap-3 !p-4 transition hover:border-primary/25"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <link.Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">{link.title}</p>
                      <p className="text-sm text-slate-500">{link.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

export default FaqPage;