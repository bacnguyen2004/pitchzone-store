import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import bannerSlide2 from "../assets/banner-slide-2.jpg";
import AnimateIn from "../components/AnimateIn";
import { CartIcon, CheckIcon } from "../components/AuthIcons";
import { deleteCartItem, getCart, updateCartItem } from "../api/cart";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency, getMainImage, resolveMediaUrl } from "../utils/format";
import { FREE_SHIPPING_THRESHOLD } from "../config/shipping";
import { buildProductsUrl } from "../utils/productFilters";
import EmptyState from "../components/EmptyState";
import { ErrorPanel, LoadingPanel } from "../components/PageStatus";
import {
  ChevronRightIcon,
  EmptyBoxIcon,
  HomeIcon,
  ImagePlaceholderIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from "../components/StoreIcons";

const CART_STEPS = [
  { id: "cart", label: "Giỏ hàng" },
  { id: "checkout", label: "Thanh toán", to: "/checkout" },
  { id: "done", label: "Hoàn tất" },
];

function getCartItemMeta(item) {
  const variant = item.variant;
  const unitPrice = Number(
    item.unit_price ?? variant?.effective_price ?? variant?.price ?? item.product?.price ?? 0,
  );
  const compareAt = Number(variant?.compare_at_price ?? 0);
  const stock = variant?.stock ?? item.product?.stock ?? 0;
  const lineTotal = Number(item.total_price ?? unitPrice * item.quantity);
  const sizeLabel = variant?.size || variant?.name || null;

  return { unitPrice, compareAt, stock, lineTotal, sizeLabel };
}

function CartSteps() {
  const activeIndex = 0;

  return (
    <ol className="cart-steps">
      {CART_STEPS.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;
        const isLast = index === CART_STEPS.length - 1;

        const dot = (
          <span
            className={`cart-step-dot ${
              isCompleted ? "is-done" : isActive ? "is-active" : ""
            }`}
          >
            {isCompleted ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
          </span>
        );

        const label = (
          <span
            className={`cart-step-label ${
              isActive || isCompleted ? "is-emphasis" : ""
            }`}
          >
            {step.label}
          </span>
        );

        return (
          <li key={step.id} className="cart-step">
            {step.to && !isActive ? (
              <Link to={step.to} className="cart-step-link">
                {dot}
                {label}
              </Link>
            ) : (
              <span className="cart-step-link">
                {dot}
                {label}
              </span>
            )}
            {!isLast && <ChevronRightIcon className="cart-step-sep" />}
          </li>
        );
      })}
    </ol>
  );
}

function CartSkeleton() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="cart-item-skeleton skeleton-shimmer" />
        ))}
      </div>
      <div className="cart-summary-skeleton skeleton-shimmer" />
    </div>
  );
}

function CartSummary({
  cart,
  items,
  subtotal,
  hasFreeShipping,
  shippingRemaining,
  showActions = true,
}) {
  const shippingPercent = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );

  return (
    <div className="cart-summary">
      <div className="cart-summary-head">
        <h2>Tóm tắt đơn</h2>
      </div>

      <div className="cart-summary-stats">
        <div className="cart-summary-stat">
          <span className="cart-summary-stat-value">{cart.total_items}</span>
          <span className="cart-summary-stat-label">Sản phẩm</span>
        </div>
        <div className="cart-summary-stat">
          <span className="cart-summary-stat-value">
            {formatCurrency(subtotal)}
          </span>
          <span className="cart-summary-stat-label">Tạm tính</span>
        </div>
        <div className="cart-summary-stat">
          <span
            className={`cart-summary-stat-value ${
              hasFreeShipping ? "is-success" : ""
            }`}
          >
            {hasFreeShipping ? "Miễn phí" : formatCurrency(shippingRemaining)}
          </span>
          <span className="cart-summary-stat-label">
            {hasFreeShipping ? "Vận chuyển" : "Freeship"}
          </span>
        </div>
      </div>

      <div className="cart-summary-body">
        <div className="cart-freeship">
          <div className="cart-freeship-top">
            <TruckIcon className="h-4 w-4 shrink-0 text-slate-400" />
            {hasFreeShipping ? (
              <p>Đơn từ 2 triệu — được miễn phí vận chuyển</p>
            ) : (
              <p>
                Mua thêm{" "}
                <strong>{formatCurrency(shippingRemaining)}</strong> để miễn phí
                ship
              </p>
            )}
          </div>
          <div className="cart-freeship-bar">
            <span style={{ width: `${shippingPercent}%` }} />
          </div>
        </div>

        <dl className="cart-summary-lines">
          <div>
            <dt>Số dòng</dt>
            <dd>{items.length}</dd>
          </div>
          <div>
            <dt>Tạm tính</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          <div>
            <dt>Phí vận chuyển</dt>
            <dd className={hasFreeShipping ? "is-free" : ""}>
              {hasFreeShipping ? "Miễn phí" : "Tính khi thanh toán"}
            </dd>
          </div>
        </dl>

        <div className="cart-summary-total">
          <span>Tổng thanh toán</span>
          <strong className="price-text">{formatCurrency(subtotal)}</strong>
        </div>
      </div>

      {showActions && (
        <div className="cart-summary-actions">
          <Link to="/checkout" className="btn-primary w-full rounded-xl py-3.5">
            Thanh toán
          </Link>
          <Link
            to={buildProductsUrl()}
            className="btn-secondary mt-2.5 w-full rounded-xl py-3"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      )}
    </div>
  );
}

function CartItemCard({ item, isBusy, onChangeQuantity, onRemove }) {
  const image = getMainImage(item.product);
  const imageUrl = resolveMediaUrl(image?.image);
  const { unitPrice, stock, lineTotal, sizeLabel } = getCartItemMeta(item);
  const atMaxStock = item.quantity >= stock;
  const productUrl = `/products/${item.product.slug || item.product.id}`;

  return (
    <article className={`cart-item-card ${isBusy ? "is-busy" : ""}`}>
      <Link to={productUrl} className="cart-item-media">
        {imageUrl ? (
          <img src={imageUrl} alt={item.product.name} />
        ) : (
          <ImagePlaceholderIcon className="h-8 w-8 text-slate-300" />
        )}
      </Link>

      <div className="cart-item-body">
        <div className="cart-item-top">
          <div className="min-w-0">
            <Link to={productUrl} className="cart-item-name">
              {item.product.name}
            </Link>
            <p className="cart-item-meta">
              {item.product.brand?.name}
              {item.product.category?.name
                ? ` · ${item.product.category.name}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={isBusy}
            className="cart-item-delete"
            aria-label="Xóa sản phẩm"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="cart-item-bottom">
          <div className="cart-item-tags">
            {sizeLabel && (
              <span className="cart-item-size">Size {sizeLabel}</span>
            )}
            <span className="cart-item-unit">{formatCurrency(unitPrice)}</span>
          </div>

          <div className="cart-item-actions">
            <div className="cart-stepper">
              <button
                type="button"
                onClick={() => onChangeQuantity(item, item.quantity - 1)}
                disabled={item.quantity <= 1 || isBusy}
                aria-label="Giảm số lượng"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() => onChangeQuantity(item, item.quantity + 1)}
                disabled={atMaxStock || isBusy}
                aria-label="Tăng số lượng"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="cart-item-total">
              <span className="price-text">{formatCurrency(lineTotal)}</span>
              {atMaxStock && (
                <span className="cart-item-stock-warn">Tối đa {stock}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartPage() {
  const { isAuthenticated, status: authStatus } = useAuth();
  const [cart, setCart] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [busyItemId, setBusyItemId] = useState(null);

  async function refreshCart({ silent = false } = {}) {
    if (!silent) {
      setStatus("loading");
    }
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
    const { stock } = getCartItemMeta(item);

    if (nextQuantity < 1 || nextQuantity > stock || busyItemId === item.id) {
      return;
    }

    setBusyItemId(item.id);

    try {
      await updateCartItem(item.id, { quantity: nextQuantity });
      await refreshCart({ silent: true });
    } catch {
      setError("Không cập nhật được số lượng.");
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeItem(itemId) {
    if (busyItemId === itemId) {
      return;
    }

    setBusyItemId(itemId);

    try {
      await deleteCartItem(itemId);
      await refreshCart({ silent: true });
    } catch {
      setError("Không xóa được sản phẩm khỏi giỏ.");
    } finally {
      setBusyItemId(null);
    }
  }

  if (authStatus === "loading") {
    return (
      <main className="cart-page">
        <div className="page-container py-10">
          <LoadingPanel message="Đang kiểm tra đăng nhập..." />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="cart-page">
        <section className="cart-hero pitch-lines">
          <div className="cart-hero-bg" aria-hidden>
            <img src={bannerSlide2} alt="" className="h-full w-full object-cover" />
            <div className="products-hero-overlay" />
          </div>
          <div className="page-container cart-hero-content">
            <nav className="products-breadcrumb">
              <Link to="/" className="products-breadcrumb-link">
                <HomeIcon className="h-4 w-4" />
                Trang chủ
              </Link>
              <span className="text-emerald-700/60">/</span>
              <span className="font-medium text-emerald-100/90">Giỏ hàng</span>
            </nav>
            <h1 className="products-hero-title mt-6">Giỏ hàng</h1>
            <p className="products-hero-desc mt-2">
              Đăng nhập để lưu sản phẩm và thanh toán.
            </p>
          </div>
        </section>

        <div className="page-container py-12">
          <EmptyState
            icon={CartIcon}
            title="Chưa đăng nhập"
            description="Đăng nhập để đồng bộ giỏ hàng trên mọi thiết bị."
            actionTo="/login"
            actionLabel="Đăng nhập"
            secondaryActionTo="/register"
            secondaryActionLabel="Đăng ký"
            tone="cart"
          />
        </div>
      </main>
    );
  }

  const items = cart?.items || [];
  const isLoading = status === "loading" && !cart;
  const itemCount = cart?.total_items || 0;
  const subtotal = Number(cart?.total_price || 0);
  const shippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <main className="cart-page pb-24 lg:pb-12">
      <section className="cart-hero pitch-lines">
        <div className="cart-hero-bg" aria-hidden>
          <img src={bannerSlide2} alt="" className="h-full w-full object-cover" />
          <div className="products-hero-overlay" />
        </div>
        <div className="page-container cart-hero-content">
          <nav className="products-breadcrumb">
            <Link to="/" className="products-breadcrumb-link">
              <HomeIcon className="h-4 w-4" />
              Trang chủ
            </Link>
            <span className="text-emerald-700/60">/</span>
            <span className="font-medium text-emerald-100/90">Giỏ hàng</span>
          </nav>
          <h1 className="products-hero-title mt-6">Giỏ hàng</h1>
          <p className="products-hero-desc mt-2">
            {itemCount > 0
              ? "Kiểm tra size và số lượng trước khi thanh toán"
              : "Chưa có sản phẩm trong giỏ"}
          </p>
        </div>
      </section>

      <div className="cart-page-body">
        <div className="page-container py-8 sm:py-10">
          <CartSteps />

          {error && (
            <ErrorPanel
              className="cart-error"
              message={error}
              onRetry={() => refreshCart()}
            />
          )}

          {isLoading && <CartSkeleton />}

          {status === "success" && items.length === 0 && (
            <EmptyState
              icon={EmptyBoxIcon}
              title="Giỏ hàng trống"
              description="Thêm giày, áo đấu hoặc phụ kiện để bắt đầu đặt hàng."
              actionTo={buildProductsUrl()}
              actionLabel="Khám phá sản phẩm"
              secondaryActionTo="/categories"
              secondaryActionLabel="Xem danh mục"
              tone="cart"
            />
          )}

          {items.length > 0 && cart && (
            <section className="cart-layout">
              <div className="cart-items-panel">
                <header className="cart-items-head">
                  <h2>Sản phẩm</h2>
                  <span className="cart-items-count">{items.length} dòng</span>
                </header>

                <div className="cart-items-list">
                  {items.map((item, index) => (
                    <AnimateIn key={item.id} delay={index * 40}>
                      <CartItemCard
                        item={item}
                        isBusy={busyItemId === item.id}
                        onChangeQuantity={changeQuantity}
                        onRemove={removeItem}
                      />
                    </AnimateIn>
                  ))}
                </div>
              </div>

              <aside className="cart-aside">
                <CartSummary
                  cart={cart}
                  items={items}
                  subtotal={subtotal}
                  hasFreeShipping={hasFreeShipping}
                  shippingRemaining={shippingRemaining}
                />
              </aside>

              <details className="group cart-mobile-summary lg:hidden">
                <summary>
                  <div>
                    <p>Tóm tắt đơn</p>
                    <span>
                      {cart.total_items} sp · {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <CartSummary
                  cart={cart}
                  items={items}
                  subtotal={subtotal}
                  hasFreeShipping={hasFreeShipping}
                  shippingRemaining={shippingRemaining}
                  showActions={false}
                />
              </details>
            </section>
          )}
        </div>
      </div>

      {items.length > 0 && cart && (
        <div className="cart-mobile-bar lg:hidden">
          <div className="page-container cart-mobile-bar-inner">
            <div>
              <p>Tổng thanh toán</p>
              <strong className="price-text">{formatCurrency(subtotal)}</strong>
            </div>
            <Link to="/checkout" className="btn-primary shrink-0 rounded-xl px-6 py-3">
              Thanh toán
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default CartPage;