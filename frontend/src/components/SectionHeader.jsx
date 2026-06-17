const lightAccents = {
  emerald: {
    eyebrow: "text-emerald-300",
    desc: "text-emerald-100/80",
  },
  amber: {
    eyebrow: "text-amber-200",
    desc: "text-amber-50/80",
  },
  rose: {
    eyebrow: "text-rose-200",
    desc: "text-rose-50/80",
  },
};

function SectionHeader({
  title,
  description,
  action,
  align = "between",
  eyebrow,
  light = false,
  accent = "emerald",
}) {
  const alignClass =
    align === "center"
      ? "flex-col items-center text-center"
      : "items-end justify-between";

  const palette = lightAccents[accent] || lightAccents.emerald;

  const titleClass = light
    ? "text-xl font-bold tracking-tight text-white sm:text-2xl"
    : "section-title";

  const descClass = light
    ? `mt-1 text-sm leading-6 ${palette.desc}`
    : "section-desc";

  const eyebrowClass = light
    ? `text-xs font-bold uppercase tracking-[0.2em] ${palette.eyebrow}`
    : "sport-eyebrow";

  return (
    <div className={`flex gap-4 ${alignClass}`}>
      <div className={align === "center" ? "max-w-lg" : ""}>
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        <h2 className={`${titleClass} ${eyebrow ? "mt-2" : ""}`}>{title}</h2>
        {description && <p className={descClass}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default SectionHeader;