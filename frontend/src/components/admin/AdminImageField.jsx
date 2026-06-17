import { useEffect, useState } from "react";

import AdminThumb from "./AdminThumb";

function AdminImageField({
  label = "Ảnh",
  hint = "PNG, JPG hoặc WEBP. Tối đa 5MB.",
  previewUrl = "",
  file,
  onFileChange,
}) {
  const [preview, setPreview] = useState(previewUrl);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreview(previewUrl);
    return undefined;
  }, [file, previewUrl]);

  return (
    <div className="admin-image-field">
      <label className="admin-field-label">{label}</label>
      <div className="admin-image-field-body">
        <AdminThumb src={preview} alt={label} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
            className="admin-input cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-emerald-700"
          />
          <p className="text-xs text-slate-500">{hint}</p>
          {file && (
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="admin-btn admin-btn-ghost px-0 text-xs text-red-600 hover:bg-transparent hover:text-red-700"
            >
              Bỏ ảnh đã chọn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminImageField;