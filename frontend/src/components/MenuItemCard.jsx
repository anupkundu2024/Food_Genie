import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/checkoutMath";

function VegIndicator({ isVeg }) {
  const color = isVeg ? "border-green-600" : "border-red-600";
  const dot = isVeg ? "bg-green-600" : "bg-red-600";
  return (
    <span
      className={`flex h-4 w-4 items-center justify-center rounded-sm border ${color}`}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
    </span>
  );
}

export default function MenuItemCard({ menuItem }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [toast, setToast] = useState("");
  const { name, description, price, image, isVeg, isAvailable } = menuItem;
  const inCart = cartItems.find((item) => item.id === menuItem._id);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 1200);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleAdd = () => {
    const added = addToCart(menuItem, 1);
    if (added) setToast("Added to cart");
  };

  return (
    <div className="relative flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between">
      {toast && (
        <div className="absolute right-4 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
          {toast}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <VegIndicator isVeg={isVeg} />
          <h4 className="min-w-0 font-semibold text-gray-900">{name}</h4>
        </div>
        <p className="font-medium text-gray-800">{formatCurrency(price)}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:justify-start">
        {image && (
          <img
            src={image}
            alt={name}
            className="h-20 w-24 rounded-lg object-cover sm:h-20 sm:w-24"
          />
        )}

        {!inCart ? (
          <button
            onClick={handleAdd}
            disabled={!isAvailable}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
              !isAvailable
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            {!isAvailable ? "Unavailable" : "Add to Cart"}
          </button>
        ) : (
          <div className="flex min-h-11 items-center overflow-hidden rounded-full border border-orange-200 bg-orange-50">
            <button
              onClick={() => updateQuantity(inCart.id, inCart.quantity - 1)}
              className="min-h-11 px-4 text-lg font-semibold text-orange-700 hover:bg-orange-100"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-orange-700">
              {inCart.quantity}
            </span>
            <button
              onClick={() => updateQuantity(inCart.id, inCart.quantity + 1)}
              className="min-h-11 px-4 text-lg font-semibold text-orange-700 hover:bg-orange-100"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
