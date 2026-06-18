import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminDashboard } from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import {
  AdminCategorySalesChart,
  AdminCombinedTrendChart,
  AdminOrdersTrendChart,
  AdminPaymentDonutChart,
  AdminPaymentStatusChart,
  AdminRevenueTrendChart,
  AdminStatusDonutChart,
  AdminTopProductsChart,
} from "../components/admin/AdminDashboardCharts";
import AdminEmptyState from "../components/admin/AdminEmptyState";
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
  TruckIcon,
} from "../components/StoreIcons";
import { adminNavGroups } from "../config/adminNav";
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

  const quickLinks = adminNavGroups
    .flatMap((group) => group.items)
    .filter((item) => item.to !== "/admin");

  const completionRate = useMemo(() => {
    if (!dashboard?.total_orders) {
      return 0;
    }
    return Math.round(
      ((dashboard.completed_orders || 0) / dashboard.total_orders) * 100,
    );
  }, [dashboard]);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Phân tích doanh thu, đơn hàng, thanh toán và kho hàng — 30 ngày gần nhất."
        action={
          <button
            type="button"
            onClick={loadDashboard}
            disabled={status === "loading"}
            className="admin-btn admin-btn-secondary"
          >
            <ResetIcon
              className={`h-4 w-4${status === "loading" ? " animate-spin" : ""}`}
            />
            Làm mới
          </button>
        }
      />

      {error && <AdminAlert tone="error">{error}</AdminAlert>}
      {status === "loading" && <AdminLoading rows={4} columns={4} />}

      {dashboard && status === "success" && (
        <div className="admin-dashboard">
          <section className="admin-stat-grid admin-dashboard-stats">
            <AdminStatCard
              tone="revenue"
              label="Tổng doanh thu"
              value={formatCurrency(dashboard.total_revenue)}
              hint={`7 ngày: ${formatCurrency(dashboard.revenue_7d)}`}
              icon={<PriceIcon className="h-5 w-5" />}
            />
            <AdminStatCard
              tone="orders"
              label="Đơn hàng"
              value={dashboard.total_orders}
              hint={`${dashboard.orders_7d || 0} đơn / 7 ngày · ${dashboard.pending_orders || 0} chờ xử lý`}
              icon={<PackageIcon className="h-5 w-5" />}
            />
            <AdminStatCard
              tone="products"
              label="Giá trị TB / đơn"
              value={formatCurrency(dashboard.avg_order_value)}
              hint={`30 ngày: ${formatCurrency(dashboard.revenue_30d)}`}
              icon={<TruckIcon className="h-5 w-5" />}
            />
            <AdminStatCard
              tone="promo"
              label="Khách hàng"
              value={dashboard.total_customers}
              hint={`+${dashboard.new_customers_30d || 0} khách mới / 30 ngày`}
              icon={<SparklesIcon className="h-5 w-5" />}
            />
          </section>

          <section className="admin-stat-grid admin-dashboard-stats-secondary">
            <AdminStatCard
              tone="revenue"
              label="Doanh thu 30 ngày"
              value={formatCurrency(dashboard.revenue_30d)}
              hint={`${dashboard.orders_30d || 0} đơn trong kỳ`}
            />
            <AdminStatCard
              tone="orders"
              label="Hoàn thành"
              value={`${completionRate}%`}
              hint={`${dashboard.completed_orders || 0} đơn giao xong`}
            />
            <AdminStatCard
              tone="products"
              label="Kho hàng"
              value={dashboard.total_products}
              hint={`${dashboard.total_categories || 0} danh mục · ${dashboard.total_brands || 0} thương hiệu`}
              icon={<ProductsIcon className="h-5 w-5" />}
            />
            <AdminStatCard
              tone="promo"
              label="Giảm giá voucher"
              value={formatCurrency(dashboard.total_discount)}
              hint={`${dashboard.active_promotions || 0} deal · ${dashboard.active_vouchers || 0} voucher`}
            />
          </section>

          <section className="admin-dashboard-chart-grid">
            <article className="admin-panel admin-chart-panel is-wide">
              <header className="admin-panel-head">
                <div>
                  <h2>Doanh thu & đơn hàng</h2>
                  <p className="admin-chart-subtitle">30 ngày gần nhất</p>
                </div>
              </header>
              <div className="admin-panel-body">
                <AdminCombinedTrendChart data={dashboard.daily_trend} />
              </div>
            </article>

            <article className="admin-panel admin-chart-panel">
              <header className="admin-panel-head">
                <div>
                  <h2>Doanh thu theo ngày</h2>
                  <p className="admin-chart-subtitle">Xu hướng 30 ngày</p>
                </div>
              </header>
              <div className="admin-panel-body">
                <AdminRevenueTrendChart data={dashboard.daily_trend} />
              </div>
            </article>

            <article className="admin-panel admin-chart-panel">
              <header className="admin-panel-head">
                <div>
                  <h2>Đơn hàng theo ngày</h2>
                  <p className="admin-chart-subtitle">Số lượng đơn / ngày</p>
                </div>
              </header>
              <div className="admin-panel-body">
                <AdminOrdersTrendChart data={dashboard.daily_trend} />
              </div>
            </article>
          </section>

          <section className="admin-dashboard-chart-grid is-three">
            <article className="admin-panel admin-chart-panel">
              <header className="admin-panel-head">
                <h2>Trạng thái đơn</h2>
              </header>
              <div className="admin-panel-body">
                <AdminStatusDonutChart statusCounts={dashboard.status_counts} />
              </div>
            </article>

            <article className="admin-panel admin-chart-panel">
              <header className="admin-panel-head">
                <h2>Phương thức thanh toán</h2>
              </header>
              <div className="admin-panel-body">
                <AdminPaymentDonutChart paymentMethods={dashboard.payment_methods} />
              </div>
            </article>

            <article className="admin-panel admin-chart-panel">
              <header className="admin-panel-head">
                <h2>Trạng thái thanh toán</h2>
              </header>
              <div className="admin-panel-body">
                <AdminPaymentStatusChart
                  paymentStatusCounts={dashboard.payment_status_counts}
                />
              </div>
            </article>
          </section>

          <section className="admin-dashboard-chart-grid">
            <article className="admin-panel admin-chart-panel">
              <header className="admin-panel-head">
                <h2>Top sản phẩm bán chạy</h2>
              </header>
              <div className="admin-panel-body">
                <AdminTopProductsChart topProducts={dashboard.top_products} />
              </div>
            </article>

            <article className="admin-panel admin-chart-panel">
              <header className="admin-panel-head">
                <h2>Doanh thu theo danh mục</h2>
              </header>
              <div className="admin-panel-body">
                <AdminCategorySalesChart categorySales={dashboard.category_sales} />
              </div>
            </article>
          </section>

          <section className="admin-layout-grid admin-dashboard-bottom">
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
                    <AdminEmptyState
                      compact
                      icon={PackageIcon}
                      title="Chưa có đơn hàng"
                      description="Đơn mới sẽ hiển thị tại đây."
                    />
                  )}
                  {dashboard.recent_orders.map((order) => (
                    <div key={order.id} className="admin-list-item">
                      <div className="min-w-0">
                        <p className="admin-table-title">
                          #{order.id} · {order.full_name}
                        </p>
                        <p className="admin-table-sub">
                          {order.user?.username || "Khách"} ·{" "}
                          {new Date(order.created_at).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

              {dashboard.voucher_usage?.length > 0 && (
                <section className="admin-panel">
                  <header className="admin-panel-head">
                    <h2>Voucher được dùng nhiều</h2>
                    <Link to="/admin/vouchers" className="link-action text-sm">
                      Quản lý
                    </Link>
                  </header>
                  <div className="admin-panel-body space-y-2">
                    {dashboard.voucher_usage.map((item) => (
                      <div key={item.voucher_code} className="admin-voucher-row">
                        <div>
                          <p className="font-bold text-slate-900">{item.voucher_code}</p>
                          <p className="text-xs text-slate-500">{item.uses} lượt dùng</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">
                          -{formatCurrency(item.discount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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
                      <Link key={item.to} to={item.to} className="admin-quick-link">
                        {item.label}
                        <ChevronRightIcon className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </aside>
          </section>
        </div>
      )}
    </>
  );
}

export default AdminDashboardPage;