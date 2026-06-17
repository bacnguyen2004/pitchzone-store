import { ResetIcon } from "./StoreIcons";

function ProductsActiveFilters({ chips, onClear, onResetAll }) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="products-active-filters">
      <span className="products-active-filters-label">Đang lọc</span>
      <div className="products-active-filters-chips">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onClear(chip.clear)}
            className="products-active-chip"
          >
            {chip.label}
            <span className="products-active-chip-x" aria-hidden>
              ×
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onResetAll}
        className="products-active-reset"
      >
        <ResetIcon className="h-3.5 w-3.5" />
        Xóa tất cả
      </button>
    </div>
  );
}

export default ProductsActiveFilters;