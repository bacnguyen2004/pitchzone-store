import { Link } from "react-router-dom";

import AddressSelector from "./AddressSelector";
import { MapPinIcon, PhoneIcon } from "./StoreIcons";

function CheckoutAddressSection({
  addresses,
  loading,
  mode,
  selectedAddressId,
  onModeChange,
  onSelectAddress,
  contact,
  onContactChange,
  onManualAddressChange,
  onManualValidityChange,
  note,
  onNoteChange,
}) {
  const hasSaved = addresses.length > 0;
  const needsContactFields = mode === "manual" || !hasSaved;

  return (
    <div className="space-y-5">
      {loading && (
        <p className="text-sm text-slate-500">Đang tải địa chỉ đã lưu...</p>
      )}

      {!loading && hasSaved && (
        <div className="checkout-address-modes">
          <button
            type="button"
            onClick={() => onModeChange("saved")}
            className={`checkout-address-mode${mode === "saved" ? " is-active" : ""}`}
          >
            Địa chỉ đã lưu
          </button>
          <button
            type="button"
            onClick={() => onModeChange("manual")}
            className={`checkout-address-mode${mode === "manual" ? " is-active" : ""}`}
          >
            Nhập địa chỉ khác
          </button>
        </div>
      )}

      {!loading && mode === "saved" && hasSaved && (
        <ul className="checkout-saved-addresses">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;

            return (
              <li key={address.id}>
                <button
                  type="button"
                  onClick={() => onSelectAddress(address.id)}
                  className={`checkout-saved-address${isSelected ? " is-selected" : ""}`}
                >
                  <span className="checkout-saved-address-radio" aria-hidden />
                  <span className="min-w-0 flex-1 text-left">
                    <span className="checkout-saved-address-name">
                      {address.full_name}
                      {address.is_default && (
                        <span className="checkout-saved-address-badge">
                          Mặc định
                        </span>
                      )}
                    </span>
                    <span className="checkout-saved-address-phone">
                      {address.phone}
                    </span>
                    <span className="checkout-saved-address-line">
                      <MapPinIcon className="h-4 w-4 shrink-0" />
                      {address.full_address}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !hasSaved && (
        <p className="text-sm text-slate-500">
          Chưa có địa chỉ lưu — điền thông tin nhận hàng bên dưới.{" "}
          <Link to="/profile" className="font-medium text-primary">
            Lưu địa chỉ
          </Link>{" "}
          trong tài khoản để lần sau không phải nhập lại.
        </p>
      )}

      {!loading && needsContactFields && (
        <div className="checkout-field-grid">
          <label className="checkout-field">
            <span>
              Họ tên người nhận <span className="text-red-500">*</span>
            </span>
            <input
              name="full_name"
              value={contact.full_name}
              onChange={onContactChange}
              required
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              className="input-field"
            />
          </label>

          <label className="checkout-field">
            <span>
              Số điện thoại <span className="text-red-500">*</span>
            </span>
            <div className="checkout-field-icon">
              <PhoneIcon className="h-4 w-4" />
              <input
                name="phone"
                type="tel"
                value={contact.phone}
                onChange={onContactChange}
                required
                autoComplete="tel"
                placeholder="09xx xxx xxx"
                className="input-field pl-10"
              />
            </div>
          </label>
        </div>
      )}

      {!loading && needsContactFields && (
        <AddressSelector
          onChange={onManualAddressChange}
          onValidityChange={onManualValidityChange}
        />
      )}

      {mode === "saved" && hasSaved && (
        <p className="text-xs text-slate-500">
          Người nhận lấy từ địa chỉ đã chọn.{" "}
          <Link to="/profile" className="font-medium text-primary">
            Sửa trong tài khoản
          </Link>
          .
        </p>
      )}

      <label className="checkout-field">
        <span>Ghi chú giao hàng</span>
        <textarea
          name="note"
          value={note}
          onChange={onNoteChange}
          rows="3"
          placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
          className="input-field resize-y"
        />
      </label>
    </div>
  );
}

export default CheckoutAddressSection;