import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deleteCartItem, getCart, updateCartItem } from "../api/cart";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency, getMainImage, resolveMediaUrl } from "../utils/format";

function CartPage() {
  const { isAuthenticated, status: authStatus } = useAuth();
  const [cart, setCart] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function refreshCart() {
    setStatus("loading");
    setError("");

    try {
      const data = await getCart();
      setCart(data);
      setStatus("success");
    } catch {
      setError("Không tải được giỏ hàng.");
      setStatus("error");
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitialCart() {
      if (!isAuthenticated) {
        return;
      }

      setStatus("loading");
      setError("");

      try {
        const data = await getCart();

        if (!ignore) {
          setCart(data);
          setStatus("success");
        }
      } catch {
        if (!ignore) {
          setError("Không tải được giỏ hàng.");
          setStatus("error");
        }
      }
    }

    loadInitialCart();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  async function changeQuantity(item, nextQuantity) {
    if (nextQuantity < 1 || nextQuantity > item.product.stock) {
      return;
    }

    await updateCartItem(item.id, { quantity: nextQuantity });
    await refreshCart();
  }

  async function removeItem(itemId) {
    await deleteCartItem(itemId);
    await refreshCart();
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
        <h1 className="text-3xl font-bold text-zinc-950">Giỏ hàng</h1>
        <p className="mt-3 text-zinc-600">
          Bạn cần đăng nhập để xem và cập nhật giỏ hàng.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </main>
    );
  }

  const items = cart?.items || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950">Giỏ hàng</h1>
          <p className="mt-2 text-zinc-600">Kiểm tra sản phẩm trước khi checkout.</p>
        </div>
        <Link className="font-medium text-blue-700 hover:text-blue-800" to="/">
          Tiếp tục mua hàng
        </Link>
      </div>

      {status === "loading" && (
        <p className="mt-6 text-zinc-600">Đang tải giỏ hàng...</p>
      )}

      {status === "error" && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {status === "success" && items.length === 0 && (
        <section className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-zinc-950">Giỏ hàng trống</h2>
          <p className="mt-2 text-zinc-600">Chọn vài sản phẩm để bắt đầu đặt hàng.</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Xem sản phẩm
          </Link>
        </section>
      )}

      {items.length > 0 && (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => {
              const image = getMainImage(item.product);
              const imageUrl = resolveMediaUrl(image?.image);

              return (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
                >
                  <div className="aspect-square overflow-hidden rounded-md bg-zinc-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div>
                    <h2 className="font-semibold text-zinc-950">
                      {item.product.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.product.brand?.name} / {item.product.category?.name}
                    </p>
                    <p className="mt-3 font-bold text-blue-700">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-md border border-zinc-300">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item, item.quantity - 1)}
                        className="h-9 w-9 font-semibold hover:bg-zinc-100"
                      >
                        -
                      </button>
                      <span className="w-10 border-x border-zinc-300 text-center text-sm font-semibold leading-9">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item, item.quantity + 1)}
                        className="h-9 w-9 font-semibold hover:bg-zinc-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">Tóm tắt</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Số lượng</span>
                <span className="font-semibold text-zinc-950">
                  {cart.total_items} sản phẩm
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-3">
                <span className="font-semibold text-zinc-950">Tổng tiền</span>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(cart.total_price)}
                </span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-5 block rounded-md bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              Thanh toán
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}

export default CartPage;
