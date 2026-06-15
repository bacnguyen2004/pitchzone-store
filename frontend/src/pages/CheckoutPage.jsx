import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCart } from "../api/cart";
import { checkoutOrder } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/format";

function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, status: authStatus } = useAuth();
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCart() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const data = await getCart();
        setCart(data);
        setStatus("success");
      } catch {
        setError("Không tải được giỏ hàng.");
        setStatus("error");
      }
    }

    loadCart();
  }, [isAuthenticated]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await checkoutOrder(form);
      navigate("/orders");
    } catch {
      setError("Không thể tạo đơn hàng. Vui lòng kiểm tra giỏ hàng.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <h1 className="text-3xl font-bold text-zinc-950">Checkout</h1>
        <p className="mt-3 text-zinc-600">Bạn cần đăng nhập để đặt hàng.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </main>
    );
  }

  if (status === "success" && (!cart || cart.items.length === 0)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-zinc-950">Giỏ hàng trống</h1>
        <p className="mt-3 text-zinc-600">Bạn cần thêm sản phẩm trước khi checkout.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Xem sản phẩm
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-950">Thanh toán</h1>
      <p className="mt-2 text-zinc-600">Nhập thông tin giao hàng để tạo đơn.</p>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Họ tên</span>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Số điện thoại</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700">Địa chỉ</span>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700">Ghi chú</span>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows="4"
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-md bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-zinc-400"
          >
            {isSubmitting ? "Đang tạo đơn..." : "Đặt hàng"}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Đơn hàng</h2>
          <div className="mt-4 space-y-3">
            {(cart?.items || []).map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-zinc-600">
                  {item.quantity} x {item.product.name}
                </span>
                <span className="font-semibold text-zinc-950">
                  {formatCurrency(item.total_price)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4">
            <span className="font-semibold text-zinc-950">Tổng tiền</span>
            <span className="text-xl font-bold text-blue-700">
              {formatCurrency(cart?.total_price)}
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default CheckoutPage;
