import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:p-8">
        <h1 className="mb-1 text-2xl font-black text-gray-900">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Join Food Genie to order or list your restaurant.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="Jane Doe"
            />
          </div>

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
              minLength={6}
              className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "customer", label: "Customer" },
                { value: "restaurant", label: "Restaurant" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-medium transition ${
                    form.role === opt.value
                      ? "border-orange-600 bg-orange-50 text-orange-700"
                      : "border-gray-300 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={form.role === opt.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 w-full rounded-lg bg-orange-600 py-2.5 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-orange-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
