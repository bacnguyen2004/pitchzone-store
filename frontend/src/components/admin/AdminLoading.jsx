function AdminLoading({ rows = 5, columns = 5 }) {
  return (
    <div className="admin-table-wrap">
      <div className="admin-table-loading-head">
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
              <div
                key={colIndex}
                className="skeleton-shimmer h-11 rounded-xl"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminLoading;