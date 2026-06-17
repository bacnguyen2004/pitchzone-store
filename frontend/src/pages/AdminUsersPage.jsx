import { useState } from "react";

import { getAdminUsers, updateAdminUser } from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminLoading from "../components/admin/AdminLoading";
import AdminModal from "../components/admin/AdminModal";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminPagination from "../components/admin/AdminPagination";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import AdminTable, {
  AdminTableActions,
  AdminTableEmpty,
} from "../components/admin/AdminTable";
import AdminToolbar from "../components/admin/AdminToolbar";
import { useAdminList } from "../hooks/useAdminList";
import { getApiErrorMessage } from "../utils/adminErrors";

function buildForm(user) {
  return {
    username: user.username || "",
    email: user.email || "",
    full_name: user.customer_profile?.full_name || "",
    phone: user.customer_profile?.phone || "",
    is_staff: Boolean(user.is_staff),
  };
}

function AdminUsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(buildForm({}));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    items: users,
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
  } = useAdminList({ fetcher: getAdminUsers });

  function openEditModal(user) {
    setEditing(user);
    setForm(buildForm(user));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function updateForm(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!editing) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await updateAdminUser(editing.id, {
        username: form.username,
        email: form.email,
        is_staff: form.is_staff,
        customer_profile: {
          full_name: form.full_name,
          phone: form.phone,
        },
      });
      setMessage("Đã cập nhật người dùng.");
      closeModal();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật người dùng."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Xem và cập nhật tài khoản khách hàng, hồ sơ và quyền admin."
      />

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm theo tên, email, SĐT..."
        countLabel={`${count} người dùng`}
        onRefresh={load}
        isRefreshing={status === "loading"}
      />

      {status === "loading" && <AdminLoading rows={5} columns={5} />}

      {status === "success" && (
        <>
          <AdminTable>
            <thead>
              <tr>
                <th className="is-id">ID</th>
                <th>Tài khoản</th>
                <th>Email</th>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th className="is-status">Vai trò</th>
                <th className="is-date">Tham gia</th>
                <th className="is-actions" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <AdminTableEmpty
                  colSpan={8}
                  message="Không có người dùng phù hợp."
                />
              )}

              {users.map((user) => (
                <tr key={user.id}>
                  <td className="is-id">
                    <span className="admin-table-id">#{user.id}</span>
                  </td>
                  <td>
                    <p className="admin-table-title">{user.username}</p>
                  </td>
                  <td className="is-muted">{user.email || "—"}</td>
                  <td>{user.customer_profile?.full_name || "—"}</td>
                  <td className="is-muted">
                    {user.customer_profile?.phone || "—"}
                  </td>
                  <td className="is-status">
                    <AdminStatusBadge
                      label={user.is_staff ? "Admin" : "Khách"}
                      tone={user.is_staff ? "active" : "inactive"}
                    />
                  </td>
                  <td className="is-date is-muted">
                    {user.date_joined
                      ? new Date(user.date_joined).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="is-actions">
                    <AdminTableActions onEdit={() => openEditModal(user)} />
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
        title="Sửa người dùng"
        description={
          editing
            ? `Cập nhật thông tin tài khoản ${editing.username}.`
            : ""
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
              form="admin-user-form"
              disabled={isSaving}
              className="admin-btn admin-btn-primary"
            >
              {isSaving ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        }
      >
        <form id="admin-user-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="admin-field-label" htmlFor="user-username">
              Tài khoản
            </label>
            <input
              id="user-username"
              name="username"
              value={form.username}
              onChange={updateForm}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="admin-field-label" htmlFor="user-email">
              Email
            </label>
            <input
              id="user-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateForm}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-field-label" htmlFor="user-fullname">
              Họ tên
            </label>
            <input
              id="user-fullname"
              name="full_name"
              value={form.full_name}
              onChange={updateForm}
              className="admin-input"
              placeholder="Họ tên"
            />
          </div>
          <div>
            <label className="admin-field-label" htmlFor="user-phone">
              Số điện thoại
            </label>
            <input
              id="user-phone"
              name="phone"
              value={form.phone}
              onChange={updateForm}
              className="admin-input"
              placeholder="SĐT"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              name="is_staff"
              type="checkbox"
              checked={form.is_staff}
              onChange={updateForm}
            />
            Quyền quản trị (admin)
          </label>
        </form>
      </AdminModal>
    </>
  );
}

export default AdminUsersPage;