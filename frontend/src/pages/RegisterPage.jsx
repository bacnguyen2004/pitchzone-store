import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import authVisual from "../assets/auth-register.jpg";
import AuthAlert from "../components/AuthAlert";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";
import { LockIcon, MailIcon, UserIcon } from "../components/AuthIcons";
import { useAuth } from "../contexts/AuthContext";
import {
  getPasswordMismatchError,
  parseRegisterError,
} from "../utils/authErrors";

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  function handleChange(event) {
    if (alert) {
      setAlert(null);
    }

    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setAlert(null);

    if (form.password !== form.confirmPassword) {
      setAlert(getPasswordMismatchError());
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate("/");
    } catch (error) {
      setAlert(parseRegisterError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      visual={authVisual}
      visualAlt="Áo đấu và phụ kiện bóng đá"
      eyebrow="Gia nhập PitchZone"
      title="Tạo tài khoản, sẵn sàng ra sân"
      subtitle="Giày đá bóng, áo đấu, tất, bóng… mọi thứ cho trận đấu và tập luyện đều có ở đây."
      features={[
        "Ưu đãi dành cho thành viên mới",
        "Giỏ hàng đồng bộ trên mọi thiết bị",
        "Đăng ký xong là vào chọn size ngay",
      ]}
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            className="font-medium text-emerald-600 underline decoration-emerald-200 underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-400"
            to="/login"
          >
            Đăng nhập ngay
          </Link>
        </>
      }
    >
      <div>
        <h2 className="text-[1.75rem] font-semibold leading-snug tracking-tight text-zinc-900">
          Tạo tài khoản mới
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-zinc-500">
          Điền thông tin bên dưới để bắt đầu mua đồ bóng đá chính hãng.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {alert && (
          <AuthAlert
            title={alert.title}
            messages={alert.messages}
            onDismiss={() => setAlert(null)}
          />
        )}

        <AuthField
          label="Tên đăng nhập"
          name="username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          placeholder="vd: nguyenvanfan"
          icon={<UserIcon />}
        />

        <AuthField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="vd: nguyen@email.com"
          icon={<MailIcon />}
        />

        <AuthField
          label="Mật khẩu"
          name="password"
          type="password"
          minLength={8}
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Ít nhất 8 ký tự"
          icon={<LockIcon />}
        />

        <AuthField
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          minLength={8}
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          icon={<LockIcon />}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;