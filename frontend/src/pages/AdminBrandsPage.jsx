import { useState } from "react";

import {
  createAdminBrand,
  deleteAdminBrand,
  getAdminBrands,
  updateAdminBrand,
} from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog";
import AdminImageField from "../components/admin/AdminImageField";
import AdminLoading from "../components/admin/AdminLoading";
import AdminModal from "../components/admin/AdminModal";
import AdminThumb from "../components/admin/AdminThumb";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminPagination from "../components/admin/AdminPagination";
import AdminTable, {
  AdminTableActions,
  AdminTableEmpty,
} from "../components/admin/AdminTable";
import AdminToolbar from "../components/admin/AdminToolbar";
import { useAdminList } from "../hooks/useAdminList";
import { PlusIcon } from "../components/StoreIcons";
import { getAdminImageUrl } from "../utils/adminMedia";
import { getApiErrorMessage } from "../utils/adminErrors";
import { slugify } from "../utils/slugify";

const emptyForm = { name: "", slug: "", image: null };

function AdminBrandsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    items: brands,
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
  } = useAdminList({ fetcher: getAdminBrands });

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(brand) {
    setEditing(brand);
    setForm({ name: brand.name, slug: brand.slug, image: null });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
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

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        ...(form.image ? { image: form.image } : {}),
      };

      if (editing) {
        await updateAdminBrand(editing.id, payload);
        setMessage("Đã cập nhật thương hiệu.");
      } else {
        await createAdminBrand(payload);
        setMessage("Đã thêm thương hiệu.");
      }

      closeModal();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu thương hiệu."));
    } finally {
      setIsSaving(false);
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
      await deleteAdminBrand(deleteTarget.id);
      setMessage("Đã xóa thương hiệu.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa thương hiệu."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý thương hiệu"
        description="Nike, Adidas, Puma và các hãng đồ bóng đá trong cửa hàng."
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="admin-btn admin-btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Thêm thương hiệu
          </button>
        }
      />

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm thương hiệu..."
        countLabel={`${count} thương hiệu`}
        onRefresh={load}
        isRefreshing={status === "loading"}
      />

      {status === "loading" && <AdminLoading rows={4} columns={4} />}

      {status === "success" && (
        <>
          <AdminTable>
            <thead>
              <tr>
                <th className="is-media">Logo</th>
                <th>Thương hiệu</th>
                <th>Slug</th>
                <th className="is-numeric">Sản phẩm</th>
                <th className="is-actions" />
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 && (
                <AdminTableEmpty
                  colSpan={5}
                  message="Không có thương hiệu phù hợp."
                />
              )}
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="is-media">
                    <AdminThumb
                      src={getAdminImageUrl(brand)}
                      alt={brand.name}
                    />
                  </td>
                  <td>
                    <p className="admin-table-title">{brand.name}</p>
                  </td>
                  <td className="is-muted">
                    <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {brand.slug}
                    </code>
                  </td>
                  <td className="is-numeric is-strong">
                    {brand.product_count ?? 0}
                  </td>
                  <td className="is-actions">
                    <AdminTableActions
                      onEdit={() => openEditModal(brand)}
                      onDelete={() => setDeleteTarget(brand)}
                    />
                  </td>
                </tr>
              ))}
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

      <AdminModal
        open={modalOpen}
        title={editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        description={
          editing
            ? "Cập nhật tên, slug và logo thương hiệu."
            : "Thêm hãng mới kèm logo đại diện."
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
              form="admin-brand-form"
              disabled={isSaving}
              className="admin-btn admin-btn-primary"
            >
              {isSaving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        }
      >
        <form id="admin-brand-form" onSubmit={handleSubmit} className="space-y-4">
          <AdminImageField
            label="Logo thương hiệu"
            previewUrl={editing ? getAdminImageUrl(editing) : ""}
            file={form.image}
            onFileChange={(file) =>
              setForm((current) => ({ ...current, image: file }))
            }
          />
          <div>
            <label className="admin-field-label" htmlFor="brand-name">
              Tên thương hiệu
            </label>
            <input
              id="brand-name"
              name="name"
              value={form.name}
              onChange={updateForm}
              placeholder="Tên thương hiệu"
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="admin-field-label" htmlFor="brand-slug">
              Slug
            </label>
            <input
              id="brand-slug"
              name="slug"
              value={form.slug}
              onChange={updateForm}
              placeholder="slug-thuong-hieu"
              className="admin-input"
              required
            />
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        message={
          deleteTarget
            ? `Xóa thương hiệu "${deleteTarget.name}"? Hành động này không thể hoàn tác.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isSaving}
      />
    </>
  );
}

export default AdminBrandsPage;