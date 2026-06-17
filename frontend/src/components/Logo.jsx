import logoMark from "../assets/logo.svg";

const markSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-11 w-11",
};

const textStyles = {
  default: {
    brand: "text-lg font-semibold leading-5 text-slate-900",
    tagline: "text-sm font-normal text-slate-500",
  },
  light: {
    brand: "text-base font-semibold leading-5 text-white",
    tagline: "text-sm font-normal text-slate-300",
  },
};

function LogoMark({ size = "md", className = "" }) {
  return (
    <img
      src={logoMark}
      alt=""
      aria-hidden
      className={`${markSizes[size]} shrink-0 ${className}`}
    />
  );
}

function Logo({
  size = "md",
  variant = "default",
  showText = true,
  markOnly = false,
  className = "",
}) {
  const styles = textStyles[variant] || textStyles.default;

  if (markOnly) {
    return <LogoMark size={size} className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span>
          <span className={`block ${styles.brand}`}>PitchZone</span>
          <span className={styles.tagline}>Football Gear</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
export { LogoMark };