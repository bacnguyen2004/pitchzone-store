import { AlertCircleIcon, RefreshIcon } from "./StoreIcons";

export function LoadingPanel({ message = "Đang tải...", className = "" }) {
  return (
    <div className={`page-status is-loading ${className}`.trim()} role="status">
      <span className="page-status-spinner" aria-hidden />
      <p className="page-status-message">{message}</p>
    </div>
  );
}

export function ErrorPanel({
  title = "Không tải được dữ liệu",
  message,
  onRetry,
  retryLabel = "Thử lại",
  className = "",
}) {
  return (
    <div className={`page-status is-error ${className}`.trim()} role="alert">
      <span className="page-status-error-icon" aria-hidden>
        <AlertCircleIcon className="h-6 w-6" />
      </span>
      <div className="page-status-error-body">
        <p className="page-status-error-title">{title}</p>
        {message && <p className="page-status-error-message">{message}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="page-status-retry">
          <RefreshIcon className="h-4 w-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}