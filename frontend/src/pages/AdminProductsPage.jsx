import { useEffect, useMemo, useState } from "react";

import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminBrands,
  getAdminCategories,
  getAdminProducts,
  normalizePageResponse,
  updateAdminProduct,
  updateAdminVariant,
} from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminDataSection from "../components/admin/AdminDataSection";
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog";
import AdminImageField from "../components/admin/AdminImageField";
import AdminLoading from "../components/admin/AdminLoading";
import AdminThumb from "../components/admin/AdminThumb";
import AdminModal from "../components/admin/AdminModal";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminPagination from "../components/admin/AdminPagination";
import AdminTable, {
  AdminTableActions,
  AdminTableEmpty,
} from "../components/admin/AdminTable";
import AdminProductVariantsModal from "../components/admin/AdminProductVariantsModal";
import AdminToggle from "../components/admin/AdminToggle";
import AdminToolbar from "../components/admin/AdminToolbar";
import { useAdminList } from "../hooks/useAdminList";
import { PlusIcon } from "../components/StoreIcons";
import { getAdminImageUrl } from "../utils/adminMedia";
import { getApiErrorMessage } from "../utils/adminErrors";
import { slugify } from "../utils/slugify";
import { formatCurrency } from "../utils/format";

const visibilityFilters = [
  { value: "", label: "Tất cả" },
  { value: "active", label: "Đang bán" },
  { value: "hidden", label: "Đã ẩn" },
];

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  base_price: "",
  sale_price: "",
  stock: "",
  category_id: "",
  brand_id: "",
  is_active: true,
  image: null,
};

function getPrimaryVariant(product) {
  return (
    product?.variants?.find((variant) => variant.is_active) ||
    product?.variants?.[0] ||
    null
  );
}

function productToForm(product) {
  const variant = getPrimaryVariant(product);

  return {
    name: product.name || "",
    slug: product.slug || "",
    description: product.description || "",
    base_price: product.base_price ?? "",
    sale_price: variant?.sale_price ?? "",
    stock: product.stock ?? "",
    category_id: product.category?.id || "",
    brand_id: product.brand?.id || "",
    is_active: Boolean(product.is_active),
    image: null,
  };
}

function AdminProductsPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");
  const [togglingIds, setTogglingIds] = useState(() => new Set());
  const [variantProduct, setVariantProduct] = useState(null);

  const extraParams = useMemo(() => {
    if (visibilityFilter === "active") {
      return { is_active: true };
    }

    if (visibilityFilter === "hidden") {
      return { is_active: false };
    }

    return {};
  }, [visibilityFilter]);

  const {
    items: products,
    page,
    pageSize,
    count,
    totalPages,
    search,
    status,
    error,
    setError,
    load,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminList({ fetcher: getAdminProducts, extraParams });

  useEffect(() => {
    async function loadMeta() {
      try {
        const [categoryData, brandData] = await Promise.all([
          getAdminCategories({ page_size: 100 }),
          getAdminBrands({ page_size: 100 }),
        ]);
        setCategories(normalizePageResponse(categoryData).results);
        setBrands(normalizePageResponse(brandData).results);
      } catch {
        setCategories([]);
        setBrands([]);
      }
    }

    loadMeta();
  }, []);

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditing(product);
    setForm(productToForm(product));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function updateForm(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "name" && !editing && !current.slug
        ? { slug: slugify(value) }
        : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      base_price: Number(form.base_price),
      stock: Number(form.stock),
      is_active: form.is_active,
      category_id: Number(form.category_id),
      brand_id: form.brand_id ? Number(form.brand_id) : null,
      ...(form.image ? { image: form.image } : {}),
    };

    try {
      if (editing) {
        await updateAdminProduct(editing.id, payload);

        const variant = getPrimaryVariant(editing);
        if (variant) {
          await updateAdminVariant(variant.id, {
            sale_price: form.sale_price ? Number(form.sale_price) : null,
            price: Number(form.base_price),
          });
        }

        setMessage("Đã cập nhật sản phẩm.");
      } else {
        await createAdminProduct(payload);
        setMessage("Đã tạo sản phẩm mới.");
      }

      closeModal();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu sản phẩm."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVisibilityToggle(product, nextActive) {
    setMessage("");
    setError("");
    setTogglingIds((current) => new Set(current).add(product.id));

    try {
      await updateAdminProduct(product.id, { is_active: nextActive });
      setMessage(nextActive ? "Đã hiện sản phẩm." : "Đã ẩn sản phẩm.");
      await load({ silent: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật trạng thái."));
    } finally {
      setTogglingIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await deleteAdminProduct(deleteTarget.id);
      setMessage("Đã xóa sản phẩm.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa sản phẩm."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Thêm sản phẩm, cập nhật giá gốc, giá sale và tồn kho."
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="admin-btn admin-btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Thêm sản phẩm
          </button>
        }
      />

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminDataSection>
        <AdminToolbar
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên, danh mục, thương hiệu..."
          countLabel={`${count} sản phẩm`}
          onRefresh={load}
          isRefreshing={status === "loading"}
          filter={
            <div className="admin-filter-tabs" role="tablist" aria-label="Lọc trạng thái">
              {visibilityFilters.map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  role="tab"
                  aria-selected={visibilityFilter === option.value}
                  onClick={() => setVisibilityFilter(option.value)}
                  className={`admin-filter-tab${
                    visibilityFilter === option.value ? " is-active" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />

        {status === "loading" && <AdminLoading rows={6} columns={7} />}

        {status === "success" && (
          <>
            <AdminTable className="is-products">
              <thead>
                <tr>
                  <th className="is-media">Ảnh</th>
                  <th className="is-product">Sản phẩm</th>
                  <th className="is-category">Danh mục</th>
                  <th className="is-money">Giá</th>
                  <th className="is-stock">Tồn</th>
                  <th className="is-status">Trạng thái</th>
                  <th className="is-actions-wide" />
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <AdminTableEmpty
                    colSpan={7}
                    message="Không có sản phẩm phù hợp."
                  />
                )}
                {products.map((product) => {
                  const variant = getPrimaryVariant(product);
                  const hasVariantSale =
                    variant?.sale_price &&
                    Number(variant.sale_price) !== Number(product.base_price);

                  return (
                    <tr key={product.id}>
                      <td className="is-media">
                        <AdminThumb
                          src={getAdminImageUrl(product)}
                          alt={product.name}
                        />
                      </td>
                      <td className="is-product">
                        <div className="admin-table-cell-stack">
                          <p className="admin-table-title">{product.name}</p>
                          <p className="admin-table-sub">
                            {product.brand?.name || "Không thương hiệu"} ·{" "}
                            {product.variants?.length || 0} biến thể
                          </p>
                        </div>
                      </td>
                      <td className="is-category">
                        <span className="admin-table-chip">
                          {product.category?.name || "—"}
                        </span>
                      </td>
                      <td className="is-money">
                        <div className="admin-table-cell-stack">
                          <span className="admin-table-price-main">
                            {formatCurrency(product.price)}
                          </span>
                          {product.is_on_sale && (
                            <div className="admin-table-price-meta">
                              <span className="admin-table-price-base">
                                {formatCurrency(product.base_price)}
                              </span>
                              <span className="admin-badge is-processing">
                                -{product.discount_percent}%
                              </span>
                            </div>
                          )}
                          {hasVariantSale && (
                            <span className="admin-table-sub">
                              Sale: {formatCurrency(variant.sale_price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="is-stock is-strong">{product.stock}</td>
                      <td className="is-status">
                        <AdminToggle
                          checked={Boolean(product.is_active)}
                          onChange={(nextActive) =>
                            handleVisibilityToggle(product, nextActive)
                          }
                          disabled={togglingIds.has(product.id)}
                          label={product.is_active ? "Đang bán" : "Đã ẩn"}
                        />
                      </td>
                      <td className="is-actions-wide">
                        <AdminTableActions
                          onVariants={() => setVariantProduct(product)}
                          onEdit={() => openEditModal(product)}
                          onDelete={() => setDeleteTarget(product)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </AdminTable>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            count={count}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
        )}
      </AdminDataSection>

      <AdminModal
        open={modalOpen}
        title={editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        description={
          editing
            ? "Cập nhật ảnh, thông tin, giá và tồn kho sản phẩm."
            : "Tạo sản phẩm mới kèm ảnh và biến thể mặc định."
        }
        onClose={closeModal}
        footer={
          <div className="admin-modal-actions">
            <button
              type="button"
              onClick={closeModal}
              className="admin-btn admin-btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="admin-product-form"
              disabled={isSaving}
              className="admin-btn admin-btn-primary"
            >
              {isSaving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        }
      >
        <form
          id="admin-product-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <AdminImageField
            label="Ảnh sản phẩm"
            previewUrl={editing ? getAdminImageUrl(editing) : ""}
            file={form.image}
            onFileChange={(file) =>
              setForm((current) => ({ ...current, image: file }))
            }
          />
          <div className="admin-form-grid">
          <input
            name="name"
            value={form.name}
            onChange={updateForm}
            placeholder="Tên sản phẩm"
            className="admin-input lg:col-span-2"
            required
          />
          <input
            name="slug"
            value={form.slug}
            onChange={updateForm}
            placeholder="slug-san-pham"
            className="admin-input"
            required
          />
          <select
            name="category_id"
            value={form.category_id}
            onChange={updateForm}
            className="admin-select"
            required
          >
            <option value="">Danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="brand_id"
            value={form.brand_id}
            onChange={updateForm}
            className="admin-select"
          >
            <option value="">Thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <input
            name="base_price"
            type="number"
            min="0"
            value={form.base_price}
            onChange={updateForm}
            placeholder="Giá gốc"
            className="admin-input"
            required
          />
          <input
            name="sale_price"
            type="number"
            min="0"
            value={form.sale_price}
            onChange={updateForm}
            placeholder="Giá sale (tùy chọn)"
            className="admin-input"
          />
          <input
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={updateForm}
            placeholder="Tồn kho"
            className="admin-input"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={updateForm}
            placeholder="Mô tả sản phẩm"
            className="admin-textarea lg:col-span-2"
            rows="3"
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 lg:col-span-2">
            <input
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={updateForm}
            />
            Đang bán
          </label>
          </div>
        </form>
      </AdminModal>

      <AdminProductVariantsModal
        product={variantProduct}
        open={Boolean(variantProduct)}
        onClose={() => setVariantProduct(null)}
        onSaved={load}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        message={
          deleteTarget
            ? `Xóa sản phẩm "${deleteTarget.name}"? Hành động này không thể hoàn tác.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isSaving}
      />
    </>
  );
}

export default AdminProductsPage;