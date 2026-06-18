import AdminToggle from "./AdminToggle";

function Field({ label, children, className = "" }) {
  return (
    <label className={`admin-promotion-field${className ? ` ${className}` : ""}`}>
      <span className="admin-promotion-field-label">{label}</span>
      {children}
    </label>
  );
}

function AdminVoucherFields({
  values,
  onFieldChange,
  footerAction,
  showUsage = false,
  usedCount = 0,
}) {
  const isPercent = values.discount_type === "percent";

  return (
    <div className="admin-promotion-fields">
      <div className="admin-promotion-fields-grid">
        <Field label="Mã voucher">
          <input
            value={values.code}
            onChange={(event) => onFieldChange("code", event.target.value.toUpperCase())}
            placeholder="VD: PITCH10"
            className="admin-input font-mono uppercase tracking-wide"
          />
        </Field>
        <Field label="Mô tả">
          <input
            value={values.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
            placeholder="Mô tả hiển thị khi áp mã"
            className="admin-input"
          />
        </Field>
        <Field label="Loại giảm">
          <select
            value={values.discount_type}
            onChange={(event) => onFieldChange("discount_type", event.target.value)}
            className="admin-select"
          >
            <option value="percent">Giảm %</option>
            <option value="fixed">Giảm cố định</option>
          </select>
        </Field>
        <Field label="Giá trị giảm">
          <input
            type="number"
            min="0"
            value={values.discount_value}
            onChange={(event) => onFieldChange("discount_value", event.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Đơn tối thiểu">
          <input
            type="number"
            min="0"
            value={values.min_order_amount}
            onChange={(event) => onFieldChange("min_order_amount", event.target.value)}
            placeholder="0 = không giới hạn"
            className="admin-input"
          />
        </Field>
        <Field label={isPercent ? "Giảm tối đa (%)" : "Giảm tối đa"}>
          <input
            type="number"
            min="0"
            value={values.max_discount_amount}
            onChange={(event) => onFieldChange("max_discount_amount", event.target.value)}
            placeholder={isPercent ? "Áp dụng khi giảm %" : "Tùy chọn"}
            className="admin-input"
          />
        </Field>
        <Field label="Bắt đầu">
          <input
            type="datetime-local"
            value={values.starts_at}
            onChange={(event) => onFieldChange("starts_at", event.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Kết thúc">
          <input
            type="datetime-local"
            value={values.ends_at}
            onChange={(event) => onFieldChange("ends_at", event.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Giới hạn lượt dùng">
          <input
            type="number"
            min="1"
            value={values.usage_limit}
            onChange={(event) => onFieldChange("usage_limit", event.target.value)}
            placeholder="Để trống = không giới hạn"
            className="admin-input"
          />
        </Field>
        {showUsage && (
          <Field label="Đã sử dụng">
            <input
              value={`${usedCount}${values.usage_limit ? ` / ${values.usage_limit}` : ""}`}
              readOnly
              className="admin-input is-readonly"
            />
          </Field>
        )}
      </div>

      <div className="admin-promotion-fields-foot">
        <AdminToggle
          checked={Boolean(values.is_active)}
          onChange={(checked) => onFieldChange("is_active", checked)}
          label={values.is_active ? "Đang bật" : "Đã tắt"}
        />
        {footerAction}
      </div>
    </div>
  );
}

export default AdminVoucherFields;