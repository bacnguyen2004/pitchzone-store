import { useEffect, useState } from "react";

import {
  createAdminVariant,
  getAdminVariants,
  updateAdminVariant,
} from "../../api/admin";
import { getApiErrorMessage } from "../../utils/adminErrors";
import { formatCurrency } from "../../utils/format";
import { getAdminImageUrl } from "../../utils/adminMedia";
import { GridIcon, PlusIcon } from "../StoreIcons";
import AdminAlert from "./AdminAlert";
import AdminEmptyState from "./AdminEmptyState";
import AdminLoading from "./AdminLoading";
import AdminModal from "./AdminModal";
import AdminThumb from "./AdminThumb";
import AdminToggle from "./AdminToggle";

const emptyVariant = {
  size: "",
  color: "",
  price: "",
  sale_price: "",
  stock: "",
  is_active: true,
};

function buildDrafts(list) {
  return Object.fromEntries(
    list.map((variant) => [
      variant.id,
      {
        size: variant.size || "",
        color: variant.color || "",
        price: variant.price ?? "",
        sale_price: variant.sale_price ?? "",
        stock: variant.stock ?? "",
        is_active: Boolean(variant.is_active),
      },
    ]),
  );
}

function VariantField({ label, children }) {
  return (
    <label className="admin-variant-field">
      <span className="admin-variant-field-label">{label}</span>
      {children}
    </label>
  );
}

function AdminProductVariantsModal({ product, open, onClose, onSaved }) {
  const [variants, setVariants] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [newVariant, setNewVariant] = useState(emptyVariant);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  function applyVariantList(list) {
    setVariants(list);
    setDrafts(buildDrafts(list));
  }

  async function loadVariants() {
    if (!product?.id) {
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const data = await getAdminVariants({ product: product.id, page_size: 50 });
      const list = data.results || data;
      applyVariantList(list);
      setStatus("success");
    } catch {
      setError("Không tải được biến thể.");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!open || !product?.id) {
      return;
    }

    setMessage("");
    setNewVariant(emptyVariant);
    loadVariants();
  }, [open, product?.id]);

  function updateDraft(variantId, field, value) {
    setDrafts((current) => ({
      ...current,
      [variantId]: { ...current[variantId], [field]: value },
    }));
  }

  async function saveVariant(variantId) {
    const draft = drafts[variantId];
    setSavingId(variantId);
    setError("");
    setMessage("");

    try {
      const updated = await updateAdminVariant(variantId, {
        size: draft.size,
        color: draft.color || "",
        price: Number(draft.price),
        sale_price: draft.sale_price ? Number(draft.sale_price) : null,
        stock: Number(draft.stock),
        is_active: draft.is_active,
      });
      setVariants((current) =>
        current.map((variant) =>
          variant.id === variantId ? { ...variant, ...updated } : variant,
        ),
      );
      setMessage("Đã cập nhật biến thể.");
      onSaved?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu biến thể."));
    } finally {
      setSavingId(null);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setIsCreating(true);
    setError("");
    setMessage("");

    try {
      await createAdminVariant({
        product_id: product.id,
        size: newVariant.size,
        color: newVariant.color || "",
        price: Number(newVariant.price || product.base_price),
        sale_price: newVariant.sale_price ? Number(newVariant.sale_price) : null,
        stock: Number(newVariant.stock || 0),
        is_active: newVariant.is_active,
      });
      setNewVariant(emptyVariant);
      setMessage("Đã thêm biến thể mới.");
      onSaved?.();
      const data = await getAdminVariants({ product: product.id, page_size: 50 });
      applyVariantList(data.results || data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo biến thể."));
    } finally {
      setIsCreating(false);
    }
  }

  const totalStock = variants.reduce(
    (sum, variant) => sum + Number(variant.stock || 0),
    0,
  );

  return (
    <AdminModal
      open={open}
      size="xl"
      title="Quản lý biến thể"
      description="Size, màu, giá và tồn kho từng SKU."
      onClose={onClose}
      footer={
        <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
          Đóng
        </button>
      }
    >
      {product && (
        <div className="admin-variant-product">
          <AdminThumb
            src={getAdminImageUrl(product)}
            alt={product.name}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="admin-variant-product-name">{product.name}</p>
            <p className="admin-variant-product-meta">
              {variants.length} biến thể · {totalStock} tồn tổng · Giá gốc{" "}
              {formatCurrency(product.base_price)}
            </p>
          </div>
        </div>
      )}

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      {status === "loading" && <AdminLoading rows={3} variant="cards" />}

      {status === "success" && (
        <div className="admin-variant-workspace">
          {variants.length === 0 ? (
            <AdminEmptyState
              compact
              icon={GridIcon}
              title="Chưa có biến thể"
              description="Thêm size đầu tiên ở form bên dưới."
            />
          ) : (
            <div className="admin-variant-list">
              {variants.map((variant) => {
                const draft = drafts[variant.id] || {};
                const displayPrice = variant.effective_price || variant.price;

                return (
                  <article key={variant.id} className="admin-variant-card">
                    <header className="admin-variant-card-head">
                      <div className="admin-variant-card-identity">
                        <span className="admin-variant-chip is-size">
                          {draft.size || "—"}
                        </span>
                        {draft.color ? (
                          <span className="admin-variant-chip is-color">
                            {draft.color}
                          </span>
                        ) : null}
                        <span className="admin-variant-sku">{variant.sku}</span>
                      </div>
                      <div className="admin-variant-card-summary">
                        <span className="admin-variant-price">
                          {formatCurrency(displayPrice)}
                        </span>
                        <span className="admin-variant-stock">
                          Tồn: <strong>{draft.stock ?? 0}</strong>
                        </span>
                      </div>
                      <div className="admin-variant-card-actions">
                        <AdminToggle
                          checked={Boolean(draft.is_active)}
                          onChange={(value) =>
                            updateDraft(variant.id, "is_active", value)
                          }
                          label={draft.is_active ? "Đang bán" : "Đã ẩn"}
                        />
                        <button
                          type="button"
                          onClick={() => saveVariant(variant.id)}
                          disabled={savingId === variant.id}
                          className="admin-btn admin-btn-primary"
                        >
                          {savingId === variant.id ? "Đang lưu..." : "Lưu"}
                        </button>
                      </div>
                    </header>

                    <div className="admin-variant-fields">
                      <VariantField label="Size">
                        <input
                          value={draft.size}
                          onChange={(event) =>
                            updateDraft(variant.id, "size", event.target.value)
                          }
                          placeholder="VD: 40, M, L"
                          className="admin-input"
                        />
                      </VariantField>
                      <VariantField label="Màu">
                        <input
                          value={draft.color}
                          onChange={(event) =>
                            updateDraft(variant.id, "color", event.target.value)
                          }
                          placeholder="VD: Đen, Trắng"
                          className="admin-input"
                        />
                      </VariantField>
                      <VariantField label="Giá">
                        <input
                          type="number"
                          min="0"
                          value={draft.price}
                          onChange={(event) =>
                            updateDraft(variant.id, "price", event.target.value)
                          }
                          className="admin-input"
                        />
                      </VariantField>
                      <VariantField label="Giá sale">
                        <input
                          type="number"
                          min="0"
                          value={draft.sale_price}
                          onChange={(event) =>
                            updateDraft(
                              variant.id,
                              "sale_price",
                              event.target.value,
                            )
                          }
                          placeholder="Để trống nếu không sale"
                          className="admin-input"
                        />
                      </VariantField>
                      <VariantField label="Tồn kho">
                        <input
                          type="number"
                          min="0"
                          value={draft.stock}
                          onChange={(event) =>
                            updateDraft(variant.id, "stock", event.target.value)
                          }
                          className="admin-input"
                        />
                      </VariantField>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <form onSubmit={handleCreate} className="admin-variant-create">
            <header className="admin-variant-create-head">
              <span className="admin-variant-create-icon" aria-hidden>
                <PlusIcon className="h-5 w-5" />
              </span>
              <div>
                <h3>Thêm biến thể mới</h3>
                <p>Size bắt buộc. Giá mặc định lấy từ giá gốc sản phẩm.</p>
              </div>
            </header>
            <div className="admin-variant-fields is-create">
              <VariantField label="Size *">
                <input
                  value={newVariant.size}
                  onChange={(event) =>
                    setNewVariant((current) => ({
                      ...current,
                      size: event.target.value,
                    }))
                  }
                  placeholder="VD: 42"
                  className="admin-input"
                  required
                />
              </VariantField>
              <VariantField label="Màu">
                <input
                  value={newVariant.color}
                  onChange={(event) =>
                    setNewVariant((current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  placeholder="VD: Đỏ"
                  className="admin-input"
                />
              </VariantField>
              <VariantField label="Giá">
                <input
                  type="number"
                  min="0"
                  value={newVariant.price}
                  onChange={(event) =>
                    setNewVariant((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  placeholder={
                    product?.base_price
                      ? `Mặc định ${formatCurrency(product.base_price)}`
                      : "Giá bán"
                  }
                  className="admin-input"
                />
              </VariantField>
              <VariantField label="Giá sale">
                <input
                  type="number"
                  min="0"
                  value={newVariant.sale_price}
                  onChange={(event) =>
                    setNewVariant((current) => ({
                      ...current,
                      sale_price: event.target.value,
                    }))
                  }
                  placeholder="Tùy chọn"
                  className="admin-input"
                />
              </VariantField>
              <VariantField label="Tồn kho">
                <input
                  type="number"
                  min="0"
                  value={newVariant.stock}
                  onChange={(event) =>
                    setNewVariant((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  placeholder="0"
                  className="admin-input"
                />
              </VariantField>
              <VariantField label="Trạng thái">
                <AdminToggle
                  checked={newVariant.is_active}
                  onChange={(value) =>
                    setNewVariant((current) => ({
                      ...current,
                      is_active: value,
                    }))
                  }
                  label={newVariant.is_active ? "Đang bán" : "Đã ẩn"}
                />
              </VariantField>
            </div>
            <div className="admin-variant-create-foot">
              <button
                type="submit"
                disabled={isCreating}
                className="admin-btn admin-btn-primary"
              >
                <PlusIcon className="h-4 w-4" />
                {isCreating ? "Đang thêm..." : "Thêm biến thể"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminModal>
  );
}

export default AdminProductVariantsModal;