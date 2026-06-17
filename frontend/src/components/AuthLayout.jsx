import { Link } from "react-router-dom";

import { CheckIcon } from "./AuthIcons";
import Logo from "./Logo";

function AuthLayout({
  visual,
  visualAlt,
  eyebrow,
  title,
  subtitle,
  features = [],
  children,
  footer,
}) {
  return (
    <main className="font-auth relative min-h-[calc(100vh-150px)] overflow-hidden bg-emerald-950">
      <div className="absolute inset-0 lg:hidden" aria-hidden>
        <img
          src={visual}
          alt=""
          className="h-full w-full scale-110 object-cover blur-2xl"
        />
        <div className="absolute inset-0 bg-emerald-950/85" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-150px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:py-14">
        <section className="grid w-full overflow-hidden rounded-xl border border-white/10 bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden min-h-[600px] lg:block">
            <img
              src={visual}
              alt={visualAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/55 to-emerald-950/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/65 to-transparent" />

            <div className="relative flex h-full flex-col justify-between p-10">
              <Link to="/" className="transition-opacity hover:opacity-90">
                <Logo size="lg" variant="light" />
              </Link>

              <div>
                <p className="text-sm font-medium text-emerald-200/90">{eyebrow}</p>
                <h1 className="mt-2 max-w-md text-[2rem] font-semibold leading-[1.35] tracking-tight text-white">
                  {title}
                </h1>
                <p className="mt-3 max-w-sm text-[15px] leading-7 text-zinc-300/90">
                  {subtitle}
                </p>

                {features.length > 0 && (
                  <ul className="mt-8 space-y-3.5">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[15px] leading-6 text-zinc-200/90"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-200">
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="mb-8 lg:hidden">
              <Logo />
              <p className="mt-2 text-sm font-normal text-zinc-500">{eyebrow}</p>
            </div>

            {children}

            {footer && (
              <p className="mt-8 text-center text-[15px] leading-6 text-zinc-500">
                {footer}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;