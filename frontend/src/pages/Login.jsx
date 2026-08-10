import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:p-8">
        <h1 className="mb-1 text-2xl font-black text-gray-900">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-500">
          Log in to order from your favourite restaurants.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 w-full rounded-lg bg-orange-600 py-2.5 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-orange-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
