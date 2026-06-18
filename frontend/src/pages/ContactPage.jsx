import { useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide2 from "../assets/banner-slide-2.jpg";
import bannerSlide3 from "../assets/banner-slide-3.jpg";
import { CheckIcon } from "../components/AuthIcons";
import InfoFaqItem from "../components/InfoFaqItem";
import InfoPageHero from "../components/InfoPageHero";
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
  MapPinIcon,
} from "../components/StoreIcons";
import { buildProductsUrl } from "../utils/productFilters";

function resolveChannelValue(key) {
  const { address, hotlineDisplay, email, workingHours } = siteContact;

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
      <span className={`info-channel-icon bg-gradient-to-br ${channel.accent}`}>
        <channel.Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-bold text-slate-900">{channel.title}</h3>
      <p className="mt-1.5 text-sm text-slate-500">{channel.description}</p>
      <p className="mt-3 font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </>
  );

  if (href) {
    return (
      <a href={href} className="info-channel-card group">
        {content}
      </a>
    );
  }

  return <div className="info-channel-card">{content}</div>;
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
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.full)}`;

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="info-page">
      <InfoPageHero
        banner={bannerSlide2}
        breadcrumbLabel="Liên hệ"
        eyebrow="Hỗ trợ khách hàng"
        title="Luôn sẵn sàng tư vấn trang bị bóng đá"
        description="Tư vấn size giày, hỗ trợ đơn hàng hoặc ghé store — PitchZone phản hồi trong vòng 24 giờ."
        compact
      />

      <section className="info-page-section">
        <div className="page-container">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contactChannels.map((channel) => (
              <ChannelCard key={channel.title} channel={channel} />
            ))}
          </div>
        </div>
      </section>

      <section className="info-page-section is-muted">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="sport-eyebrow">Gửi tin nhắn</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Điền form — chúng tôi sẽ phản hồi sớm</h2>

              <form onSubmit={handleSubmit} className="about-bento mt-5">
                {submitted ? (
                  <div className="py-8 text-center">
                    <span className="page-empty-state-icon !mx-0 inline-flex">
                      <CheckIcon className="h-7 w-7 text-primary" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">Đã gửi thành công!</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                      Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi qua email trong 24 giờ làm việc.
                    </p>
                    <div className="page-empty-state-actions">
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
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
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
                        <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
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
                        rows={5}
                        className="input-field mt-1.5 resize-y"
                        placeholder="Size chân, mặt sân, mẫu giày quan tâm..."
                      />
                    </label>
                    <button type="submit" className="btn-primary rounded-xl">
                      <ContactIcon />
                      Gửi tin nhắn
                    </button>
                  </div>
                )}
              </form>
            </div>

            <aside className="lg:col-span-5">
              <div className="info-page-aside-card">
                <div className="about-bento about-mission-card">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Mẹo gửi form</p>
                  <ul className="mt-3 space-y-2">
                    {contactFormTips.map((tip) => (
                      <li key={tip} className="flex gap-2 text-sm text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {contactQuickHelp.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="about-bento group flex gap-3 !p-4 transition hover:border-primary/25"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <item.Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="info-page-section">
        <div className="page-container">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="about-bento">
              <p className="sport-eyebrow">Store</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Ghé thăm PitchZone tại Quận 1</h2>
              <div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-4">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-slate-900">{address.line1}</p>
                  <p className="text-sm text-slate-600">
                    {address.line2}, {address.city}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{siteContact.workingHours.store}</p>
                </div>
              </div>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 rounded-xl">
                <MapPinIcon className="h-4 w-4" />
                Chỉ đường Google Maps
              </a>
            </div>

            <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-slate-200">
              <img src={bannerSlide3} alt="Store PitchZone" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/85 to-emerald-900/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="info-page-section is-muted">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="sport-eyebrow">Hỏi nhanh</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Một vài câu hỏi phổ biến</h2>
              <Link to="/faq" className="link-action mt-3">
                Xem tất cả câu hỏi
                <ChevronRightIcon />
              </Link>
            </div>
            <div className="space-y-2">
              {contactMiniFaqs.map((item, index) => (
                <InfoFaqItem
                  key={item.question}
                  item={item}
                  compact
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;