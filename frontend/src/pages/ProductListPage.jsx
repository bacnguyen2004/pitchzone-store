import { useEffect, useMemo, useState } from "react";

import { getBrands, getCategories, getProducts } from "../api/catalog";
import ProductCard from "../components/ProductCard";

const initialFilters = {
  search: "",
  category: "",
  brand: "",
  min_price: "",
  max_price: "",
  ordering: "-created_at",
};

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const activeParams = useMemo(() => {
    const params = { page };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "") {
        params[key] = value;
      }
    });

    return params;
  }, [filters, page]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [categoryData, brandData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        setCategories(categoryData);
        setBrands(brandData);
      } catch {
        setCategories([]);
        setBrands([]);
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setStatus("loading");
      setError("");

      try {
        const data = await getProducts(activeParams);
        const list = data.results || data;

        setProducts(list);
        setPageInfo({
          count: data.count || list.length,
          next: data.next || null,
          previous: data.previous || null,
        });
        setStatus("success");
      } catch {
        setError("Không tải được danh sách sản phẩm.");
        setStatus("error");
      }
    }

    fetchProducts();
  }, [activeParams]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setPage(1);
  }

  return (
    <main>
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              TechGear Store
            </p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-950 sm:text-4xl">
              Laptop và phụ kiện công nghệ cho học tập, làm việc
            </h1>
            <p className="mt-3 text-zinc-600">
              Dữ liệu được lấy trực tiếp từ Django REST API, có tìm kiếm, lọc,
              sắp xếp và phân trang.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:grid-cols-6">
          <label className="lg:col-span-2">
            <span className="text-sm font-medium text-zinc-700">Tìm kiếm</span>
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="MacBook, Logitech..."
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label>
            <span className="text-sm font-medium text-zinc-700">Danh mục</span>
            <select
              name="category"
              value={filters.category}
              onChange={updateFilter}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-medium text-zinc-700">Thương hiệu</span>
            <select
              name="brand"
              value={filters.brand}
              onChange={updateFilter}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-medium text-zinc-700">Giá từ</span>
            <input
              name="min_price"
              type="number"
              min="0"
              value={filters.min_price}
              onChange={updateFilter}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label>
            <span className="text-sm font-medium text-zinc-700">Giá đến</span>
            <input
              name="max_price"
              type="number"
              min="0"
              value={filters.max_price}
              onChange={updateFilter}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex items-end gap-2 lg:col-span-2">
            <label className="flex-1">
              <span className="text-sm font-medium text-zinc-700">Sắp xếp</span>
              <select
                name="ordering"
                value={filters.ordering}
                onChange={updateFilter}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="-created_at">Mới nhất</option>
                <option value="price">Giá thấp đến cao</option>
                <option value="-price">Giá cao đến thấp</option>
                <option value="name">Tên A-Z</option>
              </select>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            {status === "loading"
              ? "Đang tải sản phẩm..."
              : `${pageInfo.count} sản phẩm phù hợp`}
          </p>
        </div>

        {status === "error" && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {status === "success" && products.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-zinc-950">
              Không có sản phẩm phù hợp
            </h2>
            <p className="mt-2 text-zinc-600">Thử đổi từ khóa hoặc bộ lọc.</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={!pageInfo.previous}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trước
          </button>
          <span className="text-sm font-medium text-zinc-600">Trang {page}</span>
          <button
            type="button"
            disabled={!pageInfo.next}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProductListPage;
