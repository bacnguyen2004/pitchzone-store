function IconBase({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function CartIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M6 6h15l-1.5 9H8L6 6zM6 6L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
      />
    </IconBase>
  );
}

export function OrdersIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </IconBase>
  );
}

export function UserIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
      />
    </IconBase>
  );
}

export function MailIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 6h16v12H4V6zM4 6l8 6 8-6"
      />
    </IconBase>
  );
}

export function LockIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M7 11V7a5 5 0 0110 0v4M6 11h12v10H6V11z"
      />
    </IconBase>
  );
}

export function EyeIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
      />
      <circle cx="12" cy="12" r="3" strokeWidth={1.75} />
    </IconBase>
  );
}

export function EyeOffIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 3l18 18M10.5 10.7A3 3 0 0012 15a3 3 0 002.3-4.3M7.2 7.2C5.4 8.4 3.9 10.2 2 12c0 0 3.5 7 10 7 1.8 0 3.4-.5 4.8-1.2M14 9.3C14.6 9.8 15 10.6 15 11.5c0 1.7-1.3 3-3 3-.9 0-1.7-.4-2.2-1"
      />
    </IconBase>
  );
}

export function CheckIcon({ className = "h-3 w-3" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function LogoutIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M15 3h4a1 1 0 011 1v16a1 1 0 01-1 1h-4M10 17l5-5-5-5M15 12H3"
      />
    </IconBase>
  );
}

export function ErrorIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  );
}