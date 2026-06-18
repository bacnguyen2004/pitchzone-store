import AdminToggle from "./AdminToggle";

function Field({ label, children, className = "" }) {
  return (
    <label className={`admin-promotion-field${className ? ` ${className}` : ""}`}>
      <span className="admin-promotion-field-label">{label}</span>
      {children}
    </label>
  );
}

function AdminProductPicker({ products, value = [], onChange }) {
  const selectedIds = value.map(Number);

  function toggleProduct(productId) {
    const id = Number(productId);
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  return (
    <div className="admin-product-picker">
      <div className="admin-product-picker-head">
        <span className="admin-promotion-field-label">Sản phẩm trong deal</span>
        <span className="admin-product-picker-count">
          {selectedIds.length} / {products.length} đã chọn
        </span>
      </div>
      <div className="admin-product-picker-list">
        {products.length === 0 && (
          <p className="admin-product-picker-empty">Chưa có sản phẩm để chọn.</p>
        )}
        {products.map((product) => (
          <label key={product.id} className="admin-product-picker-item">
            <input
              type="checkbox"
              checked={selectedIds.includes(product.id)}
              onChange={() => toggleProduct(product.id)}
            />
            <span className="admin-product-picker-name">{product.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function AdminPromotionFields({
  values,
  onFieldChange,
  onProductsChange,
  products,
  slugReadOnly = false,
  footerAction,
}) {
  return (
    <div className="admin-promotion-fields">
      <div className="admin-promotion-fields-grid">
        <Field label="Tên nội bộ">
          <input
            value={values.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="VD: Flash sale tháng 6"
            className="admin-input"
          />
        </Field>
        <Field label="Slug">
          {slugReadOnly ? (
            <input
              value={values.slug}
              readOnly
              className="admin-input is-readonly font-mono text-sm"
            />
          ) : (
            <input
              value={values.slug}
              onChange={(event) => onFieldChange("slug", event.target.value)}
              placeholder="slug-deal"
              className="admin-input font-mono text-sm"
            />
          )}
        </Field>
        <Field label="Eyebrow">
          <input
            value={values.eyebrow}
            onChange={(event) => onFieldChange("eyebrow", event.target.value)}
            placeholder="Flash sale"
            className="admin-input"
          />
        </Field>
        <Field label="Tiêu đề hiển thị">
          <input
            value={values.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            placeholder="Tiêu đề trên storefront"
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
      </div>

      <div className="admin-promotion-fields-wide">
        <Field label="Mô tả deal">
          <textarea
            value={values.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
            placeholder="Mô tả ngắn hiển thị trên trang deal"
            className="admin-textarea"
            rows="2"
          />
        </Field>
        <Field label="Ưu đãi kèm (mỗi dòng một mục)">
          <textarea
            value={values.perks}
            onChange={(event) => onFieldChange("perks", event.target.value)}
            placeholder="Mỗi dòng một ưu đãi kèm"
            className="admin-textarea"
            rows="2"
          />
        </Field>
      </div>

      <AdminProductPicker
        products={products}
        value={values.product_ids}
        onChange={onProductsChange}
      />

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

export default AdminPromotionFields;