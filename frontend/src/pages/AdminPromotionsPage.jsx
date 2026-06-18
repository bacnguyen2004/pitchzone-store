import { useEffect, useMemo, useState } from "react";

import {
  createAdminPromotion,
  deleteAdminPromotion,
  getAdminProducts,
  getAdminPromotions,
  normalizePageResponse,
  updateAdminPromotion,
} from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminCampaignCard from "../components/admin/AdminCampaignCard";
import AdminCreatePanel from "../components/admin/AdminCreatePanel";
import AdminDataSection from "../components/admin/AdminDataSection";
import AdminEmptyState from "../components/admin/AdminEmptyState";
import AdminLoading from "../components/admin/AdminLoading";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminPromotionFields from "../components/admin/AdminPromotionFields";
import AdminToolbar from "../components/admin/AdminToolbar";
import { PlusIcon, SparklesIcon } from "../components/StoreIcons";
import { getCampaignStatus } from "../utils/adminStatus";
import { getApiErrorMessage } from "../utils/adminErrors";
import { fromDatetimeLocal, toDatetimeLocal } from "../utils/datetime";
import { slugify } from "../utils/slugify";

function defaultForm() {
  const starts = new Date();
  const ends = new Date(starts.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    name: "",
    slug: "",
    eyebrow: "Flash sale",
    title: "",
    description: "",
    discount_type: "percent",
    discount_value: "20",
    starts_at: toDatetimeLocal(starts.toISOString()),
    ends_at: toDatetimeLocal(ends.toISOString()),
    is_active: true,
    perks: "",
    product_ids: [],
  };
}

function buildDraft(promotion) {
  return {
    name: promotion.name || "",
    slug: promotion.slug || "",
    eyebrow: promotion.eyebrow || "",
    title: promotion.title || "",
    description: promotion.description || "",
    discount_type: promotion.discount_type || "percent",
    discount_value: promotion.discount_value || "",
    starts_at: toDatetimeLocal(promotion.starts_at),
    ends_at: toDatetimeLocal(promotion.ends_at),
    is_active: Boolean(promotion.is_active),
    perks: (promotion.perks || []).join("\n"),
    product_ids: promotion.product_ids || [],
  };
}

function buildPayload(draft) {
  return {
    name: draft.name,
    slug: draft.slug,
    eyebrow: draft.eyebrow,
    title: draft.title,
    description: draft.description,
    discount_type: draft.discount_type,
    discount_value: Number(draft.discount_value),
    starts_at: fromDatetimeLocal(draft.starts_at),
    ends_at: fromDatetimeLocal(draft.ends_at),
    is_active: draft.is_active,
    perks: draft.perks
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    product_ids: draft.product_ids.map(Number),
  };
}

function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingSlug, setSavingSlug] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  async function loadData() {
    setStatus("loading");
    setError("");

    try {
      const [promotionData, productData] = await Promise.all([
        getAdminPromotions({ page_size: 100 }),
        getAdminProducts({ ordering: "name", page_size: 100 }),
      ]);

      const promotionList = normalizePageResponse(promotionData).results;
      const productList = normalizePageResponse(productData).results;

      setPromotions(promotionList);
      setProducts(productList);
      setDrafts(
        Object.fromEntries(
          promotionList.map((promotion) => [
            promotion.slug,
            buildDraft(promotion),
          ]),
        ),
      );
      setStatus("success");
    } catch {
      setError("Không tải được danh sách deal.");
      setStatus("error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPromotions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return promotions;
    }

    return promotions.filter((promotion) =>
      `${promotion.name} ${promotion.slug} ${promotion.title}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [promotions, search]);

  const statusCounts = useMemo(() => {
    const counts = { active: 0, running: 0, upcoming: 0, expired: 0 };
    promotions.forEach((promotion) => {
      const campaignStatus = getCampaignStatus(promotion);
      if (campaignStatus.tone === "active") {
        counts.running += 1;
      } else if (campaignStatus.tone === "pending") {
        counts.upcoming += 1;
      } else if (campaignStatus.tone === "cancelled") {
        counts.expired += 1;
      }
      if (promotion.is_active) {
        counts.active += 1;
      }
    });
    return counts;
  }, [promotions]);

  function updateFormField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "name" && !current.slug ? { slug: slugify(value) } : {}),
      ...(field === "title" && !current.name ? { name: value } : {}),
    }));
  }

  function updateDraftField(slug, field, value) {
    setDrafts((current) => ({
      ...current,
      [slug]: {
        ...current[slug],
        [field]: value,
      },
    }));
  }

  async function createPromotion(event) {
    event.preventDefault();
    setIsCreating(true);
    setMessage("");
    setError("");

    try {
      await createAdminPromotion(buildPayload(form));
      setForm(defaultForm());
      setMessage("Đã tạo chiến dịch deal.");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo deal."));
    } finally {
      setIsCreating(false);
    }
  }

  async function savePromotion(slug) {
    setSavingSlug(slug);
    setMessage("");
    setError("");

    try {
      await updateAdminPromotion(slug, buildPayload(drafts[slug]));
      setMessage("Đã cập nhật deal.");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật deal."));
    } finally {
      setSavingSlug(null);
    }
  }

  async function removePromotion(slug) {
    if (!window.confirm("Xóa chiến dịch deal này?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteAdminPromotion(slug);
      setMessage("Đã xóa deal.");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa deal."));
    }
  }

  return (
    <div className="admin-deals-page">
      <section className="admin-deals-top">
        <AdminPageHeader
          title="Deal sốc"
          description="Quản lý flash sale, sản phẩm trong deal và thời gian hiệu lực."
        />

        <div className="admin-deals-metrics">
          <article className="admin-deals-metric is-total">
            <span className="admin-deals-metric-label">Tổng deal</span>
            <span className="admin-deals-metric-value">{promotions.length}</span>
          </article>
          <article className="admin-deals-metric is-running">
            <span className="admin-deals-metric-label">Đang chạy</span>
            <span className="admin-deals-metric-value">{statusCounts.running}</span>
          </article>
          <article className="admin-deals-metric is-upcoming">
            <span className="admin-deals-metric-label">Sắp diễn ra</span>
            <span className="admin-deals-metric-value">{statusCounts.upcoming}</span>
          </article>
          <article className="admin-deals-metric is-expired">
            <span className="admin-deals-metric-label">Đã hết hạn</span>
            <span className="admin-deals-metric-value">{statusCounts.expired}</span>
          </article>
        </div>
      </section>

      <AdminCreatePanel
        title="Tạo chiến dịch mới"
        description="Thiết lập flash sale, chọn sản phẩm và thời gian hiệu lực."
        icon={PlusIcon}
      >
        <form onSubmit={createPromotion} className="admin-panel-body">
          <AdminPromotionFields
            values={form}
            onFieldChange={updateFormField}
            onProductsChange={(productIds) => updateFormField("product_ids", productIds)}
            products={products}
            footerAction={
              <button
                type="submit"
                disabled={isCreating}
                className="admin-btn admin-btn-primary"
              >
                <PlusIcon className="h-4 w-4" />
                {isCreating ? "Đang tạo..." : "Tạo deal"}
              </button>
            }
          />
        </form>
      </AdminCreatePanel>

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminDataSection>
        <AdminToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo tên, slug, tiêu đề..."
          countLabel={`${filteredPromotions.length} / ${promotions.length} chiến dịch`}
          onRefresh={loadData}
          isRefreshing={status === "loading"}
        />

        {status === "loading" && <AdminLoading rows={3} variant="cards" />}

        {status === "success" && (
          <div className="admin-campaign-list">
            {filteredPromotions.length === 0 && (
              <AdminEmptyState
                icon={SparklesIcon}
                title="Chưa có chiến dịch deal"
                description="Tạo flash sale mới ở form phía trên."
              />
            )}

            {filteredPromotions.map((promotion) => {
              const draft = drafts[promotion.slug] || buildDraft(promotion);
              const campaignStatus = getCampaignStatus(promotion);

              return (
                <AdminCampaignCard
                  key={promotion.slug}
                  promotion={promotion}
                  draft={draft}
                  products={products}
                  campaignStatus={campaignStatus}
                  onFieldChange={(field, value) =>
                    updateDraftField(promotion.slug, field, value)
                  }
                  onProductsChange={(productIds) =>
                    updateDraftField(promotion.slug, "product_ids", productIds)
                  }
                  onSave={() => savePromotion(promotion.slug)}
                  onDelete={() => removePromotion(promotion.slug)}
                  isSaving={savingSlug === promotion.slug}
                />
              );
            })}
          </div>
        )}
      </AdminDataSection>
    </div>
  );
}

export default AdminPromotionsPage;