import { useState } from "react";

import { validateVoucher } from "../api/vouchers";
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

  async function handleApply(event) {
    event.preventDefault();

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Nhập mã voucher.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const result = await validateVoucher({
        code: trimmed,
        subtotal,
      });
      onApply({
        code: result.code,
        discountAmount: Number(result.discount_amount),
        description: result.description,
      });
      setCode(result.code);
      setStatus("success");
    } catch (err) {
      const voucherError = err?.response?.data?.voucher_code;
      setError(
        typeof voucherError === "string"
          ? voucherError
          : "Mã voucher không hợp lệ.",
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

      <form onSubmit={handleApply} className="checkout-voucher-form">
        <input
          type="text"
          name="voucher_code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Nhập mã — VD: PITCH10"
          className="checkout-voucher-input"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-secondary checkout-voucher-apply"
        >
          {status === "loading" ? "Đang kiểm tra..." : "Áp dụng"}
        </button>
      </form>

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