import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/checkoutMath";

const FALLBACK_IMAGE =
  "https://placehold.co/1200x500/fed7aa/9a3412?text=Food+Genie";

export default function RestaurantDetail() {
  const { id } = useParams();
  const { cartItems, totals } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const load = async () => {
      try {
        const res = await api.get(`/restaurants/${id}`);
        if (!ignore) {
          setRestaurant(res.data.data.restaurant);
          setMenu(res.data.data.menu || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Could not load this restaurant.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const item of menu) {
      const key = item.category?.trim() || "Other";
      (groups[key] = groups[key] || []).push(item);
    }
    return groups;
  }, [menu]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="h-48 w-full bg-gray-200 sm:h-64" />
          <div className="space-y-3 p-5">
            <div className="h-7 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white ring-1 ring-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <p className="px-4 py-20 text-center font-semibold text-red-600">
        {error || "Restaurant not found."}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 md:pb-8">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="h-48 w-full bg-gray-100 sm:h-64">
          <img
            src={restaurant.image || FALLBACK_IMAGE}
            alt={restaurant.name}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="mt-1 text-sm leading-6 text-gray-500 sm:text-base">
                  {restaurant.description}
                </p>
              )}
            </div>
            {restaurant.rating > 0 && (
              <span className="flex shrink-0 items-center gap-1 self-start rounded-full bg-green-600 px-3 py-1 text-sm font-black text-white">
                ★ {restaurant.rating.toFixed(1)}
              </span>
            )}
          </div>

          {restaurant.cuisine?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {restaurant.cuisine.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-black text-gray-900 sm:text-2xl">Menu</h2>

      {menu.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-12 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-5xl">🍴</span>
          <p className="mt-3 text-gray-500">
            This restaurant hasn&apos;t added any menu items yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
                {category}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <MenuItemCard
                    key={item._id}
                    menuItem={{
                      ...item,
                      restaurantId: id,
                      restaurantName: restaurant.name,
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-orange-100 bg-white/95 p-4 shadow-2xl backdrop-blur md:hidden">
          <Link
            to="/cart"
            className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200"
          >
            <span>{cartItems.length} items</span>
            <span>View Cart • {formatCurrency(totals.totalAmount)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
