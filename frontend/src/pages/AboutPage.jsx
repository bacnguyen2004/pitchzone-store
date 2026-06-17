import { useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide1 from "../assets/banner-slide-1.jpg";
import bannerSlide2 from "../assets/banner-slide-2.jpg";
import bannerSlide3 from "../assets/banner-slide-3.jpg";
import AnimateIn from "../components/AnimateIn";
import CategoryMedia from "../components/CategoryMedia";
import Logo, { LogoMark } from "../components/Logo";
import SectionHeader from "../components/SectionHeader";
import {
  aboutFaqs,
  aboutHeroTags,
  aboutMilestones,
  aboutOfferings,
  aboutPartners,
  aboutPerks,
  aboutProcess,
  aboutStats,
  aboutStory,
  aboutTeam,
  aboutTestimonials,
  aboutValues,
  aboutWhyPoints,
} from "../config/aboutContent";
import { siteContact } from "../config/siteContact";
import {
  ChevronRightIcon,
  ContactIcon,
  HomeIcon,
} from "../components/StoreIcons";
import { buildProductsUrl } from "../utils/productFilters";

function StarRow({ count = 5 }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label={`${count} sao`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-sm">
          ★
        </span>
      ))}
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="about-faq-item">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-primary-light/80 sm:px-6 sm:py-5"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-semibold text-slate-900">{item.question}</span>
        <ChevronRightIcon
          className={`h-5 w-5 shrink-0 text-primary transition ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6">
          <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function AboutPage() {
  const { address, hotline, email, foundedYear, workingHours } = siteContact;
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="about-page about-page-body">
      {/* Hero */}
      <section className="products-hero pitch-lines relative min-h-[520px] sm:min-h-[580px] lg:min-h-[640px]">
        <div className="products-hero-bg" aria-hidden>
          <img
            src={bannerSlide1}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="products-hero-overlay" />
          <div className="products-hero-glow" />
        </div>

        <div className="page-container products-hero-content flex min-h-[inherit] flex-col justify-between">
          <nav className="products-breadcrumb">
            <Link to="/" className="products-breadcrumb-link">
              <HomeIcon className="h-4 w-4" />
              Trang chủ
            </Link>
            <span className="text-emerald-700/60">/</span>
            <span className="font-medium text-emerald-100/90">Giới thiệu</span>
          </nav>

          <div className="my-10 grid flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p className="sport-eyebrow-light">
                Từ {foundedYear} · Đồ bóng đá chính hãng
              </p>
              <h1 className="products-hero-title mt-5 max-w-3xl">
                Cửa hàng trang bị bóng đá{" "}
                <span className="text-emerald-300">cho mọi trận đấu</span>
              </h1>
              <p className="products-hero-desc mt-6 max-w-xl sm:text-lg">
                {siteContact.brandName} tuyển chọn giày, áo đấu, bóng và phụ kiện chính hãng — giá
                minh bạch, giao nhanh toàn quốc và tư vấn size miễn phí từ lúc chọn đến sau khi mua.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {aboutHeroTags.map((tag) => (
                  <span key={tag} className="products-hero-perk">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link to={buildProductsUrl()} className="btn-primary rounded-xl px-7 py-3.5">
                  Khám phá sản phẩm
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="about-btn-ghost">
                  <ContactIcon />
                  Tư vấn size giày
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {aboutStats.map((stat, index) => (
                  <AnimateIn key={stat.label} delay={index * 60}>
                    <div className="products-hero-stat">
                      <span className="products-hero-stat-value">{stat.value}</span>
                      <span className="products-hero-stat-label">{stat.label}</span>
                      <p className="mt-1 text-xs text-emerald-200/60">{stat.detail}</p>
                    </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-b border-slate-200 bg-white py-6">
        <div className="page-container">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Thương hiệu đối tác
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 sm:gap-x-14">
            {aboutPartners.map((name) => (
              <span key={name} className="about-partner-name">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section border-b border-slate-200 bg-white pitch-pattern">
        <div className="page-container">
          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
            <AnimateIn className="about-bento lg:col-span-5 lg:row-span-2">
              <p className="sport-eyebrow">Câu chuyện</p>
              <h2 className="mt-4 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
                Mua đồ bóng đá không cần phải phức tạp
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-600">
                {aboutStory.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </AnimateIn>

            <AnimateIn className="relative overflow-hidden rounded-2xl lg:col-span-7 lg:row-span-2" delay={80}>
              <img
                src={bannerSlide2}
                alt="Store đồ bóng đá PitchZone"
                className="h-full min-h-[280px] w-full object-cover lg:min-h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                  Store · Quận 1, TP.HCM
                </p>
                <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Thử giày trước — mua yên tâm sau
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-emerald-100/80">
                  Xem áo đấu và phụ kiện tại store. Đặt lịch qua hotline {hotline}.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn className="about-bento about-mission-card lg:col-span-4" delay={120}>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Sứ mệnh</p>
              <p className="mt-3 text-[15px] leading-7 text-slate-700">
                Giúp mọi người sở hữu trang bị bóng đá đúng nhu cầu, đúng ngân sách — không ép mua,
                không che giấu thông tin.
              </p>
            </AnimateIn>

            <AnimateIn className="about-bento lg:col-span-4" delay={160}>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Tầm nhìn</p>
              <p className="mt-3 text-[15px] leading-7 text-slate-600">
                Trở thành cửa hàng đồ bóng đá được yêu thích nhất tại Việt Nam — chất lượng sản phẩm
                và phục vụ đi đôi với nhau.
              </p>
            </AnimateIn>

            <AnimateIn
              className="about-bento flex items-center gap-4 bg-gradient-to-br from-primary-hover to-emerald-950 text-white lg:col-span-4"
              delay={200}
            >
              <LogoMark size="lg" className="opacity-90" />
              <div>
                <p className="text-sm font-bold">PitchZone</p>
                <p className="mt-1 text-xs text-emerald-200/70">Thành lập {foundedYear}</p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-b border-slate-200 bg-primary-light/60 py-14 sm:py-16">
        <div className="page-container">
          <AnimateIn className="about-quote mx-auto max-w-4xl text-center">
            <p className="relative z-10 text-lg font-medium leading-8 text-slate-700 sm:text-xl sm:leading-9">
              &ldquo;Chúng tôi không bán đồ bóng đá để khoe kho — chúng tôi bán để bạn ra sân tự
              tin hơn, chơi thoải mái hơn và tận hưởng từng trận đấu đúng cách.&rdquo;
            </p>
            <p className="relative z-10 mt-6 text-sm font-bold text-primary">
              — Nguyễn Minh Khôi, Founder PitchZone
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Values */}
      <section className="section border-b border-slate-200 bg-white">
        <div className="page-container">
          <AnimateIn className="mx-auto max-w-2xl text-center">
            <p className="sport-eyebrow">Giá trị cốt lõi</p>
            <h2 className="mt-4 section-title sm:text-3xl">Cam kết với mỗi đơn hàng</h2>
            <p className="section-desc mt-3 text-base">
              Bốn trụ cột định hình mọi quyết định — từ chọn giày đến chăm sóc sau bán.
            </p>
          </AnimateIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutValues.map((item, index) => (
              <AnimateIn key={item.title} delay={index * 70}>
                <div className="about-value-card">
                  <span className="about-value-icon">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section border-b border-slate-200 pitch-pattern bg-gradient-to-b from-white to-primary-light/40">
        <div className="page-container">
          <SectionHeader
            title="Vì sao chọn PitchZone?"
            description="Sáu lý do khách hàng quay lại mỗi khi cần trang bị ra sân."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutWhyPoints.map((point, index) => (
              <AnimateIn key={point.title} delay={index * 60}>
                <div className="about-why-card group">
                  <span className="about-why-index">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-bold text-slate-900">{point.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{point.text}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="about-process-section section">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="sport-eyebrow">Quy trình mua hàng</p>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Đơn giản từ đầu đến cuối
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              Bốn bước rõ ràng — không thủ tục rườm rà, không ẩn phí.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {aboutProcess.map((step, index) => (
              <div key={step.step} className="about-process-card">
                <span className="about-process-step">{step.step}</span>
                <span className="about-process-icon">
                  <step.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{step.description}</p>
                {index < aboutProcess.length - 1 && (
                  <span
                    className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-slate-200 lg:block"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section border-b border-slate-200 bg-white">
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

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutOfferings.map((item, index) => (
              <AnimateIn key={item.slug} delay={index * 60}>
                <Link
                  to={buildProductsUrl({ category: item.slug })}
                  className="group about-category-card"
                >
                  <CategoryMedia slug={item.slug} size="lg" variant="photo" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary">
                        {item.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                        {item.count}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
                      Khám phá ngay
                      <ChevronRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section border-b border-slate-200 bg-primary-light/50 pitch-pattern">
        <div className="page-container">
          <AnimateIn className="mx-auto max-w-2xl text-center">
            <p className="sport-eyebrow">Khách hàng nói gì</p>
            <h2 className="mt-4 section-title sm:text-3xl">Niềm tin từ cầu thủ thật</h2>
          </AnimateIn>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {aboutTestimonials.map((item, index) => (
              <AnimateIn key={item.author} delay={index * 70}>
                <div className="about-bento flex h-full flex-col">
                  <StarRow count={item.rating} />
                  <p className="mt-4 flex-1 text-[15px] leading-7 text-slate-600">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                      {item.author.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.author}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section border-b border-slate-200 bg-white">
        <div className="page-container">
          <SectionHeader
            title="Đội ngũ của chúng tôi"
            description="Những người đam mê bóng đá — và đam mê phục vụ khách hàng."
            align="center"
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aboutTeam.map((member, index) => (
              <AnimateIn key={member.name} delay={index * 70}>
                <div className="about-team-card group">
                  <div className="about-team-header">
                    <div className="about-team-avatar">{member.initials}</div>
                  </div>
                  <div className="about-team-body">
                    <h3 className="font-bold text-slate-900">{member.name}</h3>
                    <p className="mt-0.5 text-sm font-semibold text-primary">{member.role}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{member.bio}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section border-b border-slate-200">
        <div className="page-container">
          <SectionHeader
            title="Hành trình phát triển"
            description={`${foundedYear} – 2026: từng bước xây dựng niềm tin.`}
            align="center"
          />

          <div className="relative mx-auto mt-12 max-w-4xl">
            <div className="about-timeline-line" aria-hidden />
            <div className="space-y-6">
              {aboutMilestones.map((item, index) => (
                <AnimateIn key={item.year} delay={index * 60}>
                  <div className="relative flex gap-6 sm:gap-8">
                    <div className="about-timeline-dot">{item.year.slice(2)}</div>
                    <div className="about-bento flex-1 !py-5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-sm font-bold text-primary">{item.year}</span>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section border-b border-slate-200 bg-white">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <AnimateIn>
              <p className="sport-eyebrow">Câu hỏi thường gặp</p>
              <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                Bạn thắc mắc? Chúng tôi có câu trả lời.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-slate-600">
                Không tìm thấy thông tin cần thiết? Xem thêm trang FAQ hoặc liên hệ trực tiếp —
                đội ngũ phản hồi trong vòng 24 giờ.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/faq" className="btn-secondary rounded-xl">
                  Xem FAQ đầy đủ
                </Link>
                <Link to="/policy" className="link-action">
                  Chính sách cửa hàng
                  <ChevronRightIcon />
                </Link>
              </div>
            </AnimateIn>

            <div className="space-y-3">
              {aboutFaqs.map((item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section border-b border-slate-200">
        <div className="page-container">
          <div className="grid gap-6 lg:grid-cols-12">
            <AnimateIn className="about-bento lg:col-span-5">
              <p className="sport-eyebrow">Liên hệ</p>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Ghé thăm store</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Trung tâm Quận 1 — dễ tìm, có chỗ để xe. Mang theo nhu cầu cụ thể, chúng tôi tư vấn
                đúng mẫu bạn quan tâm.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ</p>
                  <p className="mt-2 font-semibold text-slate-900">{address.line1}</p>
                  <p className="text-slate-600">
                    {address.line2}, {address.city}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-primary-light p-4 ring-1 ring-primary/15">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary/80">
                      Hotline
                    </p>
                    <p className="mt-2 text-xl font-bold text-primary-hover">{hotline}</p>
                    <p className="mt-1 text-xs text-slate-500">{siteContact.hotlineHours}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</p>
                    <p className="mt-2 font-semibold text-slate-900">{email}</p>
                    <p className="mt-1 text-xs text-slate-500">{workingHours.support}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">{workingHours.weekdays}</p>
              </div>

              <Link to="/contact" className="btn-primary mt-6 rounded-xl">
                <ContactIcon />
                Gửi tin nhắn
              </Link>
            </AnimateIn>

            <AnimateIn className="relative overflow-hidden rounded-2xl lg:col-span-7" delay={80}>
              <img
                src={bannerSlide3}
                alt="PitchZone store"
                className="h-full min-h-[320px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                <div className="flex justify-end">
                  <Logo variant="light" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {aboutPerks.map((perk) => (
                    <div key={perk.title} className="about-perk-tile">
                      <perk.Icon className="h-5 w-5 text-emerald-300" />
                      <p className="mt-2 text-sm font-bold text-white">{perk.title}</p>
                      <p className="mt-1 text-xs leading-5 text-emerald-100/75">{perk.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="page-container">
          <AnimateIn>
            <div className="home-cta-pitch pitch-lines">
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <p className="home-kicker text-emerald-200">Sẵn sàng ra sân?</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Trang bị đủ bộ cho trận đấu tới
                </h2>
                <p className="mt-4 text-base leading-8 text-emerald-100/85 sm:text-lg">
                  Hàng trăm sản phẩm đang chờ bạn khám phá. Đặt hàng online hoặc ghé store —
                  PitchZone luôn sẵn sàng đồng hành.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to={buildProductsUrl()}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[15px] font-bold text-primary-hover shadow-lg shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:bg-primary-light"
                  >
                    Bắt đầu mua sắm
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition hover:border-white/45 hover:bg-white/20"
                  >
                    <ContactIcon />
                    Liên hệ tư vấn
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