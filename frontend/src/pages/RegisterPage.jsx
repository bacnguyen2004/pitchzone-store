import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/");
    } catch {
      setError("Không thể đăng ký. Tên đăng nhập có thể đã tồn tại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:gap-12">
      <section className="hidden lg:block">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          New customer
        </p>
        <h1 className="mt-2 text-4xl font-bold text-zinc-950">
          Tạo tài khoản TechGear Store
        </h1>
        <p className="mt-4 max-w-xl text-zinc-600">
          Sau khi đăng ký, hệ thống tự đăng nhập để bạn có thể thêm giỏ hàng và
          checkout ngay.
        </p>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-950">Đăng ký</h2>
        <p className="mt-2 text-zinc-600">Tạo tài khoản khách hàng mới.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">
              Tên đăng nhập
            </span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Mật khẩu</span>
            <input
              name="password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-zinc-400"
          >
            {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-600">
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-blue-700" to="/login">
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
