import { useEffect, useMemo, useState } from "react";

import { getAdminUsers, normalizePageResponse, updateAdminUser } from "../api/admin";
import { UserIcon } from "../components/AuthIcons";
import AdminAlert from "../components/admin/AdminAlert";
import AdminDataSection from "../components/admin/AdminDataSection";
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
import AdminUserFields from "../components/admin/AdminUserFields";
import { useAdminList } from "../hooks/useAdminList";
import { getApiErrorMessage } from "../utils/adminErrors";

const roleFilters = [
  { value: "", label: "Tất cả" },
  { value: "admin", label: "Admin" },
  { value: "customer", label: "Khách" },
];

function buildForm(user) {
  return {
    username: user.username || "",
    email: user.email || "",
    full_name: user.customer_profile?.full_name || "",
    phone: user.customer_profile?.phone || "",
    is_staff: Boolean(user.is_staff),
  };
}

function getInitials(user) {
  const name = user.customer_profile?.full_name || user.username || "";
  return name.slice(0, 2).toUpperCase() || "U";
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminUsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(buildForm({}));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [stats, setStats] = useState({ total: 0, admins: 0, customers: 0 });

  const extraParams = useMemo(() => {
    if (roleFilter === "admin") {
      return { is_staff: true };
    }
    if (roleFilter === "customer") {
      return { is_staff: false };
    }
    return {};
  }, [roleFilter]);

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
  } = useAdminList({ fetcher: getAdminUsers, extraParams });

  async function loadStats() {
    try {
      const [allData, adminData] = await Promise.all([
        getAdminUsers({ page_size: 1 }),
        getAdminUsers({ page_size: 1, is_staff: true }),
      ]);
      const total = normalizePageResponse(allData).count;
      const admins = normalizePageResponse(adminData).count;
      setStats({ total, admins, customers: total - admins });
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadStats();
  }, [status, count]);

  function openEditModal(user) {
    setEditing(user);
    setForm(buildForm(user));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function updateFormField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
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
      await loadStats();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật người dùng."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-users-page">
      <section className="admin-deals-top">
        <AdminPageHeader
          title="Quản lý người dùng"
          description="Xem và cập nhật tài khoản khách hàng, hồ sơ và quyền admin."
        />

        <div className="admin-deals-metrics">
          <article className="admin-deals-metric is-total">
            <span className="admin-deals-metric-label">Tổng tài khoản</span>
            <span className="admin-deals-metric-value">{stats.total}</span>
          </article>
          <article className="admin-deals-metric is-running">
            <span className="admin-deals-metric-label">Quản trị viên</span>
            <span className="admin-deals-metric-value">{stats.admins}</span>
          </article>
          <article className="admin-deals-metric is-upcoming">
            <span className="admin-deals-metric-label">Khách hàng</span>
            <span className="admin-deals-metric-value">{stats.customers}</span>
          </article>
          <article className="admin-deals-metric is-expired">
            <span className="admin-deals-metric-label">Đang hiển thị</span>
            <span className="admin-deals-metric-value">{count}</span>
          </article>
        </div>
      </section>

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminDataSection>
        <AdminToolbar
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên, email, SĐT, tài khoản..."
          countLabel={`${count} người dùng`}
          onRefresh={load}
          isRefreshing={status === "loading"}
          filter={
            <div className="admin-filter-tabs" role="tablist" aria-label="Lọc vai trò">
              {roleFilters.map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  role="tab"
                  aria-selected={roleFilter === option.value}
                  onClick={() => setRoleFilter(option.value)}
                  className={`admin-filter-tab${
                    roleFilter === option.value ? " is-active" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />

        {status === "loading" && <AdminLoading rows={6} columns={5} />}

        {status === "success" && (
          <>
            <AdminTable className="is-users">
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Liên hệ</th>
                  <th className="is-status">Vai trò</th>
                  <th className="is-date">Tham gia</th>
                  <th className="is-date">Đăng nhập</th>
                  <th className="is-actions" />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <AdminTableEmpty
                    colSpan={6}
                    icon={UserIcon}
                    title="Không có người dùng"
                    message="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                  />
                )}

                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <span
                          className={`admin-user-avatar${
                            user.is_staff ? " is-admin" : ""
                          }`}
                        >
                          {getInitials(user)}
                        </span>
                        <div className="admin-table-cell-stack">
                          <p className="admin-table-title">
                            {user.customer_profile?.full_name || user.username}
                          </p>
                          <p className="admin-table-sub">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table-cell-stack">
                        <p className="admin-table-title">
                          {user.email || "—"}
                        </p>
                        <p className="admin-table-sub">
                          {user.customer_profile?.phone || "Chưa có SĐT"}
                        </p>
                      </div>
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
                    <td className="is-date is-muted">
                      {formatDateTime(user.last_login)}
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
      </AdminDataSection>

      <AdminModal
        open={modalOpen}
        size="lg"
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
        <form id="admin-user-form" onSubmit={handleSubmit}>
          {editing && (
            <div className="admin-user-modal-head">
              <span
                className={`admin-user-avatar is-lg${
                  editing.is_staff ? " is-admin" : ""
                }`}
              >
                {getInitials(editing)}
              </span>
              <div>
                <p className="admin-user-modal-name">
                  {editing.customer_profile?.full_name || editing.username}
                </p>
                <p className="admin-user-modal-meta">
                  ID #{editing.id} · Tham gia{" "}
                  {editing.date_joined
                    ? new Date(editing.date_joined).toLocaleDateString("vi-VN")
                    : "—"}
                </p>
              </div>
            </div>
          )}
          <AdminUserFields values={form} onFieldChange={updateFormField} />
        </form>
      </AdminModal>
    </div>
  );
}

export default AdminUsersPage;