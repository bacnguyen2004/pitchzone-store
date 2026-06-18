import { useState } from "react";
import { Link } from "react-router-dom";

import authVisual from "../assets/auth-login.jpg";
import { forgotPassword } from "../api/auth";
import AuthAlert from "../components/AuthAlert";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";
import { usePageTitle } from "../hooks/usePageTitle";

function ForgotPasswordPage() {
  usePageTitle("Quên mật khẩu");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const data = await forgotPassword(email);
      setMessage(data.detail);
    } catch (err) {
      const data = err?.response?.data;
      const text =
        data?.email?.[0] ||
        (typeof data?.detail === "string" ? data.detail : null) ||
        "Không gửi được yêu cầu. Vui lòng thử lại.";
      setError(text);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      visual={authVisual}
      visualAlt="Sân cỏ bóng đá"
      eyebrow="Khôi phục tài khoản"
      title="Quên mật khẩu?"
      subtitle="Nhập email đã đăng ký — chúng tôi sẽ gửi link đặt lại mật khẩu."
      footer={
        <>
          Nhớ mật khẩu?{" "}
          <Link
            className="font-medium text-emerald-600 underline decoration-emerald-200 underline-offset-4"
            to="/login"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-zinc-900">
        Đặt lại mật khẩu
      </h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {message && (
          <AuthAlert title="Đã gửi" messages={[message]} tone="success" />
        )}
        {error && <AuthAlert title="Lỗi" messages={[error]} tone="error" />}

        <AuthField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="email@example.com"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang gửi..." : "Gửi link đặt lại"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;