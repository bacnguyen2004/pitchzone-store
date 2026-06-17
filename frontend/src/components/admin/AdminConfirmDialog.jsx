import AdminModal from "./AdminModal";

function AdminConfirmDialog({
  open,
  title = "Xác nhận xóa",
  message,
  confirmLabel = "Xóa",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <div className="admin-modal-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="admin-btn admin-btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="admin-btn admin-btn-danger"
          >
            {isLoading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-600">{message}</p>
    </AdminModal>
  );
}

export default AdminConfirmDialog;