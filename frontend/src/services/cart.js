// services/cart.js
// Lightweight localStorage-backed cart used until the full CartContext + Cart
// page are built in the next step. Keeping the shape simple and centralized
// here means the Navbar badge and "Add to Cart" buttons work today and can be
// swapped for a proper context later without touching component call sites.

const CART_KEY = "cart";

// Custom event name so any component (e.g. the Navbar badge) can react to
// changes made from anywhere in the app.
export const CART_EVENT = "cart-updated";

// Read the raw cart array from localStorage (defensively parsed).
export const getCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Total number of items in the cart (sum of quantities).
export const getCartCount = () =>
  getCart().reduce((sum, line) => sum + (line.quantity || 0), 0);

const persist = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Notify listeners (badge, etc.) in the current tab.
  window.dispatchEvent(new Event(CART_EVENT));
};

/**
 * Add a menu item to the cart. If the same item (from the same restaurant) is
 * already present, its quantity is incremented.
 * @param {object} menuItem - a MenuItem document from the API
 * @param {string} restaurantId - the restaurant the item belongs to
 */
export const addToCart = (menuItem, restaurantId) => {
  const cart = getCart();
  const existing = cart.find((line) => line.menuItem === menuItem._id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      restaurant: restaurantId,
      quantity: 1,
    });
  }

  persist(cart);
};

// Clear the entire cart (used after checkout later).
export const clearCart = () => persist([]);
