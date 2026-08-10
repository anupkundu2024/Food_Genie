import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateCheckout } from "../utils/checkoutMath";

const CART_KEY = "food_genie_cart";
const LEGACY_CART_KEY = "cart";

const CartContext = createContext(null);

const readCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_CART_KEY);
    if (!raw) return { restaurant: null, cartItems: [] };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {
        restaurant: parsed[0]
          ? { _id: parsed[0].restaurant, name: parsed[0].restaurantName || "Restaurant" }
          : null,
        cartItems: parsed.map((item) => ({ ...item, id: item.menuItem || item.id })),
      };
    }
    return {
      restaurant: parsed.restaurant || null,
      cartItems: Array.isArray(parsed.cartItems) ? parsed.cartItems : [],
    };
  } catch {
    return { restaurant: null, cartItems: [] };
  }
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readCart());

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    localStorage.removeItem(LEGACY_CART_KEY);
  }, [cart]);

  const clearCart = () => {
    setCart({ restaurant: null, cartItems: [] });
  };

  const addToCart = (item, qty = 1) => {
    const restaurantId =
      item.restaurantId || item.restaurant?._id || item.restaurant || item.restaurant_id;
    const restaurantName =
      item.restaurantName || item.restaurant?.name || item.restaurant?.restaurantName || "this restaurant";

    if (!restaurantId) return false;

    const incomingRestaurant = { _id: restaurantId, name: restaurantName };
    const currentRestaurantId = cart.restaurant?._id || cart.restaurant?.id;

    if (
      currentRestaurantId &&
      currentRestaurantId !== restaurantId &&
      cart.cartItems.length > 0
    ) {
      const shouldClear = window.confirm(
        `Your cart has items from ${cart.restaurant?.name || "another restaurant"}. Clear and add this instead?`
      );
      if (!shouldClear) return false;
      setCart({
        restaurant: incomingRestaurant,
        cartItems: [normalizeItem(item, qty, incomingRestaurant)],
      });
      return true;
    }

    setCart((current) => {
      const existing = current.cartItems.find((line) => line.id === item._id || line.id === item.id);
      if (existing) {
        return {
          restaurant: current.restaurant || incomingRestaurant,
          cartItems: current.cartItems.map((line) =>
            line.id === existing.id
              ? { ...line, quantity: line.quantity + qty }
              : line
          ),
        };
      }

      return {
        restaurant: current.restaurant || incomingRestaurant,
        cartItems: [...current.cartItems, normalizeItem(item, qty, incomingRestaurant)],
      };
    });

    return true;
  };

  const removeFromCart = (id) => {
    setCart((current) => {
      const nextItems = current.cartItems.filter((item) => item.id !== id);
      return {
        restaurant: nextItems.length ? current.restaurant : null,
        cartItems: nextItems,
      };
    });
  };

  const updateQuantity = (id, qty) => {
    const quantity = Math.max(0, Number(qty) || 0);
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    setCart((current) => ({
      ...current,
      cartItems: current.cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  };

  const totals = useMemo(() => calculateCheckout(cart.cartItems), [cart.cartItems]);
  const cartCount = useMemo(
    () => cart.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cart.cartItems]
  );

  const value = {
    cartItems: cart.cartItems,
    restaurant: cart.restaurant,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal: totals.totalAmount,
    cartCount,
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const normalizeItem = (item, quantity, restaurant) => ({
  id: item._id || item.id,
  menuItem: item._id || item.id,
  name: item.name,
  price: Number(item.price || 0),
  image: item.image,
  isVeg: item.isVeg,
  quantity,
  restaurant: restaurant._id,
  restaurantName: restaurant.name,
});

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
