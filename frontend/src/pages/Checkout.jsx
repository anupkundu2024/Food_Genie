import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/checkoutMath";

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, restaurant, totals } = useCart();
  const navigate = useNavigate();
  const defaultAddress = useMemo(
    () => user?.address?.find((address) => address.isDefault) || user?.address?.[0] || {},
    [user]
  );
  const [address, setAddress] = useState({
    street: defaultAddress.street || "",
    city: defaultAddress.city || "",
    state: defaultAddress.state || "",
    pincode: defaultAddress.pincode || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateAddress = (event) => {
    setAddress((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        restaurantId: restaurant._id,
        items: cartItems.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
        })),
        deliveryAddress: address,
      };
      const orderRes = await api.post("/orders", orderPayload);
      const order = orderRes.data.data.order;
      const paymentRes = await api.post("/payments/create-intent", {
        orderId: order._id,
      });
      navigate(`/payment/${order._id}`, {
        state: {
          clientSecret: paymentRes.data.data.client_secret,
          amount: order.totalAmount,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not place your order.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-black text-gray-900">Your cart is empty</h1>
        <Link to="/" className="mt-4 inline-flex min-h-11 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Checkout
        </p>
        <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">Confirm delivery details</h1>
      </div>

      <form onSubmit={placeOrder} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
          <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-gray-700">Street</span>
              <input
                required
                name="street"
                value={address.street}
                onChange={updateAddress}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="House number, street, landmark"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-gray-700">City</span>
              <input
                required
                name="city"
                value={address.city}
                onChange={updateAddress}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-gray-700">State</span>
              <input
                required
                name="state"
                value={address.state}
                onChange={updateAddress}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-gray-700">Pincode</span>
              <input
                required
                name="pincode"
                value={address.pincode}
                onChange={updateAddress}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </label>
          </div>
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
        </div>

        <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-lg font-bold text-gray-900">{restaurant?.name}</h2>
          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0 text-gray-600">
                  {item.quantity} x {item.name}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3 border-t pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery fee</span>
              <span>{formatCurrency(totals.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST and taxes</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(totals.totalAmount)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 min-h-11 w-full rounded-full bg-orange-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {loading ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
