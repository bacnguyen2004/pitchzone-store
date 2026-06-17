import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { addCartItem } from "../api/cart";
import { getProduct, getProducts } from "../api/catalog";
import AnimateIn from "../components/AnimateIn";
import { CartIcon, CheckIcon, ErrorIcon } from "../components/AuthIcons";
import ProductCard from "../components/ProductCard";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ImagePlaceholderIcon,
  InStockIcon,
  LowStockIcon,
  OutOfStockIcon,
  PlusIcon,
  MinusIcon,
  ReturnBoxIcon,
  ShieldCheckIcon,
  SupportIcon,
  TruckIcon,
} from "../components/StoreIcons";
import { productDetailPerks } from "../config/productsPage";
import { useAuth } from "../contexts/AuthContext";
import {
  formatCurrency,
  getMainImage,
  getProductPricing,
  getVariantPricing,
  resolveMediaUrl,
} from "../utils/format";
import { buildProductsUrl } from "../utils/productFilters";

const perkIcons = {
  authentic: ShieldCheckIcon,
  shipping: TruckIcon,
  sizing: SupportIcon,
  return: ReturnBoxIcon,
};

function DetailSkeleton() {
  return (
    <main className="product-detail-page">
      <div className="product-detail-top">
        <div className="page-container py-4">
          <div className="skeleton-shimmer h-4 w-56 rounded" />
        </div>
      </div>
      <div className="page-container py-6 sm:py-8">
        <div className="product-detail-layout">
          <div className="skeleton-shimmer aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton-shimmer h-6 w-32 rounded" />
            <div className="skeleton-shimmer h-10 w-full rounded" />
            <div className="skeleton-shimmer h-12 w-40 rounded" />
            <div className="skeleton-shimmer h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

function buildSizeOptions(variants = []) {
  const activeVariants = variants.filter((variant) => variant.is_active);
  const sizes = [...new Set(activeVariants.map((variant) => variant.size).filter(Boolean))];

  if (sizes.length === 0) {
    return activeVariants.map((variant) => ({
      key: String(variant.id),
      label: variant.size || variant.name || "Mặc định",
      variant,
    }));
  }

  return sizes.map((size) => ({
    key: size,
    label: size,
    variant:
      activeVariants.find((item) => item.size === size && item.stock > 0) ||
      activeVariants.find((item) => item.size === size),
  }));
}

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState("success");
  const [isAdding, setIsAdding] = useState(false);

  const images = useMemo(() => product?.images || [], [product]);
  const sizeOptions = useMemo(
    () => buildSizeOptions(product?.variants || []),
    [product],
  );

  const selectedVariant = useMemo(() => {
    if (selectedVariantId) {
      return product?.variants?.find((variant) => variant.id === selectedVariantId);
    }

    return sizeOptions[0]?.variant || null;
  }, [product, selectedVariantId, sizeOptions]);

  const variantPricing = getVariantPricing(selectedVariant || {});
  const displayPrice = variantPricing.price || Number(product?.price ?? 0);
  const displayStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const pricing =
    selectedVariant && variantPricing.price
      ? variantPricing
      : getProductPricing(product || {});

  const isOutOfStock = displayStock === 0;
  const isLowStock = displayStock > 0 && displayStock <= 5;
  useEffect(() => {
    async function fetchProduct() {
      setStatus("loading");
      setError("");
      setQuantity(1);
      setCartMessage("");
      setSelectedVariantId(null);

      try {
        const productData = await getProduct(slug);
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
  }, [slug]);

  useEffect(() => {
    if (!sizeOptions.length) {
      return;
    }

    const preferred =
      sizeOptions.find((option) => option.variant?.stock > 0)?.variant ||
      sizeOptions[0]?.variant;

    if (preferred) {
      setSelectedVariantId(preferred.id);
    }
  }, [sizeOptions]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId]);

  useEffect(() => {
    if (!product?.category?.slug) {
      return undefined;
    }

    async function fetchRelated() {
      try {
        const data = await getProducts({
          category: product.category.slug,
          page: 1,
        });
        const list = (data.results || data).filter((item) => item.id !== product.id);
        setRelatedProducts(list.slice(0, 4));
      } catch {
        setRelatedProducts([]);
      }
    }

    fetchRelated();
  }, [product]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setCartMessage("");
    setIsAdding(true);

    try {
      const payload = {
        product_id: product.id,
        quantity,
      };

      if (selectedVariant?.id) {
        payload.variant_id = selectedVariant.id;
      }

      await addCartItem(payload);
      setCartMessageType("success");
      setCartMessage("Đã thêm vào giỏ hàng.");
    } catch {
      setCartMessageType("error");
      setCartMessage("Không thể thêm sản phẩm. Kiểm tra lại size và tồn kho.");
    } finally {
      setIsAdding(false);
    }
  }

  if (status === "loading") {
    return <DetailSkeleton />;
  }

  if (status === "error") {
    return (
      <main className="product-detail-page">
        <div className="page-container py-16">
          <div className="product-detail-error">
            <ErrorIcon className="mx-auto h-6 w-6 text-red-500" />
            <p className="mt-3 text-sm text-red-600">{error}</p>
            <Link to={buildProductsUrl()} className="btn-primary mt-5">
              <ArrowLeftIcon />
              Quay lại sản phẩm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <div className="product-detail-top pitch-lines">
        <div className="page-container py-3.5 sm:py-4">
          <nav className="product-detail-breadcrumb">
            <Link to={buildProductsUrl()} className="product-detail-back">
              <ArrowLeftIcon className="h-4 w-4" />
              Sản phẩm
            </Link>
            <span className="text-emerald-700/50">/</span>
            <Link to="/" className="product-detail-crumb">
              <HomeIcon className="h-3.5 w-3.5" />
              Trang chủ
            </Link>
            {product.category?.slug && (
              <>
                <span className="text-emerald-700/50">/</span>
                <Link
                  to={buildProductsUrl({ category: product.category.slug })}
                  className="product-detail-crumb"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-emerald-700/50">/</span>
            <span className="product-detail-crumb-current">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="product-detail-body pitch-pattern">
        <div className="page-container py-6 sm:py-8">
          <div className="product-detail-layout">
            <AnimateIn className="product-detail-gallery">
              <div className="product-detail-stage">
                <div className="product-detail-stage-pattern pitch-pattern" aria-hidden />
                <div className="product-detail-stage-glow" aria-hidden />

                <div className="product-detail-image-wrap">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className={`product-detail-image ${
                        isOutOfStock ? "is-grayscale" : ""
                      }`}
                    />
                  ) : (
                    <div className="product-detail-placeholder">
                      <ImagePlaceholderIcon className="h-12 w-12 text-slate-300" />
                      <span>Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                {isOutOfStock && (
                  <div className="product-detail-soldout">
                    <span className="product-detail-soldout-pill">
                      <OutOfStockIcon className="h-4 w-4" />
                      Hết hàng
                    </span>
                  </div>
                )}

                {pricing.discountPercent > 0 && !isOutOfStock && (
                  <span className="product-detail-sale-badge">
                    -{pricing.discountPercent}%
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="product-detail-thumbs">
                  {images.map((image) => {
                    const imageUrl = resolveMediaUrl(image.image);
                    const isActive = selectedImage === imageUrl;

                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImage(imageUrl)}
                        className={`product-detail-thumb ${
                          isActive ? "is-active" : ""
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={image.alt_text || product.name}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </AnimateIn>

            <AnimateIn className="product-detail-info" delay={80}>
              <div className="product-detail-badges">
                {product.brand?.name && (
                  <span className="product-detail-brand">{product.brand.name}</span>
                )}
                {product.category?.name && (
                  <span className="product-detail-category">
                    {product.category.name}
                  </span>
                )}
              </div>

              <h1 className="product-detail-title">{product.name}</h1>

              {product.description && (
                <p className="product-detail-lead">{product.description}</p>
              )}

              <div className="product-detail-price-block">
                <div>
                  <p className="product-detail-price">{formatCurrency(displayPrice)}</p>
                  {pricing.hasDiscount && pricing.original && (
                    <p className="product-detail-price-original">
                      {formatCurrency(pricing.original)}
                    </p>
                  )}
                </div>
                {isOutOfStock ? (
                  <span className="product-detail-stock product-detail-stock-out">
                    <OutOfStockIcon className="h-4 w-4" />
                    Hết hàng
                  </span>
                ) : isLowStock ? (
                  <span className="product-detail-stock product-detail-stock-low">
                    <LowStockIcon className="h-4 w-4" />
                    Còn {displayStock}
                  </span>
                ) : (
                  <span className="product-detail-stock product-detail-stock-in">
                    <InStockIcon className="h-4 w-4" />
                    Sẵn hàng
                  </span>
                )}
              </div>

              {sizeOptions.length > 0 && (
                <div className="product-detail-size">
                  <div className="product-detail-size-head">
                    <h2 className="product-detail-size-title">Chọn size</h2>
                    <Link to="/contact" className="product-detail-size-help">
                      Tư vấn size
                    </Link>
                  </div>
                  <div className="product-detail-size-grid">
                    {sizeOptions.map((option) => {
                      const isSelected = selectedVariant?.id === option.variant?.id;
                      const isUnavailable = option.variant?.stock === 0;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => setSelectedVariantId(option.variant.id)}
                          className={`product-detail-size-chip ${
                            isSelected ? "is-active" : ""
                          } ${isUnavailable ? "is-disabled" : ""}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="product-detail-actions">
                {cartMessage && (
                  <p
                    className={`product-detail-actions-msg ${
                      cartMessageType === "success" ? "is-success" : "is-error"
                    }`}
                  >
                    {cartMessageType === "success" ? (
                      <CheckIcon className="h-4 w-4 shrink-0" />
                    ) : (
                      <ErrorIcon className="h-4 w-4 shrink-0" />
                    )}
                    {cartMessage}
                  </p>
                )}

                {isOutOfStock ? (
                  <p className="product-detail-actions-empty">
                    Sản phẩm hiện không còn hàng.
                  </p>
                ) : (
                  <>
                    <label className="product-detail-actions-qty">
                      <span className="product-detail-actions-qty-label">
                        Số lượng
                      </span>
                      <div className="product-detail-actions-stepper">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((current) => Math.max(current - 1, 1))
                          }
                          aria-label="Giảm số lượng"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={displayStock}
                          value={quantity}
                          onChange={(event) =>
                            setQuantity(
                              Math.min(
                                Math.max(Number(event.target.value) || 1, 1),
                                displayStock || 1,
                              ),
                            )
                          }
                          aria-label="Số lượng"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((current) =>
                              Math.min(current + 1, displayStock),
                            )
                          }
                          aria-label="Tăng số lượng"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className="product-detail-actions-primary"
                    >
                      <CartIcon />
                      {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </button>

                    <Link to="/cart" className="product-detail-actions-secondary">
                      Xem giỏ hàng
                    </Link>
                  </>
                )}

                {!isAuthenticated && !isOutOfStock && (
                  <p className="product-detail-actions-login">
                    <Link to="/login">Đăng nhập</Link> để thanh toán nhanh hơn
                  </p>
                )}
              </div>

              <div className="product-detail-specs">
                <div className="product-detail-spec">
                  <span>Thương hiệu</span>
                  <strong>{product.brand?.name || "—"}</strong>
                </div>
                <div className="product-detail-spec">
                  <span>Danh mục</span>
                  <strong>{product.category?.name || "—"}</strong>
                </div>
              </div>

              <ul className="product-detail-perks">
                {productDetailPerks.map((perk) => {
                  const Icon = perkIcons[perk.key] || ShieldCheckIcon;

                  return (
                    <li key={perk.key} className="product-detail-perk">
                      <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                      {perk.label}
                    </li>
                  );
                })}
              </ul>
            </AnimateIn>
          </div>

          <section className="product-detail-desc-panel">
            <h2 className="product-detail-section-title">Mô tả sản phẩm</h2>
            <div className="product-detail-desc">
              {product.description || (
                <p className="text-slate-400">Chưa có mô tả cho sản phẩm này.</p>
              )}
            </div>
          </section>

          {relatedProducts.length > 0 && (
            <section className="product-detail-related">
              <div className="product-detail-related-head">
                <div>
                  <p className="sport-eyebrow">Gợi ý thêm</p>
                  <h2 className="product-detail-section-title !mt-1">
                    Có thể bạn quan tâm
                  </h2>
                </div>
                {product.category?.slug && (
                  <Link
                    to={buildProductsUrl({ category: product.category.slug })}
                    className="link-action shrink-0"
                  >
                    Xem thêm
                    <ChevronRightIcon />
                  </Link>
                )}
              </div>

              <div className="product-detail-related-grid">
                {relatedProducts.map((item, index) => (
                  <AnimateIn key={item.id} className="h-full" delay={index * 60}>
                    <ProductCard product={item} />
                  </AnimateIn>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProductDetailPage;
