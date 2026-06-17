import { useMemo, useState } from "react";

import { getAdminOrders, updateAdminOrderStatus } from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminLoading from "../components/admin/AdminLoading";
import AdminOrderDetail from "../components/admin/AdminOrderDetail";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminPagination from "../components/admin/AdminPagination";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import AdminTable, {
  AdminTableActions,
  AdminTableEmpty,
} from "../components/admin/AdminTable";
import AdminToolbar from "../components/admin/AdminToolbar";
import { ResetIcon } from "../components/StoreIcons";
import { adminOrderStatusOptions } from "../config/adminContent";
import { useAdminList } from "../hooks/useAdminList";
import { getApiErrorMessage } from "../utils/adminErrors";
import { formatCurrency } from "../utils/format";

function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionError, setActionError] = useState("");

  const extraParams = useMemo(
    () => (statusFilter ? { status: statusFilter } : {}),
    [statusFilter],
  );

  const {
    items: orders,
    page,
    pageSize,
    count,
    totalPages,
    search,
    status,
    error,
    load,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminList({
    fetcher: getAdminOrders,
    extraParams,
  });

  async function handleStatusChange(orderId, nextStatus) {
    setActionError("");

    try {
      await updateAdminOrderStatus(orderId, nextStatus);
      await load();
      setSelectedOrder((current) =>
        current?.id === orderId ? { ...current, status: nextStatus } : current,
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Không thể cập nhật trạng thái."));
    }
  }

  function handleStatusFilterChange(value) {
    setStatusFilter(value);
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý đơn hàng"
        description="Theo dõi đơn, xem chi tiết sản phẩm và cập nhật trạng thái giao hàng."
        action={
          <button
            type="button"
            onClick={load}
            className="admin-btn admin-btn-secondary"
          >
            <ResetIcon className={`h-4 w-4${status === "loading" ? " animate-spin" : ""}`} />
            Làm mới
          </button>
        }
      />

      {(error || actionError) && (
        <AdminAlert tone="error">{error || actionError}</AdminAlert>
      )}

      <AdminToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm theo mã, tên, SĐT, tài khoản..."
        countLabel={`${count} đơn hàng`}
        onRefresh={load}
        isRefreshing={status === "loading"}
        filter={
          <select
            value={statusFilter}
            onChange={(event) => handleStatusFilterChange(event.target.value)}
            className="admin-select max-w-xs"
          >
            <option value="">Tất cả trạng thái</option>
            {adminOrderStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      />

      {status === "loading" && <AdminLoading rows={6} columns={5} />}

      {status === "success" && (
        <>
          <AdminTable>
            <thead>
              <tr>
                <th className="is-id">Mã</th>
                <th>Khách hàng</th>
                <th>Tài khoản</th>
                <th className="is-numeric">SP</th>
                <th className="is-money">Tổng</th>
                <th className="is-status">Trạng thái</th>
                <th className="is-date">Ngày</th>
                <th className="is-actions" />
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <AdminTableEmpty
                  colSpan={8}
                  message="Không có đơn hàng phù hợp."
                />
              )}
              {orders.map((order) => {
                const itemCount = (order.items || []).reduce(
                  (total, item) => total + item.quantity,
                  0,
                );

                return (
                  <tr key={order.id}>
                    <td className="is-id">
                      <span className="admin-table-id">#{order.id}</span>
                    </td>
                    <td>
                      <div className="admin-table-cell-stack">
                        <p className="admin-table-title">{order.full_name}</p>
                        <p className="admin-table-sub">{order.phone}</p>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table-cell-stack">
                        <p className="admin-table-title">
                          {order.user?.username || "—"}
                        </p>
                        <p className="admin-table-sub">
                          {order.user?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="is-numeric">
                      <span className="admin-table-chip">{itemCount} SP</span>
                    </td>
                    <td className="is-money">
                      <div className="admin-table-cell-stack">
                        <span>{formatCurrency(order.total_price)}</span>
                        {Number(order.discount_amount) > 0 && (
                          <p className="admin-table-sub text-emerald-700">
                            {order.voucher_code} · -
                            {formatCurrency(order.discount_amount)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="is-status">
                      <div className="admin-table-status">
                        <AdminStatusBadge status={order.status} />
                        <select
                          value={order.status}
                          onChange={(event) =>
                            handleStatusChange(order.id, event.target.value)
                          }
                          className="admin-select"
                        >
                          {adminOrderStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="is-date is-muted">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="is-actions">
                      <AdminTableActions
                        onView={() => setSelectedOrder(order)}
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

      <AdminOrderDetail
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}

export default AdminOrdersPage;