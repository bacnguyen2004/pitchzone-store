import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthAlert from "../AuthAlert";
import AuthField from "../AuthField";
import { MailIcon, UserIcon } from "../AuthIcons";
import { useAuth } from "../../contexts/AuthContext";
import { parseProfileError } from "../../utils/authErrors";

const emptyForm = {
  username: "",
  email: "",
  full_name: "",
};

function ProfileAccountForm({ user, onGoToAddresses }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      username: user.username || "",
      email: user.email || "",
      full_name: user.customer_profile?.full_name || "",
    });
  }, [user]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    setAlert(null);

    try {
      await updateProfile({
        username: form.username.trim(),
        email: form.email.trim(),
        customer_profile: {
          full_name: form.full_name.trim(),
        },
      });
      setAlert({
        tone: "success",
        title: "Đã lưu",
        messages: ["Thông tin tài khoản đã được cập nhật."],
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

      <p className="profile-form-note">
        Tên và số điện thoại <strong>người nhận hàng</strong> nằm ở mục{" "}
        {onGoToAddresses ? (
          <button
            type="button"
            onClick={onGoToAddresses}
            className="font-medium text-primary hover:text-primary-hover"
          >
            Địa chỉ
          </button>
        ) : (
          <Link to="/profile" className="font-medium text-primary">
            Địa chỉ
          </Link>
        )}
        — dùng khi thanh toán.
      </p>

      <div className="checkout-field-grid">
        <AuthField
          label="Tên đăng nhập"
          name="username"
          value={form.username}
          onChange={updateForm}
          icon={<UserIcon className="h-4 w-4" />}
          autoComplete="username"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateForm}
          icon={<MailIcon />}
          autoComplete="email"
        />
        <AuthField
          label="Tên hiển thị"
          name="full_name"
          value={form.full_name}
          onChange={updateForm}
          icon={<UserIcon className="h-4 w-4" />}
          autoComplete="name"
          required={false}
        />
      </div>

      <p className="profile-form-hint">
        Tên hiển thị dùng chào bạn trên website (ví dụ: Xin chào, Minh). Không
        bắt buộc — để trống sẽ dùng tên đăng nhập.
      </p>

      <div className="profile-form-actions">
        <button
          type="submit"
          disabled={status === "saving"}
          className="btn-primary rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {status === "saving" ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}

export default ProfileAccountForm;