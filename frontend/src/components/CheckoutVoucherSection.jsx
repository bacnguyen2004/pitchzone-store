import { useState } from "react";

import { validateVoucher } from "../api/vouchers";
import { getApiErrorMessage } from "../utils/apiErrors";
import { formatCurrency } from "../utils/format";

function CheckoutVoucherSection({
  subtotal,
  appliedCode,
  discountAmount,
  onApply,
  onClear,
}) {
  const [code, setCode] = useState(appliedCode || "");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Nhập mã voucher.");
      return;
    }

    if (!subtotal || subtotal <= 0) {
      setError("Giỏ hàng trống hoặc đang tải — không thể áp mã.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const result = await validateVoucher({
        code: trimmed,
        subtotal: Number(subtotal).toFixed(2),
      });
      const discountAmount = Number(result.discount_amount);

      if (!result.code || Number.isNaN(discountAmount) || discountAmount <= 0) {
        throw new Error("invalid voucher response");
      }

      onApply({
        code: result.code,
        discountAmount,
        description: result.description,
      });
      setCode(result.code);
      setStatus("success");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Mã voucher không hợp lệ hoặc không áp dụng được."),
      );
      setStatus("error");
      onClear();
    }
  }

  function handleClear() {
    setCode("");
    setError("");
    setStatus("idle");
    onClear();
  }

  return (
    <div className="checkout-voucher">
      <div className="checkout-voucher-head">
        <h3>Mã giảm giá</h3>
        {appliedCode && discountAmount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="checkout-voucher-clear"
          >
            Gỡ mã
          </button>
        )}
      </div>

      <div className="checkout-voucher-form">
        <input
          type="text"
          name="voucher_code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleApply();
            }
          }}
          placeholder="Nhập mã — VD: PITCH10"
          className="checkout-voucher-input"
          disabled={status === "loading"}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={status === "loading" || !subtotal || subtotal <= 0}
          className="btn-secondary checkout-voucher-apply"
        >
          {status === "loading" ? "Đang kiểm tra..." : "Áp dụng"}
        </button>
      </div>

      {error && (
        <p role="alert" className="checkout-voucher-error">
          {error}
        </p>
      )}

      {appliedCode && discountAmount > 0 && (
        <p className="checkout-voucher-success">
          Đã áp dụng <strong>{appliedCode}</strong> — giảm{" "}
          {formatCurrency(discountAmount)}
        </p>
      )}
    </div>
  );
}

export default CheckoutVoucherSection;
