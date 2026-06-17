import { useEffect, useState } from "react";

import { ClockIcon } from "./StoreIcons";

function pad(value) {
  return String(value).padStart(2, "0");
}

function getTimeLeft(endDate) {
  const diff = Math.max(endDate.getTime() - Date.now(), 0);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: diff === 0,
  };
}

function CountdownUnit({ label, value, variant }) {
  return (
    <div
      className={
        variant === "light" ? "deal-countdown-unit-light" : "deal-countdown-unit"
      }
    >
      <span
        className={
          variant === "light"
            ? "deal-countdown-value-light"
            : "deal-countdown-value"
        }
      >
        {pad(value)}
      </span>
      <span
        className={
          variant === "light"
            ? "deal-countdown-label-light"
            : "deal-countdown-label"
        }
      >
        {label}
      </span>
    </div>
  );
}

function DealCountdown({ endDate, variant = "compact" }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(endDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return (
      <p className="text-xs font-semibold text-amber-700">Deal đã kết thúc</p>
    );
  }

  if (variant === "compact") {
    const clock = timeLeft.days > 0
      ? `${timeLeft.days}d ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
      : `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;

    return (
      <div className="deal-countdown-compact" aria-live="polite">
        <span className="deal-countdown-compact-icon" aria-hidden>
          <ClockIcon className="h-4 w-4" />
        </span>
        <span className="deal-countdown-compact-kicker">Kết thúc sau</span>
        <span className="deal-countdown-compact-clock">{clock}</span>
      </div>
    );
  }

  return (
    <div className="deal-countdown" aria-live="polite">
      {timeLeft.days > 0 && (
        <CountdownUnit label="Ngày" value={timeLeft.days} variant={variant} />
      )}
      <CountdownUnit label="Giờ" value={timeLeft.hours} variant={variant} />
      <CountdownUnit label="Phút" value={timeLeft.minutes} variant={variant} />
      <CountdownUnit label="Giây" value={timeLeft.seconds} variant={variant} />
    </div>
  );
}

export default DealCountdown;