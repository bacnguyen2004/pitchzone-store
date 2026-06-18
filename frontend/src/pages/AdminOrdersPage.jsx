import { useEffect, useMemo, useState } from "react";

import {
  getAdminDashboard,
  getAdminOrders,
  updateAdminOrderStatus,
} from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminLoading from "../components/admin/AdminLoading";
import AdminOrderCard from "../components/admin/AdminOrderCard";
import AdminOrderDetail from "../components/admin/AdminOrderDetail";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminPagination from "../components/admin/AdminPagination";
import { PackageIcon, ResetIcon, SearchIcon } from "../components/StoreIcons";
import { adminOrderStatusOptions } from "../config/adminContent";
import { useAdminList } from "../hooks/useAdminList";
import { getApiErrorMessage } from "../utils/adminErrors";

function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [showMobileDetail, setShowMobileDetail] = useState(false);

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

  async function refreshStatusCounts() {
    try {
      const data = await getAdminDashboard();
      const map = {};
      (data.status_counts || []).forEach((item) => {
        map[item.status] = item.count;
      });
      setStatusCounts(map);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    refreshStatusCounts();
  }, [status]);

  useEffect(() => {
    if (status !== "success" || orders.length === 0) {
      return;
    }

    setSelectedOrder((current) => {
      if (current && orders.some((order) => order.id === current.id)) {
        return orders.find((order) => order.id === current.id) || current;
      }
      return orders[0];
    });
  }, [orders, status]);

  const totalOrders = useMemo(
    () =>
      Object.values(statusCounts).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      ),
    [statusCounts],
  );

  function handleSelectOrder(order) {
    setSelectedOrder(order);
    setShowMobileDetail(true);
  }

  function handleCloseMobileDetail() {
    setShowMobileDetail(false);
  }

  async function handleStatusChange(orderId, nextStatus) {
    setActionError("");
    setBusyOrderId(orderId);

    try {
      const updatedOrder = await updateAdminOrderStatus(orderId, nextStatus);
      await load();
      await refreshStatusCounts();
      setSelectedOrder((current) =>
        current?.id === orderId ? updatedOrder : current,
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Không thể cập nhật trạng thái."));
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <div className="admin-orders-page">
      <AdminPageHeader
        title="Đơn hàng"
        description="Quản lý đơn, theo dõi giao hàng và xử lý thanh toán."
        action={
          <button
            type="button"
            onClick={load}
            className="admin-btn admin-btn-secondary"
          >
            <ResetIcon
              className={`h-4 w-4${status === "loading" ? " animate-spin" : ""}`}
            />
            Làm mới
          </button>
        }
      />

      {(error || actionError) && (
        <AdminAlert tone="error">{error || actionError}</AdminAlert>
      )}

      <section className="admin-orders-metrics">
        <button
          type="button"
          className={`admin-orders-metric${statusFilter === "" ? " is-active" : ""}`}
          onClick={() => setStatusFilter("")}
        >
          <span className="admin-orders-metric-value">{totalOrders}</span>
          <span className="admin-orders-metric-label">Tất cả</span>
        </button>
        {adminOrderStatusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`admin-orders-metric is-${option.value}${
              statusFilter === option.value ? " is-active" : ""
            }`}
            onClick={() => setStatusFilter(option.value)}
          >
            <span className="admin-orders-metric-value">
              {statusCounts[option.value] || 0}
            </span>
            <span className="admin-orders-metric-label">{option.label}</span>
          </button>
        ))}
      </section>

      <div className="admin-orders-workspace">
        <section className="admin-orders-inbox admin-panel">
          <header className="admin-orders-inbox-head">
            <div className="admin-orders-inbox-title">
              <PackageIcon className="h-5 w-5 text-emerald-600" />
              <div>
                <h2>Danh sách đơn</h2>
                <p>{count} đơn phù hợp</p>
              </div>
            </div>
            <div className="admin-search-field admin-orders-search">
              <SearchIcon className="admin-search-icon h-4 w-4" />
              <input
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Mã đơn, tên, SĐT, email..."
                className="admin-input admin-orders-search-input"
              />
            </div>
          </header>

          <div className="admin-orders-inbox-body">
            {status === "loading" && <AdminLoading rows={5} variant="list" />}

            {status === "success" && orders.length === 0 && (
              <div className="admin-orders-empty">
                <PackageIcon className="h-10 w-10 text-slate-300" />
                <p>Không có đơn hàng phù hợp.</p>
              </div>
            )}

            {status === "success" && orders.length > 0 && (
              <div className="admin-orders-list">
                {orders.map((order) => (
                  <AdminOrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={handleSelectOrder}
                  />
                ))}
              </div>
            )}
          </div>

          {status === "success" && count > 0 && (
            <footer className="admin-orders-inbox-foot">
              <AdminPagination
                page={page}
                totalPages={totalPages}
                count={count}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </footer>
          )}
        </section>

        <aside className="admin-orders-detail admin-panel hidden lg:flex">
          <AdminOrderDetail
            order={selectedOrder}
            onStatusChange={handleStatusChange}
            isUpdating={busyOrderId === selectedOrder?.id}
          />
        </aside>
      </div>

      {showMobileDetail && selectedOrder && (
        <div className="admin-orders-mobile-detail lg:hidden">
          <div
            className="admin-orders-mobile-backdrop"
            onClick={handleCloseMobileDetail}
            aria-hidden
          />
          <div className="admin-orders-mobile-panel admin-panel">
            <AdminOrderDetail
              order={selectedOrder}
              onClose={handleCloseMobileDetail}
              onStatusChange={handleStatusChange}
              isUpdating={busyOrderId === selectedOrder?.id}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;