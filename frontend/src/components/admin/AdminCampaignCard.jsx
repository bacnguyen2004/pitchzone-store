import { formatCurrency } from "../../utils/format";
import { TrashIcon } from "../StoreIcons";
import AdminPromotionFields from "./AdminPromotionFields";
import AdminStatusBadge from "./AdminStatusBadge";

function formatOffer(discountType, discountValue) {
  if (discountType === "fixed") {
    return formatCurrency(discountValue);
  }
  return `${Number(discountValue)}%`;
}

function formatDateRange(startsAt, endsAt) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const start = new Date(startsAt).toLocaleString("vi-VN", options);
  const end = new Date(endsAt).toLocaleString("vi-VN", options);
  return `${start} → ${end}`;
}

function AdminCampaignCard({
  promotion,
  draft,
  products,
  campaignStatus,
  onFieldChange,
  onProductsChange,
  onSave,
  onDelete,
  isSaving = false,
}) {
  return (
    <article className="admin-campaign-card">
      <header className="admin-campaign-card-head">
        <div className="admin-campaign-card-main">
          <div className="admin-campaign-card-title-row">
            <h3>{draft.title || promotion.title}</h3>
            <AdminStatusBadge
              label={campaignStatus.label}
              tone={campaignStatus.tone}
            />
          </div>
          <p className="admin-campaign-card-meta">
            <span className="admin-campaign-offer">
              {formatOffer(draft.discount_type, draft.discount_value)}
            </span>
            <span>·</span>
            <span>{draft.product_ids?.length || promotion.product_count || 0} SP</span>
            <span>·</span>
            <code className="admin-campaign-slug">{promotion.slug}</code>
          </p>
          <p className="admin-campaign-card-dates">
            {formatDateRange(draft.starts_at, draft.ends_at)}
          </p>
        </div>
        <div className="admin-campaign-card-actions">
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
            aria-label="Xóa deal"
            title="Xóa deal"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="admin-campaign-card-body">
        <AdminPromotionFields
          values={draft}
          onFieldChange={onFieldChange}
          onProductsChange={onProductsChange}
          products={products}
          slugReadOnly
        />
      </div>
    </article>
  );
}

export default AdminCampaignCard;