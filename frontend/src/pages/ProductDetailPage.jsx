import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { addCartItem } from "../api/cart";
import { getProduct } from "../api/catalog";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency, getMainImage, resolveMediaUrl } from "../utils/format";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setStatus("loading");
      setError("");

      try {
        const productData = await getProduct(id);
        const mainImage = getMainImage(productData);

        setProduct(productData);
        setSelectedImage(resolveMediaUrl(mainImage?.image));
        setStatus("success");
      } catch {
        setError("Không tải được chi tiết sản phẩm.");
        setStatus("error");
      }
    }

    fetchProduct();
  }, [id]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setCartMessage("");
    setIsAdding(true);

    try {
      await addCartItem({
        product_id: product.id,
        quantity,
      });
      setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
    } catch {
      setCartMessage("Không thể thêm sản phẩm. Vui lòng kiểm tra tồn kho.");
    } finally {
      setIsAdding(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-zinc-600">Đang tải chi tiết sản phẩm...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-red-600">{error}</p>
        <Link className="mt-4 inline-block font-medium text-blue-600" to="/">
          Quay lại danh sách sản phẩm
        </Link>
      </main>
    );
  }

  const images = product.images || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link className="text-sm font-medium text-blue-700 hover:text-blue-800" to="/">
        Quay lại sản phẩm
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                No image
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((image) => {
                const imageUrl = resolveMediaUrl(image.image);

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`aspect-square overflow-hidden rounded-md border bg-white transition ${
                      selectedImage === imageUrl
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={image.alt_text || product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            {product.category?.name} / {product.brand?.name}
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-tight text-zinc-950">
            {product.name}
          </h1>

          <p className="mt-5 text-3xl font-bold text-blue-700">
            {formatCurrency(product.price)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-zinc-50 p-3">
              <p className="text-zinc-500">Tồn kho</p>
              <p className="mt-1 font-semibold text-zinc-950">
                {product.stock} sản phẩm
              </p>
            </div>
            <div className="rounded-md bg-emerald-50 p-3">
              <p className="text-emerald-700">Trạng thái</p>
              <p className="mt-1 font-semibold text-emerald-800">
                {product.stock > 0 ? "Có thể đặt hàng" : "Hết hàng"}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-6">
            <h2 className="font-semibold text-zinc-950">Mô tả sản phẩm</h2>
            <p className="mt-3 leading-7 text-zinc-700">
              {product.description || "Sản phẩm chưa có mô tả."}
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-zinc-700">Số lượng</label>
            <div className="mt-2 flex w-40 items-center rounded-md border border-zinc-300 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                className="h-10 w-10 font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.min(
                      Math.max(Number(event.target.value) || 1, 1),
                      product.stock || 1,
                    ),
                  )
                }
                className="h-10 w-16 border-x border-zinc-300 text-center outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(current + 1, product.stock))
                }
                className="h-10 w-10 font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                +
              </button>
            </div>
          </div>

          {cartMessage && (
            <p className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              {cartMessage}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
            <Link
              to="/cart"
              className="rounded-md border border-zinc-300 px-5 py-3 text-center font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              Xem giỏ hàng
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetailPage;
