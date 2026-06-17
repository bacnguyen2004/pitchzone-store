import RemoteImage from "../RemoteImage";
import { ImagePlaceholderIcon } from "../StoreIcons";

function AdminThumb({ src, alt = "", size = "md" }) {
  const sizeClass =
    size === "lg" ? "admin-thumb is-lg" : size === "sm" ? "admin-thumb is-sm" : "admin-thumb";

  return (
    <div className={sizeClass}>
      {src ? (
        <RemoteImage
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          fallbackClassName="admin-thumb-fallback"
        />
      ) : (
        <div className="admin-thumb-fallback" aria-hidden>
          <ImagePlaceholderIcon className="h-4 w-4 text-slate-400" />
        </div>
      )}
    </div>
  );
}

export default AdminThumb;