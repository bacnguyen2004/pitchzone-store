import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import bannerSlide3 from "../assets/banner-slide-3.jpg";
import { CartIcon, CheckIcon } from "../components/AuthIcons";
import CheckoutAddressSection from "../components/CheckoutAddressSection";
import CheckoutVoucherSection from "../components/CheckoutVoucherSection";
import { getCart } from "../api/cart";
import { checkoutOrder } from "../api/orders";
import { getUserAddresses } from "../api/userAddresses";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency, getMainImage, resolveMediaUrl } from "../utils/format";
import { buildProductsUrl } from "../utils/productFilters";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  EmptyBoxIcon,
  HomeIcon,
  ImagePlaceholderIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "../components/StoreIcons";

const FREE_SHIPPING_THRESHOLD = 2_000_000;

const CHECKOUT_STEPS = [
  { id: "cart", label: "Giỏ hàng", to: "/cart" },
  { id: "checkout", label: "Thanh toán" },
  { id: "done", label: "Hoàn tất" },
];

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    shortLabel: "COD",
    description: "Kiểm tra hàng rồi thanh toán trực tiếp cho shipper.",
    Icon: TruckIcon,
  },
  {
    id: "transfer",
    label: "Chuyển khoản ngân hàng",
    shortLabel: "Chuyển khoản",
    description: "Nhận hướng dẫn chuyển khoản qua email xác nhận đơn.",
    Icon: ShieldCheckIcon,
  },
];

function getCartItemMeta(item) {
  const variant = item.variant;
  const unitPrice = Number(
    item.unit_price ?? variant?.effective_price ?? variant?.price ?? item.product?.price ?? 0,
  );
  const sizeLabel = variant?.size || variant?.name || null;

  return { unitPrice, sizeLabel };
}

function CheckoutSteps() {
  const activeIndex = 1;

  return (
    <ol className="cart-steps">
      {CHECKOUT_STEPS.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;
        const isLast = index === CHECKOUT_STEPS.length - 1;

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
            {step.to && isCompleted ? (
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

function CheckoutHero({ title, subtitle, breadcrumbCurrent = "Thanh toán" }) {
  return (
    <section className="cart-hero pitch-lines">
      <div className="cart-hero-bg" aria-hidden>
        <img src={bannerSlide3} alt="" className="h-full w-full object-cover" />
        <div className="products-hero-overlay" />
      </div>
      <div className="page-container cart-hero-content">
        <nav className="products-breadcrumb">
          <Link to="/" className="products-breadcrumb-link">
            <HomeIcon className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-emerald-700/60">/</span>
          <Link to="/cart" className="products-breadcrumb-link">
            Giỏ hàng
          </Link>
          <span className="text-emerald-700/60">/</span>
          <span className="font-medium text-emerald-100/90">
            {breadcrumbCurrent}
          </span>
        </nav>
        <h1 className="products-hero-title mt-6">{title}</h1>
        {subtitle && <p className="products-hero-desc mt-2">{subtitle}</p>}
      </div>
    </section>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="checkout-layout">
      <div className="checkout-panel-skeleton skeleton-shimmer" />
      <div className="checkout-panel-skeleton skeleton-shimmer" />
    </div>
  );
}

function CheckoutSummary({
  cart,
  items,
  subtotal,
  voucherDiscount,
  totalPrice,
  hasFreeShipping,
  shippingRemaining,
  paymentMethod,
  isSubmitting,
  showActions = true,
}) {
  const selectedPayment = PAYMENT_METHODS.find(
    (method) => method.id === paymentMethod,
  );
  const shippingPercent = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );

  return (
    <div className="checkout-panel checkout-summary-panel">
      <header className="checkout-summary-head">
        <h2>Tóm tắt đơn</h2>
        <p>
          {cart.total_items} sản phẩm · {items.length} dòng
        </p>
      </header>

      <div className="checkout-summary-body">
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

        <ul className="checkout-order-items">
          {items.map((item) => {
            const image = getMainImage(item.product);
            const imageUrl = resolveMediaUrl(image?.image);
            const { unitPrice, sizeLabel } = getCartItemMeta(item);
            const productUrl = `/products/${item.product.slug || item.product.id}`;

            return (
              <li key={item.id} className="checkout-order-item">
                <Link to={productUrl} className="checkout-order-thumb">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.product.name} />
                  ) : (
                    <ImagePlaceholderIcon className="h-5 w-5 text-slate-300" />
                  )}
                  <span className="checkout-order-qty">{item.quantity}</span>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={productUrl} className="checkout-order-name">
                    {item.product.name}
                  </Link>
                  <p className="checkout-order-meta">
                    {sizeLabel && <span>Size {sizeLabel} · </span>}
                    {formatCurrency(unitPrice)}
                  </p>
                </div>

                <span className="checkout-order-price">
                  {formatCurrency(item.total_price)}
                </span>
              </li>
            );
          })}
        </ul>

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
            <dt>Tạm tính</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          {voucherDiscount > 0 && (
            <div>
              <dt>Voucher</dt>
              <dd className="is-discount">-{formatCurrency(voucherDiscount)}</dd>
            </div>
          )}
          <div>
            <dt>Phí vận chuyển</dt>
            <dd className={hasFreeShipping ? "is-free" : ""}>
              {hasFreeShipping ? "Miễn phí" : "Tính khi thanh toán"}
            </dd>
          </div>
          <div>
            <dt>Hình thức</dt>
            <dd>{selectedPayment?.shortLabel}</dd>
          </div>
        </dl>

        <div className="cart-summary-total">
          <span>Tổng thanh toán</span>
          <strong className="price-text">{formatCurrency(totalPrice)}</strong>
        </div>
      </div>

      {showActions && (
        <div className="checkout-summary-actions">
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="btn-primary w-full rounded-xl py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
          </button>
          <Link
            to="/cart"
            className="btn-secondary mt-3 w-full rounded-xl py-3 text-center"
          >
            Quay lại giỏ hàng
          </Link>
        </div>
      )}
    </div>
  );
}

function CheckoutSection({
  step,
  title,
  description,
  children,
  isLast = false,
}) {
  return (
    <section className={`checkout-section ${isLast ? "is-last" : ""}`}>
      <header className="checkout-section-head">
        <span className="checkout-section-step">{step}</span>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div className="checkout-section-body">{children}</div>
    </section>
  );
}

function buildOrderNote(paymentMethod, note) {
  const method = PAYMENT_METHODS.find((item) => item.id === paymentMethod);
  const paymentLine = `Hình thức thanh toán: ${method?.label || paymentMethod}`;
  const trimmed = note.trim();

  return trimmed ? `${paymentLine}\n\n${trimmed}` : paymentLine;
}

function applySavedAddress(address) {
  return {
    full_name: address.full_name,
    phone: address.phone,
    address: address.full_address,
  };
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, status: authStatus } = useAuth();
  const [cart, setCart] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesStatus, setAddressesStatus] = useState("idle");
  const [addressMode, setAddressMode] = useState("manual");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [manualAddressValid, setManualAddressValid] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadCheckoutData() {
      if (!isAuthenticated) {
        return;
      }

      setStatus("loading");
      setAddressesStatus("loading");
      setError("");

      try {
        const [cartData, addressData] = await Promise.all([
          getCart(),
          getUserAddresses().catch(() => []),
        ]);

        if (ignore) {
          return;
        }

        const addresses = Array.isArray(addressData) ? addressData : [];

        setCart(cartData);
        setSavedAddresses(addresses);
        setAddressesStatus("success");
        setStatus("success");

        if (addresses.length > 0) {
          const defaultAddress =
            addresses.find((item) => item.is_default) || addresses[0];

          setAddressMode("saved");
          setSelectedAddressId(defaultAddress.id);
          setForm((current) => ({
            ...current,
            ...applySavedAddress(defaultAddress),
          }));
        } else {
          setAddressMode("manual");
        }
      } catch {
        if (!ignore) {
          setError("Không tải được giỏ hàng.");
          setAddressesStatus("error");
          setStatus("error");
        }
      }
    }

    loadCheckoutData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleSelectSavedAddress(addressId) {
    setSelectedAddressId(addressId);

    const address = savedAddresses.find((item) => item.id === addressId);

    if (!address) {
      return;
    }

    setForm((current) => ({
      ...current,
      ...applySavedAddress(address),
    }));
  }

  function handleAddressModeChange(mode) {
    setAddressMode(mode);

    if (mode === "saved") {
      const address =
        savedAddresses.find((item) => item.id === selectedAddressId) ||
        savedAddresses.find((item) => item.is_default) ||
        savedAddresses[0];

      if (address) {
        setSelectedAddressId(address.id);
        setForm((current) => ({
          ...current,
          ...applySavedAddress(address),
        }));
      }
    } else {
      setForm((current) => ({
        ...current,
        address: "",
      }));
      setManualAddressValid(false);
    }
  }

  const shippingReady =
    addressMode === "saved"
      ? Boolean(selectedAddressId && form.address.trim())
      : manualAddressValid && Boolean(form.address.trim());

  async function handleSubmit(event) {
    event.preventDefault();

    if (!shippingReady) {
      setError("Vui lòng chọn hoặc nhập địa chỉ giao hàng.");
      return;
    }

    if (!form.full_name.trim() || !form.phone.trim()) {
      setError("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await checkoutOrder({
        ...form,
        note: buildOrderNote(paymentMethod, form.note),
        voucher_code: voucherCode,
      });
      navigate("/orders");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Không thể tạo đơn hàng. Vui lòng kiểm tra giỏ hàng.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authStatus === "loading") {
    return (
      <main className="cart-page">
        <div className="page-container py-10">
          <p className="text-slate-500">Đang kiểm tra đăng nhập...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="cart-page">
        <CheckoutHero
          title="Thanh toán"
          subtitle="Đăng nhập để hoàn tất đặt hàng và theo dõi đơn."
        />
        <div className="page-container py-12">
          <div className="cart-guest-panel">
            <span className="cart-guest-icon">
              <CartIcon className="h-8 w-8" />
            </span>
            <h2>Chưa đăng nhập</h2>
            <p>Đăng nhập để tiếp tục thanh toán.</p>
            <div className="cart-guest-actions">
              <Link to="/login" className="btn-primary rounded-xl px-7 py-3">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-secondary rounded-xl px-7 py-3">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];
  const isLoading = status === "loading" && !cart;
  const subtotal = Number(cart?.total_price || 0);
  const totalPrice = Math.max(subtotal - voucherDiscount, 0);
  const shippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  if (status === "success" && items.length === 0) {
    return (
      <main className="cart-page">
        <CheckoutHero title="Thanh toán" subtitle="Giỏ hàng trống" />
        <div className="page-container py-12">
          <section className="cart-empty">
            <span className="cart-empty-icon">
              <EmptyBoxIcon className="h-8 w-8" />
            </span>
            <h2>Giỏ hàng trống</h2>
            <p>Thêm sản phẩm vào giỏ trước khi thanh toán.</p>
            <Link to={buildProductsUrl()} className="btn-primary mt-6 rounded-xl">
              Xem sản phẩm
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page pb-24 lg:pb-12">
      <CheckoutHero
        title="Thanh toán"
        subtitle="Điền thông tin giao hàng và chọn hình thức thanh toán"
      />

      <div className="cart-page-body">
        <div className="page-container py-8 sm:py-10">
          <CheckoutSteps />

          <div className="checkout-toolbar">
            <Link to="/cart" className="checkout-back">
              <ArrowLeftIcon className="h-4 w-4" />
              Quay lại giỏ hàng
            </Link>
          </div>

          {error && (
            <p role="alert" className="cart-error">
              {error}
            </p>
          )}

          {isLoading && <CheckoutSkeleton />}

          {items.length > 0 && cart && (
            <section className="checkout-layout">
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="checkout-panel"
              >
                <CheckoutSection
                  step="1"
                  title="Giao hàng"
                  description={
                    savedAddresses.length > 0 && addressMode === "saved"
                      ? "Chọn địa chỉ — tên và SĐT lấy từ địa chỉ đã lưu."
                      : "Điền người nhận và địa chỉ cho đơn này."
                  }
                >
                  <CheckoutAddressSection
                    addresses={savedAddresses}
                    loading={addressesStatus === "loading"}
                    mode={addressMode}
                    selectedAddressId={selectedAddressId}
                    onModeChange={handleAddressModeChange}
                    onSelectAddress={handleSelectSavedAddress}
                    contact={{
                      full_name: form.full_name,
                      phone: form.phone,
                    }}
                    onContactChange={handleChange}
                    onManualAddressChange={(fullAddress) =>
                      setForm((current) => ({
                        ...current,
                        address: fullAddress,
                      }))
                    }
                    onManualValidityChange={setManualAddressValid}
                    note={form.note}
                    onNoteChange={handleChange}
                  />
                </CheckoutSection>

                <CheckoutSection
                  step="2"
                  title="Voucher"
                  description="Nhập mã giảm giá nếu có."
                >
                  <CheckoutVoucherSection
                    subtotal={subtotal}
                    appliedCode={voucherCode}
                    discountAmount={voucherDiscount}
                    onApply={({ code, discountAmount }) => {
                      setVoucherCode(code);
                      setVoucherDiscount(discountAmount);
                    }}
                    onClear={() => {
                      setVoucherCode("");
                      setVoucherDiscount(0);
                    }}
                  />
                </CheckoutSection>

                <CheckoutSection
                  step="3"
                  title="Hình thức thanh toán"
                  description="Chọn phương thức phù hợp."
                  isLast
                >
                  <div className="checkout-payment-grid">
                    {PAYMENT_METHODS.map((method) => {
                      const isActive = paymentMethod === method.id;

                      return (
                        <label
                          key={method.id}
                          className={`checkout-payment-option ${
                            isActive ? "is-active" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={method.id}
                            checked={isActive}
                            onChange={() => setPaymentMethod(method.id)}
                            className="sr-only"
                          />
                          <span className="checkout-payment-icon">
                            <method.Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="checkout-payment-label">
                              {method.label}
                            </span>
                            <span className="checkout-payment-desc">
                              {method.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {paymentMethod === "transfer" && (
                    <p className="checkout-transfer-note">
                      Sau khi đặt hàng, bạn nhận email xác nhận kèm thông tin
                      chuyển khoản.
                    </p>
                  )}
                </CheckoutSection>
              </form>

              <aside className="checkout-aside">
                <CheckoutSummary
                  cart={cart}
                  items={items}
                  subtotal={subtotal}
                  voucherDiscount={voucherDiscount}
                  totalPrice={totalPrice}
                  hasFreeShipping={hasFreeShipping}
                  shippingRemaining={shippingRemaining}
                  paymentMethod={paymentMethod}
                  isSubmitting={isSubmitting}
                />
              </aside>

              <details className="group cart-mobile-summary lg:hidden">
                <summary>
                  <div>
                    <p>Tóm tắt đơn</p>
                    <span>
                      {cart.total_items} sp · {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <CheckoutSummary
                  cart={cart}
                  items={items}
                  subtotal={subtotal}
                  voucherDiscount={voucherDiscount}
                  totalPrice={totalPrice}
                  hasFreeShipping={hasFreeShipping}
                  shippingRemaining={shippingRemaining}
                  paymentMethod={paymentMethod}
                  isSubmitting={isSubmitting}
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
              <strong className="price-text">
                {formatCurrency(totalPrice)}
              </strong>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="btn-primary shrink-0 rounded-xl px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default CheckoutPage;