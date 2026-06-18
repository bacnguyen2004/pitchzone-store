import { useEffect } from "react";

function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`admin-modal${size !== "md" ? ` is-${size}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="admin-modal-head">
          <div>
            <h2 id="admin-modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="admin-modal-close"
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <div className="admin-modal-body">{children}</div>

        {footer && <footer className="admin-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export default AdminModal;