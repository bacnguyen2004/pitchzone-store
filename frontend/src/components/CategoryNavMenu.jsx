import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { getCategories } from "../api/catalog";
import { categoryDescriptions } from "../config/siteNav";
import { buildProductsUrl } from "../utils/productFilters";
import { ChevronDownIcon, ChevronRightIcon } from "./StoreIcons";

function useCategoryNavActive() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    pathname === "/categories" ||
    (pathname === "/products" && Boolean(activeCategory))
  );
}

function CategoryLinks({ categories, onNavigate, compact = false }) {
  if (categories.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-slate-500">Đang tải danh mục...</p>
    );
  }

  return (
    <ul className={`grid gap-1 ${compact ? "" : "sm:grid-cols-2"}`}>
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            to={buildProductsUrl({ category: category.slug })}
            onClick={onNavigate}
            className="group block rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
          >
            <span className="block text-sm font-medium text-slate-800 group-hover:text-primary">
              {category.name}
            </span>
            <span className="mt-0.5 block line-clamp-1 text-xs leading-5 text-slate-500">
              {categoryDescriptions[category.slug] ||
                "Xem sản phẩm trong danh mục này."}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CategoryNavMenuDesktop({ linkClassName }) {
  const [categories, setCategories] = useState([]);
  const isActive = useCategoryNavActive();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  const triggerClass =
    typeof linkClassName === "function"
      ? `${linkClassName({ isActive })} inline-flex items-center gap-1`
      : `inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-primary-light text-primary"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`;

  return (
    <div className="group relative">
      <button type="button" className={triggerClass} aria-haspopup="true">
        Danh mục
        <ChevronDownIcon className="h-3.5 w-3.5 transition group-hover:rotate-180" />
      </button>

      <div className="invisible absolute left-1/2 top-full z-30 w-[min(100vw-2rem,36rem)] -translate-x-1/2 pt-1 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-900">Danh mục sản phẩm</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Giày, áo đấu, bóng và phụ kiện bóng đá
            </p>
          </div>

          <div className="p-2.5">
            <CategoryLinks categories={categories} />
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
            <Link to="/categories" className="link-action text-[13px]">
              Xem tất cả danh mục
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryNavMenuMobile({ linkClassName }) {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const isActive = useCategoryNavActive();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  const triggerClass =
    typeof linkClassName === "function"
      ? linkClassName({ isActive })
      : `inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-primary-light text-primary"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`;

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={triggerClass}
        aria-expanded={isOpen}
      >
        Danh mục
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 w-[min(100vw-2rem,22rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-md">
          <CategoryLinks
            categories={categories}
            onNavigate={() => setIsOpen(false)}
            compact
          />
          <Link
            to="/categories"
            onClick={() => setIsOpen(false)}
            className="link-action mt-1 block rounded-lg px-3 py-2 text-[13px] hover:bg-slate-50"
          >
            Xem tất cả danh mục
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function CategoryNavMenu({ mode = "desktop", linkClassName }) {
  if (mode === "mobile") {
    return <CategoryNavMenuMobile linkClassName={linkClassName} />;
  }

  return <CategoryNavMenuDesktop linkClassName={linkClassName} />;
}

export default CategoryNavMenu;