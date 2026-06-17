function AdminToggle({ checked, onChange, disabled = false, label }) {
  return (
    <label
      className={`admin-toggle${disabled ? " is-disabled" : ""}`}
      title={label}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="admin-toggle-input"
        aria-label={label}
      />
      <span className="admin-toggle-track" aria-hidden="true">
        <span className="admin-toggle-thumb" />
      </span>
      {label && <span className="admin-toggle-label">{label}</span>}
    </label>
  );
}

export default AdminToggle;