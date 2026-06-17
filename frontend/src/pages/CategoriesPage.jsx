import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCategories } from "../api/catalog";
import CategoryMedia from "../components/CategoryMedia";
import SectionHeader from "../components/SectionHeader";
import { categoryDescriptions } from "../config/siteNav";
import { getCategoryAccent } from "../config/categoryVisuals";
import { buildProductsUrl } from "../utils/productFilters";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
        setStatus("success");
      } catch {
        setCategories([]);
        setStatus("error");
      }
    }

    loadCategories();
  }, []);

  return (
    <main className="bg-[#f3f4f6] pb-10">
      <div className="page-container py-8 sm:py-10">
        <SectionHeader
          title="Danh mục sản phẩm"
          description="Chọn danh mục để xem sản phẩm phù hợp — giày, áo đấu, bóng và phụ kiện bóng đá."
        />

        {status === "loading" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="h-36 animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Không tải được danh mục.
          </p>
        )}

        {status === "success" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const accent = getCategoryAccent(category.slug);

              return (
                <Link
                  key={category.id}
                  to={buildProductsUrl({ category: category.slug })}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <CategoryMedia slug={category.slug} size="lg" variant="photo" />
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {categoryDescriptions[category.slug] ||
                        "Khám phá sản phẩm trong danh mục này."}
                    </p>
                    <span className={`mt-4 inline-block text-sm font-medium ${accent.text}`}>
                      Xem sản phẩm →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default CategoriesPage;