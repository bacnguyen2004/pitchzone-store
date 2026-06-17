import { useState } from "react";

import { changePassword } from "../../api/auth";
import AuthAlert from "../AuthAlert";
import AuthField from "../AuthField";
import { LockIcon } from "../AuthIcons";
import {
  getPasswordMismatchError,
  parseProfileError,
} from "../../utils/authErrors";

const emptyForm = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

function ProfilePasswordForm() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [alert, setAlert] = useState(null);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setAlert(null);

    if (form.new_password !== form.confirm_password) {
      setAlert(getPasswordMismatchError());
      return;
    }

    setStatus("saving");

    try {
      await changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm(emptyForm);
      setAlert({
        tone: "success",
        title: "Đổi mật khẩu thành công",
        messages: ["Mật khẩu mới đã được lưu."],
      });
      setStatus("idle");
    } catch (error) {
      setAlert(parseProfileError(error));
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      {alert && (
        <AuthAlert
          tone={alert.tone || "error"}
          title={alert.title}
          messages={alert.messages}
        />
      )}

      <div className="checkout-field-grid">
        <AuthField
          label="Mật khẩu hiện tại"
          name="current_password"
          type="password"
          value={form.current_password}
          onChange={updateForm}
          icon={<LockIcon className="h-4 w-4" />}
          autoComplete="current-password"
        />
        <AuthField
          label="Mật khẩu mới"
          name="new_password"
          type="password"
          value={form.new_password}
          onChange={updateForm}
          icon={<LockIcon className="h-4 w-4" />}
          autoComplete="new-password"
          minLength={8}
        />
        <AuthField
          label="Xác nhận mật khẩu mới"
          name="confirm_password"
          type="password"
          value={form.confirm_password}
          onChange={updateForm}
          icon={<LockIcon className="h-4 w-4" />}
          autoComplete="new-password"
          minLength={8}
        />
      </div>

      <p className="profile-form-hint">Mật khẩu mới cần ít nhất 8 ký tự.</p>

      <div className="profile-form-actions">
        <button
          type="submit"
          disabled={status === "saving"}
          className="btn-primary rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {status === "saving" ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>
      </div>
    </form>
  );
}

export default ProfilePasswordForm;