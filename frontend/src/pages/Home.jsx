import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import RestaurantCard from "../components/RestaurantCard";
import {
  filterRestaurants,
  getCuisineIcon,
  getCuisineOptions,
  getTopRatedRestaurants,
} from "../utils/restaurantFilters";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80";

function RestaurantCardSkeleton({ large = false }) {
  return (
    <div
      className={`flex animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100/60 ${
        large ? "min-w-[280px] sm:min-w-[340px]" : ""
      }`}
    >
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-orange-100 to-rose-100" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-orange-100" />
          <div className="h-6 w-16 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

function ViewAllLink({ to }) {
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-1 text-sm font-black text-orange-600 transition hover:text-orange-700 hover:underline"
    >
      View All <span aria-hidden="true">→</span>
    </Link>
  );
}

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await api.get("/restaurants");
        if (!ignore) setRestaurants(res.data.data.restaurants || []);
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Could not load restaurants.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const cuisines = useMemo(() => getCuisineOptions(restaurants), [restaurants]);

  const filtered = useMemo(() => {
    return filterRestaurants(restaurants, { search, cuisine: activeCuisine });
  }, [restaurants, search, activeCuisine]);

  const topRated = useMemo(
    () => getTopRatedRestaurants(filtered, 5),
    [filtered]
  );

  return (
    <div className="overflow-x-hidden">
      <section className="relative overflow-hidden bg-[#8f1d1d]">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/95 via-red-900/80 to-orange-600/55" />
        <div className="absolute -right-8 top-8 hidden h-36 w-36 rounded-full border border-white/15 sm:block" />
        <div className="absolute bottom-8 right-8 hidden rotate-6 rounded-3xl bg-white/10 px-5 py-4 text-5xl shadow-2xl backdrop-blur md:block">
          🍜
        </div>
        <div className="absolute left-5 top-20 hidden rounded-full bg-white/10 px-4 py-3 text-3xl backdrop-blur sm:block">
          🍕
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-50 ring-1 ring-white/20">
              Food Genie delivery
            </p>
            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Discover restaurants near you
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50 sm:text-lg">
              Fresh cravings, quick delivery, and the city&apos;s favorite kitchens
              gathered in one polished little corner.
            </p>

            <div className="mt-7 flex w-full max-w-2xl items-center gap-3 rounded-2xl bg-white p-2 shadow-2xl shadow-red-950/25 ring-1 ring-white/70 sm:rounded-full">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl text-orange-600">
                🔎
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for biryani, pizza, burgers..."
                className="min-w-0 flex-1 bg-transparent py-3 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400 sm:text-base"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {cuisines.length > 1 && (
          <section className="mb-8">
            <div className="no-scrollbar -mx-4 flex scroll-smooth gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCuisine(c)}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition duration-200 ${
                    activeCuisine === c
                      ? "border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-200"
                      : "border-orange-100 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-700 hover:shadow-sm"
                  }`}
                >
                  <span>{getCuisineIcon(c)}</span>
                  {c}
                </button>
              ))}
            </div>
          </section>
        )}

        {(loading || topRated.length > 0) && (
          <section className="mb-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
                  Trending
                </p>
                <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
                  Top rated this week
                </h2>
              </div>
              <ViewAllLink to="/restaurants?filter=trending" />
            </div>
            <div className="no-scrollbar -mx-4 flex scroll-smooth gap-5 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <RestaurantCardSkeleton key={i} large />
                  ))
                : topRated.map((r, index) => (
                    <div
                      key={r._id}
                      className="w-[280px] shrink-0 sm:w-[340px]"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <RestaurantCard restaurant={r} featured />
                    </div>
                  ))}
            </div>
          </section>
        )}

        <section>
          <header className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
                Restaurants
              </p>
              <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
                Popular near you
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {!loading && !error && (
                <p className="text-sm font-semibold text-gray-500">
                  {filtered.length} {filtered.length === 1 ? "restaurant" : "restaurants"}
                </p>
              )}
              <ViewAllLink to="/restaurants" />
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-10 text-center font-semibold text-red-600">
              {error}
            </p>
          ) : restaurants.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl bg-white px-4 py-16 text-center shadow-sm ring-1 ring-gray-100">
              <span className="text-6xl">🍽️</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No restaurants yet
              </h3>
              <p className="mt-1 max-w-sm text-gray-500">
                We couldn&apos;t find any restaurants right now. Please check back
                soon.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl bg-white px-4 py-16 text-center shadow-sm ring-1 ring-gray-100">
              <span className="text-6xl">🔍</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {activeCuisine === "All"
                  ? "No matches found"
                  : `No restaurants found for ${activeCuisine}`}
              </h3>
              <p className="mt-1 max-w-sm text-gray-500">
                Try a different restaurant name or cuisine.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((r, index) => (
                <div key={r._id} style={{ animationDelay: `${index * 45}ms` }}>
                  <RestaurantCard restaurant={r} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
