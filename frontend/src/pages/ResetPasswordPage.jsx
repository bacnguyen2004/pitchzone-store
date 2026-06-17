import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import authVisual from "../assets/auth-register.jpg";
import { resetPassword } from "../api/auth";
import AuthAlert from "../components/AuthAlert";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";
import { LockIcon } from "../components/AuthIcons";
import { usePageTitle } from "../hooks/usePageTitle";

function ResetPasswordPage() {
  usePageTitle("Đặt lại mật khẩu");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await resetPassword({ uid, token, password });
      navigate("/login", { replace: true, state: { reset: true } });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Không thể đặt lại mật khẩu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!uid || !token) {
    return (
      <main className="page-container py-14 text-center">
        <p className="text-slate-600">Liên kết đặt lại mật khẩu không hợp lệ.</p>
        <Link to="/forgot-password" className="btn-primary mt-6 inline-flex rounded-xl px-6 py-3">
          Yêu cầu link mới
        </Link>
      </main>
    );
  }

  return (
    <AuthLayout
      visual={authVisual}
      visualAlt="Đồ bóng đá"
      eyebrow="Mật khẩu mới"
      title="Tạo mật khẩu mới"
      subtitle="Nhập mật khẩu mới cho tài khoản PitchZone của bạn."
      footer={
        <Link className="font-medium text-emerald-600" to="/login">
          Quay lại đăng nhập
        </Link>
      }
    >
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-zinc-900">
        Mật khẩu mới
      </h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <AuthAlert title="Lỗi" messages={[error]} tone="error" />}

        <AuthField
          label="Mật khẩu mới"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          icon={<LockIcon />}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;