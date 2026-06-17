function ProductsCategoryRail({ categories, activeSlug, onSelect }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="products-category-rail">
      <span className="products-category-rail-label">Danh mục</span>
      <div className="products-category-rail-track">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`products-category-chip ${!activeSlug ? "is-active" : ""}`}
        >
          Tất cả
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.slug)}
            className={`products-category-chip ${
              activeSlug === category.slug ? "is-active" : ""
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductsCategoryRail;