import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/checkoutMath";

function Summary({ totals }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-lg font-black text-gray-900">Order Summary</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4 text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4 text-gray-600">
          <span>Delivery fee</span>
          <span>{formatCurrency(totals.deliveryFee)}</span>
        </div>
        <div className="flex justify-between gap-4 text-gray-600">
          <span>GST and taxes</span>
          <span>{formatCurrency(totals.taxAmount)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between gap-4 text-base font-black text-gray-900">
            <span>Grand total</span>
            <span>{formatCurrency(totals.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const { cartItems, restaurant, updateQuantity, removeFromCart, clearCart, totals } =
    useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-orange-50 text-5xl">
          <span role="img" aria-label="empty plate">🍽️</span>
        </div>
        <h1 className="mt-6 text-2xl font-black text-gray-900">Your cart is empty</h1>
        <p className="mt-2 max-w-md text-gray-500">
          Browse restaurants, pick something delicious, and your order will appear here.
        </p>
        <Link
          to="/"
          className="mt-6 min-h-11 rounded-full bg-orange-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-orange-700"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
            Cart
          </p>
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
            {restaurant?.name}
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="min-h-11 self-start rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:flex-row"
            >
              <img
                src={item.image || "https://placehold.co/160x120/fed7aa/9a3412?text=Food"}
                alt={item.name}
                className="h-40 w-full rounded-xl object-cover sm:h-24 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <p className="font-black text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-h-11 items-center overflow-hidden rounded-full border border-orange-200 bg-orange-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="min-h-11 px-4 text-lg font-bold text-orange-700 hover:bg-orange-100"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-sm font-black text-orange-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="min-h-11 px-4 text-lg font-bold text-orange-700 hover:bg-orange-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="min-h-11 rounded-full px-3 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Summary totals={totals} />
          <button
            onClick={() => navigate("/checkout")}
            className="min-h-11 w-full rounded-full bg-orange-600 px-6 py-3 font-black text-white shadow-sm transition hover:bg-orange-700"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
