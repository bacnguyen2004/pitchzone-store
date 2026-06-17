import { useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide2 from "../assets/banner-slide-2.jpg";
import bannerSlide3 from "../assets/banner-slide-3.jpg";
import { CheckIcon } from "../components/AuthIcons";
import {
  contactChannels,
  contactFormTips,
  contactMiniFaqs,
  contactQuickHelp,
  contactTopics,
} from "../config/contactContent";
import { siteContact } from "../config/siteContact";
import {
  ChevronRightIcon,
  ContactIcon,
  HomeIcon,
  MapPinIcon,
} from "../components/StoreIcons";
import { buildProductsUrl } from "../utils/productFilters";

function resolveChannelValue(key) {
  const { address, hotlineDisplay, email, hotlineHours, workingHours } = siteContact;

  const map = {
    hotline: hotlineDisplay,
    email,
    addressShort: address.line1,
    weekdays: workingHours.weekdays,
  };

  return map[key] || "";
}

function resolveChannelHint(key) {
  const { hotlineHours, workingHours } = siteContact;

  const map = {
    hotlineHours,
    support: workingHours.support,
    store: workingHours.store,
  };

  return map[key] || "";
}

function ChannelCard({ channel }) {
  const value = resolveChannelValue(channel.valueKey);
  const hint = resolveChannelHint(channel.hintKey);
  const href =
    channel.action === "tel"
      ? `tel:${siteContact.hotlineTel}`
      : channel.action === "mailto"
        ? `mailto:${siteContact.email}`
        : null;

  const content = (
    <>
      <span
        className={`info-channel-icon bg-gradient-to-br ${channel.accent}`}
      >
        <channel.Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-base font-bold text-slate-900">{channel.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{channel.description}</p>
      <p className="mt-4 text-[15px] font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="info-channel-card group"
      >
        {content}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition group-hover:opacity-100">
          Liên hệ ngay
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </span>
      </a>
    );
  }

  return <div className="info-channel-card">{content}</div>;
}

function MiniFaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="about-faq-item">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-primary-light/80"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-slate-900">{item.question}</span>
        <ChevronRightIcon
          className={`h-5 w-5 shrink-0 text-primary transition ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-5 pb-4 pt-3">
          <p className="text-sm leading-6 text-slate-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: contactTopics[0].value,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const { address } = siteContact;

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.full)}`;

  return (
    <main className="about-page-body">
      {/* Hero */}
      <section className="products-hero pitch-lines relative overflow-hidden">
        <div className="products-hero-bg" aria-hidden>
          <img src={bannerSlide2} alt="" className="h-full w-full object-cover" />
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
            <span className="font-medium text-emerald-100/90">Liên hệ</span>
          </nav>

          <div className="mt-8 max-w-2xl">
            <p className="sport-eyebrow-light">Hỗ trợ khách hàng</p>
            <h1 className="products-hero-title mt-4">
              Luôn sẵn sàng tư vấn trang bị bóng đá
            </h1>
            <p className="products-hero-desc mt-5 sm:text-lg">
              Tư vấn size giày, hỗ trợ đơn hàng, bảo hành hay ghé store — chọn kênh phù hợp
              hoặc gửi form, PitchZone phản hồi trong vòng 24 giờ.
            </p>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="section border-b border-slate-200 bg-white">
        <div className="page-container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactChannels.map((channel) => (
              <ChannelCard key={channel.title} channel={channel} />
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section border-b border-slate-200">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="sport-eyebrow">Gửi tin nhắn</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                Điền form — chúng tôi sẽ phản hồi sớm
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Mọi thông tin được bảo mật và chỉ dùng để hỗ trợ yêu cầu của bạn.
              </p>

              <form onSubmit={handleSubmit} className="about-bento mt-6">
                {submitted ? (
                  <div className="py-6 text-center sm:py-10">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                      <CheckIcon className="h-7 w-7" />
                    </span>
                    <h3 className="mt-5 text-xl font-bold text-slate-900">
                      Đã gửi thành công!
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                      Cảm ơn bạn đã liên hệ. Đội ngũ PitchZone sẽ phản hồi qua email trong vòng
                      24 giờ làm việc.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Link to={buildProductsUrl()} className="btn-primary rounded-xl">
                        Xem sản phẩm
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setForm({
                            name: "",
                            email: "",
                            phone: "",
                            topic: contactTopics[0].value,
                            message: "",
                          });
                        }}
                        className="btn-secondary rounded-xl"
                      >
                        Gửi yêu cầu khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                          Họ tên <span className="text-red-500">*</span>
                        </span>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="input-field mt-1.5"
                          placeholder="Nguyễn Văn A"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                          Số điện thoại
                        </span>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          className="input-field mt-1.5"
                          placeholder="09xx xxx xxx"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="input-field mt-1.5"
                        placeholder="ban@email.com"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Chủ đề <span className="text-red-500">*</span>
                      </span>
                      <select
                        name="topic"
                        value={form.topic}
                        onChange={handleChange}
                        className="input-field mt-1.5"
                      >
                        {contactTopics.map((topic) => (
                          <option key={topic.value} value={topic.value}>
                            {topic.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Nội dung <span className="text-red-500">*</span>
                      </span>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="input-field mt-1.5 resize-y"
                        placeholder="Size chân, mặt sân, mẫu giày quan tâm, mã đơn hàng..."
                      />
                    </label>

                    <button type="submit" className="btn-primary w-full rounded-xl py-3 sm:w-auto">
                      <ContactIcon />
                      Gửi tin nhắn
                    </button>
                  </div>
                )}
              </form>
            </div>

            <aside className="lg:col-span-5">
              <div className="about-bento about-mission-card">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Mẹo gửi form hiệu quả
                </p>
                <ul className="mt-4 space-y-3">
                  {contactFormTips.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm leading-6 text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-3">
                {contactQuickHelp.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="about-bento group flex gap-4 !p-4 transition hover:-translate-y-0.5 hover:border-primary/25"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary transition group-hover:bg-primary group-hover:text-white">
                      <item.Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-primary">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRightIcon className="ml-auto h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </div>

              <div className="about-bento mt-4 border-dashed border-slate-300 bg-slate-50">
                <p className="text-sm font-bold text-slate-900">Kết nối với chúng tôi</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>{siteContact.social.facebook}</p>
                  <p>{siteContact.social.zalo}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Store */}
      <section className="section border-b border-slate-200 bg-white">
        <div className="page-container">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="about-bento flex flex-col justify-between">
              <div>
                <p className="sport-eyebrow">Store</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  Ghé thăm PitchZone tại Quận 1
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Không gian trải nghiệm rộng rãi — thử giày, xem áo đấu và phụ kiện trước khi
                  mua. Nhân viên tư vấn size tại chỗ, không ép mua.
                </p>

                <div className="mt-6 rounded-xl bg-slate-50 p-5">
                  <div className="flex gap-3">
                    <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-900">{address.line1}</p>
                      <p className="text-slate-600">
                        {address.line2}, {address.city}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{siteContact.workingHours.store}</p>
                </div>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 inline-flex w-fit rounded-xl"
              >
                <MapPinIcon className="h-4 w-4" />
                Chỉ đường Google Maps
              </a>
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 lg:min-h-full">
              <img
                src={bannerSlide3}
                alt="Store PitchZone"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/85 to-emerald-900/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                  <MapPinIcon className="h-7 w-7" />
                </span>
                <p className="mt-4 text-lg font-bold">PitchZone</p>
                <p className="mt-1 max-w-xs text-sm text-emerald-100/85">{address.full}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
                >
                  Mở bản đồ
                  <ChevronRightIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mini FAQ */}
      <section className="section border-b border-slate-200">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="sport-eyebrow">Hỏi nhanh</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Một vài câu hỏi phổ biến
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Không tìm thấy câu trả lời? Xem trang FAQ đầy đủ hoặc gọi hotline{" "}
                <a href={`tel:${siteContact.hotlineTel}`} className="font-bold text-primary">
                  {siteContact.hotline}
                </a>
                .
              </p>
              <Link to="/faq" className="link-action mt-4">
                Xem tất cả câu hỏi
                <ChevronRightIcon />
              </Link>
            </div>

            <div className="space-y-3">
              {contactMiniFaqs.map((item, index) => (
                <MiniFaqItem
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

      {/* CTA */}
      <section className="section">
        <div className="page-container">
          <div className="home-cta-pitch pitch-lines">
            <div className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <p className="home-kicker text-emerald-200">Cần gợi ý trang bị?</p>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Giày, áo đấu, bóng — chọn nhanh online
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-100/85 sm:text-base">
                  Duyệt danh mục, lọc thương hiệu và đặt hàng — hoặc ghé store thử giày trực
                  tiếp.
                </p>
              </div>
              <Link
                to={buildProductsUrl()}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary-hover shadow-lg shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:bg-primary-light"
              >
                Khám phá sản phẩm
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;