import { useEffect, useState } from "react";

import {
  createAdminVariant,
  getAdminVariants,
  updateAdminVariant,
} from "../../api/admin";
import { getApiErrorMessage } from "../../utils/adminErrors";
import { formatCurrency } from "../../utils/format";
import AdminAlert from "./AdminAlert";
import AdminModal from "./AdminModal";
import AdminToggle from "./AdminToggle";

const emptyVariant = {
  size: "",
  color: "",
  price: "",
  sale_price: "",
  stock: "",
  is_active: true,
};

function AdminProductVariantsModal({ product, open, onClose, onSaved }) {
  const [variants, setVariants] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [newVariant, setNewVariant] = useState(emptyVariant);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!open || !product?.id) {
      return;
    }

    async function load() {
      setStatus("loading");
      setError("");
      try {
        const data = await getAdminVariants({ product: product.id, page_size: 50 });
        const list = data.results || data;
        setVariants(list);
        setDrafts(
          Object.fromEntries(
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
          ),
        );
        setStatus("success");
      } catch {
        setError("Không tải được biến thể.");
        setStatus("error");
      }
    }

    load();
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
    try {
      await updateAdminVariant(variantId, {
        size: draft.size,
        color: draft.color || "",
        price: Number(draft.price),
        sale_price: draft.sale_price ? Number(draft.sale_price) : null,
        stock: Number(draft.stock),
        is_active: draft.is_active,
      });
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
    setError("");
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
      setMessage("Đã thêm biến thể.");
      onSaved?.();
      const data = await getAdminVariants({ product: product.id, page_size: 50 });
      const list = data.results || data;
      setVariants(list);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo biến thể."));
    }
  }

  return (
    <AdminModal
      open={open}
      title={`Biến thể — ${product?.name || ""}`}
      description="Quản lý size, màu, giá và tồn kho từng SKU."
      onClose={onClose}
      footer={
        <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
          Đóng
        </button>
      }
    >
      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      {status === "loading" && <p className="text-sm text-slate-500">Đang tải...</p>}

      {status === "success" && (
        <div className="space-y-4">
          {variants.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có biến thể nào.</p>
          )}
          {variants.map((variant) => {
            const draft = drafts[variant.id] || {};
            return (
              <div key={variant.id} className="admin-variant-row">
                <div className="admin-form-grid">
                  <input
                    value={draft.size}
                    onChange={(event) =>
                      updateDraft(variant.id, "size", event.target.value)
                    }
                    placeholder="Size"
                    className="admin-input"
                  />
                  <input
                    value={draft.color}
                    onChange={(event) =>
                      updateDraft(variant.id, "color", event.target.value)
                    }
                    placeholder="Màu"
                    className="admin-input"
                  />
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(event) =>
                      updateDraft(variant.id, "price", event.target.value)
                    }
                    placeholder="Giá"
                    className="admin-input"
                  />
                  <input
                    type="number"
                    value={draft.sale_price}
                    onChange={(event) =>
                      updateDraft(variant.id, "sale_price", event.target.value)
                    }
                    placeholder="Giá sale"
                    className="admin-input"
                  />
                  <input
                    type="number"
                    value={draft.stock}
                    onChange={(event) =>
                      updateDraft(variant.id, "stock", event.target.value)
                    }
                    placeholder="Tồn kho"
                    className="admin-input"
                  />
                  <AdminToggle
                    checked={Boolean(draft.is_active)}
                    onChange={(value) =>
                      updateDraft(variant.id, "is_active", value)
                    }
                    label={draft.is_active ? "Đang bán" : "Ẩn"}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  SKU: {variant.sku} · Giá hiện tại: {formatCurrency(variant.effective_price || variant.price)}
                </p>
                <button
                  type="button"
                  onClick={() => saveVariant(variant.id)}
                  disabled={savingId === variant.id}
                  className="admin-btn admin-btn-primary"
                >
                  {savingId === variant.id ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            );
          })}

          <form onSubmit={handleCreate} className="admin-variant-create">
            <h3 className="text-sm font-bold text-slate-900">Thêm biến thể</h3>
            <div className="admin-form-grid">
              <input
                value={newVariant.size}
                onChange={(event) =>
                  setNewVariant((current) => ({
                    ...current,
                    size: event.target.value,
                  }))
                }
                placeholder="Size *"
                className="admin-input"
                required
              />
              <input
                value={newVariant.color}
                onChange={(event) =>
                  setNewVariant((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
                placeholder="Màu"
                className="admin-input"
              />
              <input
                type="number"
                value={newVariant.price}
                onChange={(event) =>
                  setNewVariant((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder={`Giá (mặc định ${product?.base_price || ""})`}
                className="admin-input"
              />
              <input
                type="number"
                value={newVariant.stock}
                onChange={(event) =>
                  setNewVariant((current) => ({
                    ...current,
                    stock: event.target.value,
                  }))
                }
                placeholder="Tồn kho"
                className="admin-input"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary">
              Thêm biến thể
            </button>
          </form>
        </div>
      )}
    </AdminModal>
  );
}

export default AdminProductVariantsModal;