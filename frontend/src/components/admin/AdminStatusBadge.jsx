import { adminOrderStatus } from "../../config/adminContent";

function AdminStatusBadge({ status, label, tone }) {
  if (status && adminOrderStatus[status]) {
    const meta = adminOrderStatus[status];

    return (
      <span className={`admin-badge ${meta.badge}`}>{meta.label}</span>
    );
  }

  if (tone) {
    return <span className={`admin-badge is-${tone}`}>{label}</span>;
  }

  return <span className="admin-badge is-inactive">{label}</span>;
}

export default AdminStatusBadge;