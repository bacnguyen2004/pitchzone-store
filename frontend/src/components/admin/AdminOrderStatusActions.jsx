import { adminOrderStatusOptions } from "../../config/adminContent";

function AdminOrderStatusActions({ value, onChange, disabled = false }) {
  return (
    <div className="admin-order-status-actions" role="group" aria-label="Cập nhật trạng thái">
      {adminOrderStatusOptions.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled || isActive}
            onClick={() => onChange(option.value)}
            className={`admin-order-status-action is-${option.value}${
              isActive ? " is-active" : ""
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default AdminOrderStatusActions;