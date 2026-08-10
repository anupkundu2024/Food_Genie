import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/checkoutMath";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Payment failed. Please try again.");
      setLoading(false);
      return;
    }

    clearCart();
    navigate("/orders", {
      replace: true,
      state: { message: "Payment successful. Your order is being confirmed." },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
      <PaymentElement />
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
      <button
        disabled={!stripe || loading}
        className="mt-5 min-h-11 w-full rounded-full bg-orange-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
      >
        {loading ? "Processing..." : `Pay ${formatCurrency(amount)}`}
      </button>
    </form>
  );
}

export default function Payment() {
  const { orderId } = useParams();
  const location = useLocation();
  const clientSecret = location.state?.clientSecret;
  const amount = location.state?.amount || 0;
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#ea580c",
          borderRadius: "12px",
        },
      },
    }),
    [clientSecret]
  );

  if (!stripePromise) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
          <h1 className="text-2xl font-black text-gray-900">Stripe key missing</h1>
          <p className="mt-2 text-gray-600">
            Add VITE_STRIPE_PUBLISHABLE_KEY to the frontend .env file to enable card payments.
          </p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-gray-900">Payment session expired</h1>
        <p className="mt-2 text-gray-500">Create a fresh checkout session to continue.</p>
        <Link to="/checkout" className="mt-5 inline-flex min-h-11 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white">
          Back to Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Secure Payment
        </p>
        <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">Complete your order</h1>
        <p className="mt-1 break-all text-sm text-gray-500">Order #{orderId.slice(-8).toUpperCase()}</p>
      </div>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm amount={amount} />
      </Elements>
    </div>
  );
}
