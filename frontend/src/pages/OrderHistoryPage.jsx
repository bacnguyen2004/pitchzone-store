import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/format";

const statusLabel = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

function OrderHistoryPage() {
  const { isAuthenticated, status: authStatus } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) {
        return;
      }

      setStatus("loading");
      setError("");

      try {
        const data = await getOrders();
        setOrders(data);
        setStatus("success");
      } catch {
        setError("Không tải được lịch sử đơn hàng.");
        setStatus("error");
      }
    }

    loadOrders();
  }, [isAuthenticated]);

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
        <h1 className="text-3xl font-bold text-zinc-950">Đơn hàng</h1>
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
      <h1 className="text-3xl font-bold text-zinc-950">Lịch sử đơn hàng</h1>
      <p className="mt-2 text-zinc-600">Theo dõi các đơn bạn đã đặt.</p>

      {status === "loading" && (
        <p className="mt-6 text-zinc-600">Đang tải đơn hàng...</p>
      )}

      {status === "error" && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {status === "success" && orders.length === 0 && (
        <section className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-zinc-950">Chưa có đơn hàng</h2>
          <p className="mt-2 text-zinc-600">Checkout một giỏ hàng để tạo đơn đầu tiên.</p>
          <Link
            to="/products"
            className="mt-5 inline-block rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Xem sản phẩm
          </Link>
        </section>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-950">
                  <Link className="hover:text-blue-700" to={`/orders/${order.id}`}>
                    Đơn hàng #{order.id}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  {statusLabel[order.status] || order.status}
                </span>
                <span className="text-lg font-bold text-blue-700">
                  {formatCurrency(order.total_price)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-sm text-zinc-700"
                >
                  <span>
                    {item.quantity} x {item.product_name}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default OrderHistoryPage;
