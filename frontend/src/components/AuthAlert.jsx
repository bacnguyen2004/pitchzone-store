import { CheckIcon, ErrorIcon } from "./AuthIcons";

function CloseIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AuthAlert({ title, messages = [], onDismiss, tone = "error" }) {
  if (!messages.length) {
    return null;
  }

  const isSuccess = tone === "success";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`auth-alert animate-auth-alert${isSuccess ? " is-success" : ""}`}
    >
      <div className="flex gap-3">
        <span className="auth-alert-icon" aria-hidden>
          {isSuccess ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <ErrorIcon className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          {title && <p className="auth-alert-title">{title}</p>}

          {messages.length === 1 ? (
            <p className="auth-alert-message">{messages[0]}</p>
          ) : (
            <ul className="auth-alert-list">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="auth-alert-dismiss"
            aria-label="Đóng thông báo"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthAlert;