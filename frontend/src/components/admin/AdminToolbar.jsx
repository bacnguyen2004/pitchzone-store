import { ResetIcon, SearchIcon } from "../StoreIcons";

function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  countLabel,
  filter,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar-main">
        <div className="admin-search-field">
          <SearchIcon className="admin-search-icon h-4 w-4" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="admin-input"
          />
        </div>
        {filter}
      </div>

      <div className="admin-toolbar-meta">
        {countLabel && <p className="admin-toolbar-count">{countLabel}</p>}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="admin-btn admin-btn-secondary"
          >
            <ResetIcon className={`h-4 w-4${isRefreshing ? " animate-spin" : ""}`} />
            {isRefreshing ? "Đang tải..." : "Làm mới"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminToolbar;