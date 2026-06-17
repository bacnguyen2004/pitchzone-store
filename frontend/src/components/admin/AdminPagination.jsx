import { ChevronLeftIcon, ChevronRightIcon } from "../StoreIcons";

function AdminPagination({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  if (!count) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);

  return (
    <div className="admin-pagination">
      <p className="admin-pagination-info">
        Hiển thị <span className="font-semibold text-slate-700">{start}–{end}</span> /{" "}
        <span className="font-semibold text-slate-700">{count}</span> mục
      </p>

      <div className="admin-pagination-controls">
        <label className="admin-pagination-size">
          <span className="sr-only">Số dòng mỗi trang</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="admin-select"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="admin-btn admin-btn-secondary"
          aria-label="Trang trước"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Trước
        </button>
        <span className="admin-pagination-page">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="admin-btn admin-btn-secondary"
          aria-label="Trang sau"
        >
          Sau
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;