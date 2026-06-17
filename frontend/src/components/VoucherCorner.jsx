import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { getActiveVouchers } from "../api/vouchers";
import { formatCurrency } from "../utils/format";
import { CheckIcon } from "./AuthIcons";
import { ChevronDownIcon, TagIcon } from "./StoreIcons";

const DISMISS_KEY = "pitchzone-voucher-corner-dismissed";

function formatVoucherOffer(voucher) {
  if (voucher.discount_type === "fixed") {
    return `Giảm ${formatCurrency(voucher.discount_value)}`;
  }

  const percent = Number(voucher.discount_value);
  const cap = voucher.max_discount_amount
    ? ` (tối đa ${formatCurrency(voucher.max_discount_amount)})`
    : "";

  return `Giảm ${percent}%${cap}`;
}

function formatMinOrder(amount) {
  const value = Number(amount || 0);
  if (value <= 0) {
    return null;
  }

  return `Đơn từ ${formatCurrency(value)}`;
}

function VoucherCorner() {
  const location = useLocation();
  const [vouchers, setVouchers] = useState([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1",
  );
  const [copiedCode, setCopiedCode] = useState("");
  const [status, setStatus] = useState("idle");

  const hasMobileBar =
    location.pathname === "/cart" || location.pathname === "/checkout";
  const isCheckout = location.pathname === "/checkout";

  useEffect(() => {
    let ignore = false;

    async function loadVouchers() {
      setStatus("loading");

      try {
        const data = await getActiveVouchers();
        if (!ignore) {
          setVouchers(Array.isArray(data) ? data : []);
          setStatus("success");
        }
      } catch {
        if (!ignore) {
          setVouchers([]);
          setStatus("error");
        }
      }
    }

    loadVouchers();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!copiedCode) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopiedCode(""), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedCode]);

  if (status === "success" && vouchers.length === 0) {
    return null;
  }

  async function handleCopy(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch {
      setCopiedCode("");
    }
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    setOpen(false);
  }

  if (dismissed && !open) {
    return (
      <button
        type="button"
        onClick={() => {
          sessionStorage.removeItem(DISMISS_KEY);
          setDismissed(false);
          setOpen(true);
        }}
        className={`voucher-corner-fab voucher-corner-fab-mini ${
          hasMobileBar ? "has-mobile-bar" : ""
        }`}
        aria-label="Xem mã voucher"
      >
        <TagIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className={`voucher-corner ${hasMobileBar ? "has-mobile-bar" : ""}`}
      aria-live="polite"
    >
      {open && (
        <div className="voucher-corner-panel">
          <div className="voucher-corner-panel-head">
            <div>
              <p className="voucher-corner-eyebrow">Ưu đãi</p>
              <h2 className="voucher-corner-title">Mã giảm giá</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="voucher-corner-close"
              aria-label="Thu gọn"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="voucher-corner-list">
            {status === "loading" &&
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="voucher-corner-item skeleton-shimmer h-16 rounded-xl"
                />
              ))}

            {status === "success" &&
              vouchers.map((voucher) => {
                const minOrder = formatMinOrder(voucher.min_order_amount);
                const isCopied = copiedCode === voucher.code;

                return (
                  <div key={voucher.code} className="voucher-corner-item">
                    <div className="min-w-0 flex-1">
                      <p className="voucher-corner-code">{voucher.code}</p>
                      <p className="voucher-corner-offer">
                        {formatVoucherOffer(voucher)}
                      </p>
                      <p className="voucher-corner-desc">
                        {voucher.description || minOrder}
                      </p>
                      {voucher.description && minOrder && (
                        <p className="voucher-corner-meta">{minOrder}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(voucher.code)}
                      className={`voucher-corner-copy ${
                        isCopied ? "is-copied" : ""
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5" />
                          Đã copy
                        </>
                      ) : (
                        "Sao chép"
                      )}
                    </button>
                  </div>
                );
              })}
          </div>

          {isCheckout ? (
            <p className="voucher-corner-foot">
              Dán mã vào ô voucher ở form thanh toán.
            </p>
          ) : (
            <Link to="/checkout" className="voucher-corner-foot-link">
              Dùng khi thanh toán
            </Link>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="voucher-corner-dismiss"
          >
            Ẩn đến hết phiên
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`voucher-corner-fab ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-label={open ? "Thu gọn voucher" : "Xem mã voucher"}
      >
        <TagIcon className="h-4 w-4" />
        <span>Voucher</span>
        {vouchers.length > 0 && (
          <span className="voucher-corner-count">{vouchers.length}</span>
        )}
      </button>
    </div>
  );
}

export default VoucherCorner;