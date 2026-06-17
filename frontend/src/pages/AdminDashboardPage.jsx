import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminDashboard } from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminLoading from "../components/admin/AdminLoading";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import {
  ChevronRightIcon,
  PackageIcon,
  PriceIcon,
  ProductsIcon,
  ResetIcon,
  SparklesIcon,
} from "../components/StoreIcons";
import { adminNavGroups } from "../config/adminNav";
import { adminOrderStatus } from "../config/adminContent";
import { formatCurrency } from "../utils/format";

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  async function loadDashboard() {
    setStatus("loading");
    setError("");

    try {
      const data = await getAdminDashboard();
      setDashboard(data);
      setStatus("success");
    } catch {
      setError("Không tải được dashboard admin.");
      setStatus("error");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const statusCounts = useMemo(() => {
    if (!dashboard?.status_counts) {
      return [];
    }

    return dashboard.status_counts.map((item) => ({
      ...item,
      meta: adminOrderStatus[item.status] || {
        label: item.status,
        badge: "is-pending",
      },
    }));
  }, [dashboard]);

  const quickLinks = adminNavGroups
    .flatMap((group) => group.items)
    .filter((item) => item.to !== "/admin");

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Tổng quan doanh thu, đơn hàng, kho hàng và khuyến mãi PitchZone Store."
        action={
          <button
            type="button"
            onClick={loadDashboard}
            disabled={status === "loading"}
            className="admin-btn admin-btn-secondary"
          >
            <ResetIcon className={`h-4 w-4${status === "loading" ? " animate-spin" : ""}`} />
            Làm mới
          </button>
        }
      />

      {error && <AdminAlert tone="error">{error}</AdminAlert>}
      {status === "loading" && <AdminLoading rows={4} columns={4} />}

      {dashboard && status === "success" && (
        <>
          <section className="admin-stat-grid">
            <AdminStatCard
              tone="revenue"
              label="Doanh thu"
              value={formatCurrency(dashboard.total_revenue)}
              hint="Không tính đơn đã hủy"
              icon={<PriceIcon className="h-5 w-5" />}
            />
            <AdminStatCard
              tone="orders"
              label="Đơn hàng"
              value={dashboard.total_orders}
              hint={`${dashboard.pending_orders || 0} đơn chờ xử lý`}
              icon={<PackageIcon className="h-5 w-5" />}
            />
            <AdminStatCard
              tone="products"
              label="Sản phẩm"
              value={dashboard.total_products}
              hint={`${dashboard.total_categories || 0} danh mục · ${dashboard.total_brands || 0} thương hiệu`}
              icon={<ProductsIcon className="h-5 w-5" />}
            />
            <AdminStatCard
              tone="promo"
              label="Khuyến mãi"
              value={`${dashboard.active_promotions || 0} deal`}
              hint={`${dashboard.active_vouchers || 0} voucher đang chạy`}
              icon={<SparklesIcon className="h-5 w-5" />}
            />
          </section>

          <section className="admin-layout-grid">
            <div className="space-y-5">
              <section className="admin-panel">
                <header className="admin-panel-head">
                  <h2>Đơn mới nhất</h2>
                  <Link to="/admin/orders" className="link-action text-sm">
                    Xem tất cả
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </header>
                <div className="admin-panel-body space-y-2">
                  {dashboard.recent_orders.length === 0 && (
                    <p className="admin-empty">Chưa có đơn hàng.</p>
                  )}
                  {dashboard.recent_orders.map((order) => (
                    <div key={order.id} className="admin-list-item">
                      <div className="min-w-0">
                        <p className="admin-table-title">
                          #{order.id} · {order.full_name}
                        </p>
                        <p className="admin-table-sub">
                          {order.user?.username || "Khách"} ·{" "}
                          {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <AdminStatusBadge status={order.status} />
                        <span className="font-bold text-slate-900">
                          {formatCurrency(order.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="admin-panel">
                <header className="admin-panel-head">
                  <h2>Trạng thái đơn hàng</h2>
                </header>
                <div className="admin-panel-body">
                  {statusCounts.length === 0 ? (
                    <p className="admin-empty">Chưa có dữ liệu trạng thái.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {statusCounts.map((item) => (
                        <div key={item.status} className="admin-status-row">
                          <AdminStatusBadge
                            status={item.status}
                            label={item.meta.label}
                          />
                          <span className="text-sm font-bold text-slate-900">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="admin-panel">
                <header className="admin-panel-head">
                  <h2>Sắp hết hàng</h2>
                  <Link to="/admin/products" className="link-action text-sm">
                    Quản lý
                  </Link>
                </header>
                <div className="admin-panel-body space-y-2">
                  {dashboard.low_stock_products.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Không có sản phẩm sắp hết hàng.
                    </p>
                  )}
                  {dashboard.low_stock_products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                        {product.name}
                      </span>
                      <span className="admin-badge is-pending">
                        {product.stock} SP
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="admin-panel">
                <header className="admin-panel-head">
                  <h2>Truy cập nhanh</h2>
                </header>
                <div className="admin-panel-body">
                  <div className="admin-quick-links">
                    {quickLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="admin-quick-link"
                      >
                        {item.label}
                        <ChevronRightIcon className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className="admin-highlight-card">
                <h2 className="text-sm font-bold text-slate-700">Khách hàng</h2>
                <p className="admin-highlight-value mt-2">
                  {dashboard.total_customers}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tài khoản khách (không phải admin)
                </p>
                <Link
                  to="/admin/users"
                  className="admin-btn admin-btn-primary mt-4 w-full"
                >
                  Quản lý người dùng
                </Link>
              </section>
            </aside>
          </section>
        </>
      )}
    </>
  );
}

export default AdminDashboardPage;