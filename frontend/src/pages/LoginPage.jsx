import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import authVisual from "../assets/auth-login.jpg";
import AuthAlert from "../components/AuthAlert";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";
import { LockIcon, UserIcon } from "../components/AuthIcons";
import { useAuth } from "../contexts/AuthContext";
import { getLoginError } from "../utils/authErrors";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const nextPath =
    new URLSearchParams(location.search).get("next") || "/";

  const [form, setForm] = useState({
    username: "",
    password: "",
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
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(nextPath.startsWith("/") ? nextPath : "/");
    } catch {
      setAlert(getLoginError());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      visual={authVisual}
      visualAlt="Giày đá bóng và bóng trên sân cỏ"
      eyebrow="Chào mừng trở lại sân cỏ"
      title="Sẵn sàng cho trận đấu tiếp theo"
      subtitle="Giày, áo đấu và phụ kiện bóng đá — giỏ hàng và đơn hàng của bạn vẫn đang chờ."
      features={[
        "Theo dõi đơn hàng giày, áo, bóng mọi lúc",
        "Giỏ hàng được lưu sẵn cho lần sau",
        "Thanh toán nhanh với thông tin đã có",
      ]}
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            className="font-medium text-emerald-600 underline decoration-emerald-200 underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-400"
            to="/register"
          >
            Tạo tài khoản mới
          </Link>
        </>
      }
    >
      <div>
        <h2 className="text-[1.75rem] font-semibold leading-snug tracking-tight text-zinc-900">
          Đăng nhập
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-zinc-500">
          Vào tài khoản để tiếp tục mua giày, áo đấu và đồ bóng đá.
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
          placeholder="vd: fanbongda"
          icon={<UserIcon />}
        />

        <AuthField
          label="Mật khẩu"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          icon={<LockIcon />}
        />

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;