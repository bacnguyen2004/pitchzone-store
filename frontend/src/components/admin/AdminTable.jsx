import {
  GridIcon,
  PackageIcon,
  PencilIcon,
  TrashIcon,
  ViewIcon,
} from "../StoreIcons";

import AdminEmptyState from "./AdminEmptyState";

function AdminTable({ children, className = "" }) {
  return (
    <div className={`admin-table-wrap${className ? ` ${className}` : ""}`}>
      <div className="admin-table-scroll">
        <table className="admin-table">{children}</table>
      </div>
    </div>
  );
}

export function AdminTableEmpty({
  colSpan,
  message = "Không có dữ liệu phù hợp.",
  title,
  icon: Icon = PackageIcon,
}) {
  return (
    <tr className="admin-table-empty-row">
      <td colSpan={colSpan}>
        <AdminEmptyState
          compact
          icon={Icon}
          title={title || message}
          description={title ? message : undefined}
        />
      </td>
    </tr>
  );
}

export function AdminTableActions({
  onEdit,
  onDelete,
  onView,
  onVariants,
  editLabel = "Sửa",
  deleteLabel = "Xóa",
  viewLabel = "Xem chi tiết",
  variantsLabel = "Biến thể",
  children,
}) {
  return (
    <div className="admin-table-actions">
      {onVariants && (
        <button
          type="button"
          onClick={onVariants}
          className="admin-table-icon-btn is-variants"
          aria-label={variantsLabel}
          title={variantsLabel}
        >
          <GridIcon className="h-4 w-4" />
        </button>
      )}
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="admin-table-icon-btn is-view"
          aria-label={viewLabel}
          title={viewLabel}
        >
          <ViewIcon className="h-4 w-4" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="admin-table-icon-btn is-edit"
          aria-label={editLabel}
          title={editLabel}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="admin-table-icon-btn is-delete"
          aria-label={deleteLabel}
          title={deleteLabel}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export default AdminTable;