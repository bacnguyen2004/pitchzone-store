function AdminLoading({ rows = 5, columns = 5, variant = "table" }) {
  if (variant === "cards") {
    return (
      <div className="admin-loading-cards">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="admin-loading-card skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="admin-loading-list">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="admin-loading-list-item">
            <div className="skeleton-shimmer h-4 w-24 rounded-md" />
            <div className="skeleton-shimmer h-3 w-full max-w-xs rounded-md" />
            <div className="skeleton-shimmer h-5 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-table-wrap admin-loading-table">
      <div
        className="admin-table-loading-head"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="skeleton-shimmer h-3 rounded-md" />
        ))}
      </div>
      <div className="admin-loading-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="admin-loading-row"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, colIndex) => (
              <div key={colIndex} className="skeleton-shimmer h-10 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminLoading;