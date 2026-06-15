import { Link } from "react-router-dom";

import { formatCurrency, getMainImage, resolveMediaUrl } from "../utils/format";

function ProductCard({ product }) {
  const mainImage = getMainImage(product);
  const imageUrl = resolveMediaUrl(mainImage?.image);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={mainImage.alt_text || product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-500">{product.brand?.name}</p>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {product.category?.name}
          </span>
        </div>

        <h3 className="mt-2 min-h-12 font-semibold leading-6 text-zinc-950">
          {product.name}
        </h3>

        <p className="mt-3 text-lg font-bold text-blue-700">
          {formatCurrency(product.price)}
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Còn {product.stock} sản phẩm
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;
