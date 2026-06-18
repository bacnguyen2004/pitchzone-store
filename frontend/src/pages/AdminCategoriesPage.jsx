import { useState } from "react";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminDataSection from "../components/admin/AdminDataSection";
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

function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    items: categories,
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
  } = useAdminList({ fetcher: getAdminCategories });

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      image: null,
    });
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
        await updateAdminCategory(editing.id, payload);
        setMessage("Đã cập nhật danh mục.");
      } else {
        await createAdminCategory(payload);
        setMessage("Đã thêm danh mục.");
      }

      closeModal();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu danh mục."));
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
      await deleteAdminCategory(deleteTarget.id);
      setMessage("Đã xóa danh mục.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa danh mục."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý danh mục"
        description="Giày bóng đá, quần áo, phụ kiện và các nhóm sản phẩm khác."
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="admin-btn admin-btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Thêm danh mục
          </button>
        }
      />

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminDataSection>
        <AdminToolbar
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm danh mục..."
          countLabel={`${count} danh mục`}
          onRefresh={load}
          isRefreshing={status === "loading"}
        />

        {status === "loading" && <AdminLoading rows={4} columns={4} />}

        {status === "success" && (
          <>
            <AdminTable>
            <thead>
              <tr>
                <th className="is-media">Ảnh</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th className="is-numeric">Sản phẩm</th>
                <th className="is-actions" />
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <AdminTableEmpty
                  colSpan={5}
                  message="Không có danh mục phù hợp."
                />
              )}
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="is-media">
                    <AdminThumb
                      src={getAdminImageUrl(category)}
                      alt={category.name}
                    />
                  </td>
                  <td>
                    <p className="admin-table-title">{category.name}</p>
                  </td>
                  <td className="is-muted">
                    <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {category.slug}
                    </code>
                  </td>
                  <td className="is-numeric is-strong">
                    {category.product_count ?? 0}
                  </td>
                  <td className="is-actions">
                    <AdminTableActions
                      onEdit={() => openEditModal(category)}
                      onDelete={() => setDeleteTarget(category)}
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
      </AdminDataSection>

      <AdminModal
        open={modalOpen}
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
        description={
          editing
            ? "Cập nhật tên, slug và ảnh danh mục."
            : "Tạo nhóm sản phẩm mới kèm ảnh đại diện."
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
              form="admin-category-form"
              disabled={isSaving}
              className="admin-btn admin-btn-primary"
            >
              {isSaving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        }
      >
        <form id="admin-category-form" onSubmit={handleSubmit} className="space-y-4">
          <AdminImageField
            label="Ảnh danh mục"
            previewUrl={editing ? getAdminImageUrl(editing) : ""}
            file={form.image}
            onFileChange={(file) =>
              setForm((current) => ({ ...current, image: file }))
            }
          />
          <div>
            <label className="admin-field-label" htmlFor="category-name">
              Tên danh mục
            </label>
            <input
              id="category-name"
              name="name"
              value={form.name}
              onChange={updateForm}
              placeholder="Tên danh mục"
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="admin-field-label" htmlFor="category-slug">
              Slug
            </label>
            <input
              id="category-slug"
              name="slug"
              value={form.slug}
              onChange={updateForm}
              placeholder="slug-danh-muc"
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
            ? `Xóa danh mục "${deleteTarget.name}"? Hành động này không thể hoàn tác.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isSaving}
      />
    </>
  );
}

export default AdminCategoriesPage;