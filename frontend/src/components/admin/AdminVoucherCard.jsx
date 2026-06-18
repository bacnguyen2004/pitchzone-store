import { formatCurrency } from "../../utils/format";
import { TrashIcon } from "../StoreIcons";
import AdminStatusBadge from "./AdminStatusBadge";
import AdminVoucherFields from "./AdminVoucherFields";

function formatOffer(discountType, discountValue) {
  if (discountType === "fixed") {
    return formatCurrency(discountValue);
  }
  return `-${Number(discountValue)}%`;
}

function formatDateRange(startsAt, endsAt) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const start = new Date(startsAt).toLocaleString("vi-VN", options);
  const end = new Date(endsAt).toLocaleString("vi-VN", options);
  return `${start} → ${end}`;
}

function AdminVoucherCard({
  voucher,
  draft,
  voucherStatus,
  onFieldChange,
  onSave,
  onDelete,
  isSaving = false,
}) {
  const usageLabel = voucher.usage_limit
    ? `${voucher.used_count} / ${voucher.usage_limit} lượt`
    : `${voucher.used_count} lượt`;

  return (
    <article className="admin-voucher-card">
      <header className="admin-voucher-card-head">
        <div className="admin-voucher-card-main">
          <div className="admin-voucher-card-title-row">
            <code className="admin-voucher-code">{draft.code || voucher.code}</code>
            <AdminStatusBadge
              label={voucherStatus.label}
              tone={voucherStatus.tone}
            />
          </div>
          {draft.description && (
            <p className="admin-voucher-card-desc">{draft.description}</p>
          )}
          <p className="admin-voucher-card-meta">
            <span className="admin-voucher-offer">
              {formatOffer(draft.discount_type, draft.discount_value)}
            </span>
            <span>·</span>
            <span>Đơn tối thiểu {formatCurrency(draft.min_order_amount || 0)}</span>
            <span>·</span>
            <span>{usageLabel}</span>
          </p>
          <p className="admin-voucher-card-dates">
            {formatDateRange(draft.starts_at, draft.ends_at)}
          </p>
        </div>
        <div className="admin-voucher-card-actions">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="admin-btn admin-btn-primary"
          >
            {isSaving ? "Đang lưu..." : "Lưu"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="admin-btn admin-btn-danger"
            aria-label="Xóa voucher"
            title="Xóa voucher"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="admin-voucher-card-body">
        <AdminVoucherFields
          values={draft}
          onFieldChange={onFieldChange}
          showUsage
          usedCount={voucher.used_count}
        />
      </div>
    </article>
  );
}

export default AdminVoucherCard;