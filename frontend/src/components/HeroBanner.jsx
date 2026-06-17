import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { bannerSlides } from "../config/bannerSlides";
import RemoteImage from "./RemoteImage";
import { ChevronLeftIcon, ChevronRightIcon, FootballBootsCategoryIcon } from "./StoreIcons";

const AUTO_PLAY_MS = 6000;

function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((index) => {
    const total = bannerSlides.length;
    setActiveIndex(((index % total) + total) % total);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % bannerSlides.length);
    setProgress(0);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length,
    );
    setProgress(0);
  }, []);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min((elapsed / AUTO_PLAY_MS) * 100, 100));

      if (elapsed >= AUTO_PLAY_MS) {
        goNext();
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [goNext, isPaused, activeIndex]);

  return (
    <section
      className="relative overflow-hidden bg-emerald-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className="relative min-h-[360px] sm:min-h-[460px] lg:min-h-[540px]"
        aria-roledescription="carousel"
        aria-label="Banner PitchZone"
      >
        {bannerSlides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <RemoteImage
                src={slide.image}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-cover ${
                  isActive ? "hero-ken-burns" : "scale-100"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/96 via-emerald-950/60 to-emerald-900/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-emerald-950/35" />
              <div className="pitch-lines absolute inset-0 opacity-35" />

              <div className="relative flex h-full flex-col justify-center px-4 pb-16 pt-12 sm:px-8 sm:pb-20 lg:px-12">
                <div className="page-container">
                  <p
                    className={`home-kicker text-emerald-300 transition-all duration-700 ease-out ${
                      isActive
                        ? "translate-y-0 opacity-100 delay-100"
                        : "translate-y-3 opacity-0"
                    }`}
                  >
                    {slide.eyebrow}
                  </p>
                  <h1
                    className={`mt-4 max-w-2xl text-3xl font-bold leading-[1.08] tracking-tight text-white transition-all duration-700 ease-out sm:text-4xl lg:text-[3.25rem] ${
                      isActive
                        ? "translate-y-0 opacity-100 delay-200"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={`mt-4 max-w-xl text-sm leading-7 text-emerald-100/90 transition-all duration-700 ease-out sm:text-base sm:leading-8 ${
                      isActive
                        ? "translate-y-0 opacity-100 delay-300"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    {slide.description}
                  </p>
                  <div
                    className={`mt-8 flex flex-wrap gap-3 transition-all duration-700 ease-out ${
                      isActive
                        ? "translate-y-0 opacity-100 delay-[400ms]"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    <Link
                      to={slide.cta.to}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-emerald-900 shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-50"
                    >
                      {slide.cta.label}
                    </Link>
                    <a
                      href="#deals"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition duration-300 hover:border-white/40 hover:bg-white/20"
                    >
                      <FootballBootsCategoryIcon className="h-4 w-4" />
                      Deal sốc
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-emerald-950/55 text-white backdrop-blur-md transition duration-300 hover:scale-105 hover:border-white/35 hover:bg-emerald-900/75 sm:left-6"
          aria-label="Slide trước"
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-emerald-950/55 text-white backdrop-blur-md transition duration-300 hover:scale-105 hover:border-white/35 hover:bg-emerald-900/75 sm:right-6"
          aria-label="Slide sau"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 sm:bottom-24">
          <span className="hidden text-xs font-semibold tabular-nums text-emerald-200/80 sm:inline">
            {String(activeIndex + 1).padStart(2, "0")} / {String(bannerSlides.length).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            {bannerSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  index === activeIndex
                    ? "w-9 bg-emerald-400"
                    : "w-2 bg-white/35 hover:w-4 hover:bg-white/60"
                }`}
                aria-label={`Chuyển tới slide ${index + 1}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
        </div>

        <div
          className="hero-slide-progress"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
    </section>
  );
}

export default HeroBanner;