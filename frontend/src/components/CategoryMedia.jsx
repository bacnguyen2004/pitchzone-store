import {
  getCategoryAccent,
  getCategoryGradient,
  getCategoryIcon,
  getCategoryImage,
} from "../config/categoryVisuals";
import RemoteImage from "./RemoteImage";

const sizeStyles = {
  sm: {
    box: "h-11 w-11 rounded-xl",
    icon: "h-5 w-5",
    badge: "h-6 w-6 rounded-md",
    badgeIcon: "h-3.5 w-3.5",
  },
  md: {
    box: "h-14 w-14 rounded-xl",
    icon: "h-6 w-6",
    badge: "h-7 w-7 rounded-lg",
    badgeIcon: "h-4 w-4",
  },
  lg: {
    box: "h-36 w-full rounded-none sm:h-40",
    icon: "h-8 w-8",
    badge: "h-9 w-9 rounded-xl",
    badgeIcon: "h-5 w-5",
  },
};

function CategoryMedia({
  slug,
  size = "sm",
  variant = "photo",
  className = "",
  showIcon = false,
  imageClassName = "",
}) {
  const image = getCategoryImage(slug);
  const gradient = getCategoryGradient(slug);
  const accent = getCategoryAccent(slug);
  const Icon = getCategoryIcon(slug);
  const styles = sizeStyles[size] || sizeStyles.sm;
  const resolvedImageClass =
    imageClassName ||
    "h-full w-full object-cover transition duration-500 group-hover:scale-105";

  if (variant === "icon") {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden ring-1 ${accent.ring} ${accent.softBg} ${styles.box} ${className}`}
      >
        <div
          className={`flex items-center justify-center ${styles.badge} ${accent.iconBg} text-white shadow-sm`}
        >
          <Icon className={styles.badgeIcon} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden ring-1 ring-black/5 ${imageClassName ? "w-full" : styles.box} ${className}`}
    >
      {image ? (
        <>
          <RemoteImage
            src={image}
            alt=""
            fallbackClassName={`h-full w-full bg-gradient-to-br ${gradient}`}
            className={resolvedImageClass}
          />
          {showIcon && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/55 via-slate-900/25 to-slate-900/10" />
          )}
        </>
      ) : (
        <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
      )}

      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`flex items-center justify-center backdrop-blur-[2px] ${styles.badge} ${accent.iconBg} text-white shadow-md ring-1 ring-white/30`}
          >
            <Icon className={styles.badgeIcon} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryMedia;