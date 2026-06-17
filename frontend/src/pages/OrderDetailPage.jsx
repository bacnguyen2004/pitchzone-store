import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getOrder } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/format";

const statusLabel = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, status: authStatus } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!isAuthenticated) {
        return;
      }

      setStatus("loading");
      setError("");

      try {
        const data = await getOrder(id);
        setOrder(data);
        setStatus("success");
      } catch {
        setError("Không tải được chi tiết đơn hàng.");
        setStatus("error");
      }
    }

    loadOrder();
  }, [id, isAuthenticated]);

  if (authStatus === "loading") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-zinc-600">Đang kiểm tra đăng nhập...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-zinc-950">Chi tiết đơn hàng</h1>
        <p className="mt-3 text-zinc-600">Bạn cần đăng nhập để xem đơn hàng.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link className="text-sm font-semibold text-blue-700" to="/orders">
        Quay lại đơn hàng
      </Link>

      {status === "loading" && (
        <p className="mt-6 text-zinc-600">Đang tải chi tiết đơn...</p>
      )}

      {status === "error" && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {order && (
        <>
          <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-zinc-950">
                  Đơn hàng #{order.id}
                </h1>
                <p className="mt-2 text-zinc-500">
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  {statusLabel[order.status] || order.status}
                </span>
                {Number(order.discount_amount) > 0 && (
                  <p className="mt-2 text-sm text-emerald-700">
                    Voucher {order.voucher_code}: -
                    {formatCurrency(order.discount_amount)}
                  </p>
                )}
                <p className="mt-3 text-2xl font-bold text-blue-700">
                  {formatCurrency(order.total_price)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-zinc-500">Người nhận</p>
                <p className="mt-1 font-semibold text-zinc-950">{order.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Số điện thoại</p>
                <p className="mt-1 font-semibold text-zinc-950">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Địa chỉ</p>
                <p className="mt-1 font-semibold text-zinc-950">{order.address}</p>
              </div>
            </div>

            {order.note && (
              <div className="mt-4 rounded-md bg-zinc-50 p-4 text-sm text-zinc-700">
                {order.note}
              </div>
            )}
          </section>

          <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">Sản phẩm</h2>
            <div className="mt-4 divide-y divide-zinc-200">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 py-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-zinc-950">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-zinc-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-blue-700">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default OrderDetailPage;
