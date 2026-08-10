import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const CartLink = ({ compact = false }) => (
    <Link
      to="/cart"
      onClick={closeMenu}
      className={`relative inline-flex min-h-11 items-center rounded-full font-bold text-gray-700 hover:text-orange-600 ${
        compact ? "px-3" : "px-2"
      }`}
      aria-label="Cart"
    >
      <span className="text-xl">🛒</span>
      {!compact && <span className="ml-1">Cart</span>}
      {cartCount > 0 && (
        <span className="absolute -right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-black text-white">
          {cartCount}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 text-xl font-black"
          onClick={closeMenu}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-sm text-white">
            FG
          </span>
          <span className="truncate text-orange-600">Food Genie</span>
        </Link>

        <div className="hidden items-center gap-3 text-sm font-bold text-gray-700 md:flex">
          <Link to="/" className="rounded-full px-3 py-2 hover:text-orange-600">
            Home
          </Link>
          <CartLink />
          <Link to="/orders" className="rounded-full px-3 py-2 hover:text-orange-600">
            Orders
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="max-w-40 truncate text-gray-500">
                Hi, <span className="font-black text-gray-800">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="min-h-11 rounded-full border border-orange-600 px-4 text-orange-600 transition hover:bg-orange-600 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="min-h-11 rounded-full px-4 py-3 text-orange-600 hover:bg-orange-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="min-h-11 rounded-full bg-orange-600 px-4 py-3 text-white transition hover:bg-orange-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <CartLink compact />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-100 text-2xl font-black text-gray-800"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm font-bold text-gray-700">
            {user && (
              <p className="mb-2 truncate rounded-2xl bg-orange-50 px-4 py-3 text-gray-600">
                Hi, <span className="text-gray-900">{user.name}</span>
              </p>
            )}
            <Link onClick={closeMenu} to="/" className="min-h-11 rounded-xl px-4 py-3 hover:bg-orange-50">
              Home
            </Link>
            <Link onClick={closeMenu} to="/orders" className="min-h-11 rounded-xl px-4 py-3 hover:bg-orange-50">
              Orders
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="min-h-11 rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  onClick={closeMenu}
                  to="/login"
                  className="min-h-11 rounded-full border border-orange-200 px-4 py-3 text-center text-orange-700"
                >
                  Login
                </Link>
                <Link
                  onClick={closeMenu}
                  to="/register"
                  className="min-h-11 rounded-full bg-orange-600 px-4 py-3 text-center text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
