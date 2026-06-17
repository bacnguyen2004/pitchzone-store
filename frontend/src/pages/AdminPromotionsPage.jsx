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
import AdminLoading from "../components/admin/AdminLoading";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import AdminToolbar from "../components/admin/AdminToolbar";
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

  function updateForm(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "name" && !current.slug ? { slug: slugify(value) } : {}),
      ...(name === "title" && !current.name ? { name: value } : {}),
    }));
  }

  function updateFormProducts(event) {
    const productIds = Array.from(event.target.selectedOptions).map((option) =>
      Number(option.value),
    );

    setForm((current) => ({
      ...current,
      product_ids: productIds,
    }));
  }

  function updateDraft(slug, field, value) {
    setDrafts((current) => ({
      ...current,
      [slug]: {
        ...current[slug],
        [field]: value,
      },
    }));
  }

  function updateDraftProducts(slug, event) {
    const productIds = Array.from(event.target.selectedOptions).map((option) =>
      Number(option.value),
    );

    updateDraft(slug, "product_ids", productIds);
  }

  async function createPromotion(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createAdminPromotion(buildPayload(form));
      setForm(defaultForm());
      setMessage("Đã tạo chiến dịch deal.");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo deal."));
    }
  }

  async function savePromotion(slug) {
    setMessage("");
    setError("");

    try {
      await updateAdminPromotion(slug, buildPayload(drafts[slug]));
      setMessage("Đã cập nhật deal.");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật deal."));
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
    <>
      <AdminPageHeader
        title="Deal sốc"
        description="Quản lý flash sale, sản phẩm trong deal và thời gian hiệu lực."
      />

      <section className="admin-panel mt-6">
        <header className="admin-panel-head">
          <h2>Tạo chiến dịch</h2>
        </header>
        <form onSubmit={createPromotion} className="admin-panel-body">
          <div className="admin-form-grid">
            <input
              name="name"
              value={form.name}
              onChange={updateForm}
              placeholder="Tên nội bộ"
              className="admin-input"
              required
            />
            <input
              name="slug"
              value={form.slug}
              onChange={updateForm}
              placeholder="slug-deal"
              className="admin-input"
              required
            />
            <input
              name="eyebrow"
              value={form.eyebrow}
              onChange={updateForm}
              placeholder="Eyebrow"
              className="admin-input"
            />
            <input
              name="title"
              value={form.title}
              onChange={updateForm}
              placeholder="Tiêu đề hiển thị"
              className="admin-input"
              required
            />
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={updateForm}
              className="admin-select"
            >
              <option value="percent">Giảm %</option>
              <option value="fixed">Giảm cố định</option>
            </select>
            <input
              name="discount_value"
              type="number"
              min="0"
              value={form.discount_value}
              onChange={updateForm}
              placeholder="Giá trị giảm"
              className="admin-input"
              required
            />
            <input
              name="starts_at"
              type="datetime-local"
              value={form.starts_at}
              onChange={updateForm}
              className="admin-input"
              required
            />
            <input
              name="ends_at"
              type="datetime-local"
              value={form.ends_at}
              onChange={updateForm}
              className="admin-input"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={updateForm}
              placeholder="Mô tả deal"
              className="admin-textarea lg:col-span-2"
              rows="2"
            />
            <textarea
              name="perks"
              value={form.perks}
              onChange={updateForm}
              placeholder="Ưu đãi kèm (mỗi dòng một mục)"
              className="admin-textarea lg:col-span-2"
              rows="2"
            />
            <select
              multiple
              value={form.product_ids.map(String)}
              onChange={updateFormProducts}
              className="admin-select lg:col-span-2 min-h-28"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={updateForm}
              />
              Đang bật
            </label>
            <button type="submit" className="admin-btn admin-btn-primary">
              Tạo deal
            </button>
          </div>
        </form>
      </section>

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm deal..."
        countLabel={`${filteredPromotions.length} / ${promotions.length} chiến dịch`}
        onRefresh={loadData}
        isRefreshing={status === "loading"}
      />

      {status === "loading" && <AdminLoading rows={3} columns={3} />}

      {status === "success" && (
        <div className="mt-4 space-y-4">
          {filteredPromotions.length === 0 && (
            <p className="admin-empty">Chưa có chiến dịch deal.</p>
          )}

          {filteredPromotions.map((promotion) => {
            const draft = drafts[promotion.slug] || buildDraft(promotion);
            const campaignStatus = getCampaignStatus(promotion);

            return (
              <section key={promotion.slug} className="admin-panel">
                <header className="admin-panel-head">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2>{promotion.title}</h2>
                      <AdminStatusBadge
                        label={campaignStatus.label}
                        tone={campaignStatus.tone}
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      {promotion.product_count} sản phẩm · {promotion.slug}
                    </p>
                  </div>
                  <div className="admin-actions">
                    <button
                      type="button"
                      onClick={() => savePromotion(promotion.slug)}
                      className="admin-btn admin-btn-primary"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => removePromotion(promotion.slug)}
                      className="admin-btn admin-btn-danger"
                    >
                      Xóa
                    </button>
                  </div>
                </header>

                <div className="admin-panel-body">
                  <div className="admin-form-grid">
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        updateDraft(promotion.slug, "name", event.target.value)
                      }
                      className="admin-input"
                      placeholder="Tên nội bộ"
                    />
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        updateDraft(promotion.slug, "title", event.target.value)
                      }
                      className="admin-input"
                      placeholder="Tiêu đề"
                    />
                    <select
                      value={draft.discount_type}
                      onChange={(event) =>
                        updateDraft(
                          promotion.slug,
                          "discount_type",
                          event.target.value,
                        )
                      }
                      className="admin-select"
                    >
                      <option value="percent">Giảm %</option>
                      <option value="fixed">Giảm cố định</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={draft.discount_value}
                      onChange={(event) =>
                        updateDraft(
                          promotion.slug,
                          "discount_value",
                          event.target.value,
                        )
                      }
                      className="admin-input"
                    />
                    <input
                      type="datetime-local"
                      value={draft.starts_at}
                      onChange={(event) =>
                        updateDraft(
                          promotion.slug,
                          "starts_at",
                          event.target.value,
                        )
                      }
                      className="admin-input"
                    />
                    <input
                      type="datetime-local"
                      value={draft.ends_at}
                      onChange={(event) =>
                        updateDraft(
                          promotion.slug,
                          "ends_at",
                          event.target.value,
                        )
                      }
                      className="admin-input"
                    />
                    <select
                      multiple
                      value={draft.product_ids.map(String)}
                      onChange={(event) =>
                        updateDraftProducts(promotion.slug, event)
                      }
                      className="admin-select lg:col-span-2 min-h-28"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.is_active}
                        onChange={(event) =>
                          updateDraft(
                            promotion.slug,
                            "is_active",
                            event.target.checked,
                          )
                        }
                      />
                      Đang bật
                    </label>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export default AdminPromotionsPage;