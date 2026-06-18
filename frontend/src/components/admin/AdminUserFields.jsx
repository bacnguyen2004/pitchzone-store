import AdminToggle from "./AdminToggle";

function Field({ label, children }) {
  return (
    <label className="admin-promotion-field">
      <span className="admin-promotion-field-label">{label}</span>
      {children}
    </label>
  );
}

function AdminUserFields({ values, onFieldChange }) {
  return (
    <div className="admin-user-fields">
      <div className="admin-promotion-fields-grid">
        <Field label="Tài khoản">
          <input
            value={values.username}
            onChange={(event) => onFieldChange("username", event.target.value)}
            className="admin-input"
            autoComplete="username"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={values.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            className="admin-input"
            autoComplete="email"
          />
        </Field>
        <Field label="Họ tên">
          <input
            value={values.full_name}
            onChange={(event) => onFieldChange("full_name", event.target.value)}
            placeholder="Họ tên khách hàng"
            className="admin-input"
          />
        </Field>
        <Field label="Số điện thoại">
          <input
            value={values.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
            placeholder="SĐT liên hệ"
            className="admin-input"
            autoComplete="tel"
          />
        </Field>
      </div>
      <div className="admin-promotion-fields-foot">
        <AdminToggle
          checked={Boolean(values.is_staff)}
          onChange={(checked) => onFieldChange("is_staff", checked)}
          label={values.is_staff ? "Quản trị viên" : "Khách hàng"}
        />
      </div>
    </div>
  );
}

export default AdminUserFields;