import { formatCurrency } from "../../utils/format";
import AdminStatusBadge from "./AdminStatusBadge";

function AdminOrderDetail({ order, onClose }) {
  if (!order) {
    return null;
  }

  const itemCount = (order.items || []).reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="admin-drawer-backdrop" onClick={onClose}>
      <aside
        className="admin-drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={`Chi tiết đơn #${order.id}`}
      >
        <header className="admin-drawer-head">
          <div>
            <p className="admin-drawer-eyebrow">Đơn hàng</p>
            <h2>#{order.id}</h2>
            <p className="admin-drawer-sub">
              {new Date(order.created_at).toLocaleString("vi-VN")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-drawer-close">
            Đóng
          </button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-section">
            <h3>Trạng thái</h3>
            <AdminStatusBadge status={order.status} />
          </section>

          <section className="admin-drawer-section">
            <h3>Khách hàng</h3>
            <dl className="admin-drawer-dl">
              <div>
                <dt>Tài khoản</dt>
                <dd>{order.user?.username || "—"}</dd>
              </div>
              <div>
                <dt>Người nhận</dt>
                <dd>{order.full_name}</dd>
              </div>
              <div>
                <dt>SĐT</dt>
                <dd>{order.phone}</dd>
              </div>
              <div>
                <dt>Địa chỉ</dt>
                <dd>{order.address}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-drawer-section">
            <h3>Sản phẩm ({itemCount})</h3>
            <ul className="admin-drawer-items">
              {(order.items || []).map((item) => (
                <li key={item.id} className="admin-drawer-item">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {item.product_name}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs text-slate-500">
                        {item.variant_name}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(item.total_price)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-drawer-section">
            <h3>Thanh toán</h3>
            <dl className="admin-drawer-dl">
              <div>
                <dt>Tạm tính</dt>
                <dd>{formatCurrency(order.subtotal ?? order.total_price)}</dd>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div>
                  <dt>Voucher {order.voucher_code}</dt>
                  <dd className="text-emerald-700">
                    -{formatCurrency(order.discount_amount)}
                  </dd>
                </div>
              )}
              <div>
                <dt>Tổng thanh toán</dt>
                <dd className="text-base font-bold text-slate-900">
                  {formatCurrency(order.total_price)}
                </dd>
              </div>
            </dl>
          </section>

          {order.note && (
            <section className="admin-drawer-section">
              <h3>Ghi chú</h3>
              <p className="admin-drawer-note">{order.note}</p>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}

export default AdminOrderDetail;