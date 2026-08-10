import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard";
import api from "../services/api";
import {
  filterRestaurants,
  getCuisineIcon,
  getCuisineOptions,
  getTopRatedRestaurants,
} from "../utils/restaurantFilters";

function RestaurantCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100/60">
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-orange-100 to-rose-100" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
        <div className="h-6 w-20 rounded-full bg-orange-100" />
      </div>
    </div>
  );
}

export default function AllRestaurants() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("filter") === "trending" ? "trending" : "all";
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

  const visibleRestaurants = useMemo(() => {
    const filtered = filterRestaurants(restaurants, { search, cuisine: activeCuisine });
    return mode === "trending" ? getTopRatedRestaurants(filtered) : filtered;
  }, [activeCuisine, mode, restaurants, search]);

  const title = mode === "trending" ? "Top rated restaurants" : "All restaurants";
  const eyebrow = mode === "trending" ? "Trending" : "Restaurants";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/"
            className="mb-4 inline-flex text-sm font-black text-orange-600 hover:text-orange-700 hover:underline"
          >
            ← Back home
          </Link>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">
            {title}
          </h1>
          {!loading && !error && (
            <p className="mt-1 text-sm font-semibold text-gray-500">
              {visibleRestaurants.length}{" "}
              {visibleRestaurants.length === 1 ? "restaurant" : "restaurants"}
            </p>
          )}
        </div>

        <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-orange-100 sm:rounded-full">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            {"\u{1F50E}"}
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants..."
            className="min-w-0 flex-1 bg-transparent py-2 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

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
      ) : visibleRestaurants.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-4 py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-6xl">{"\u{1F50D}"}</span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            {activeCuisine === "All"
              ? "No matches found"
              : `No restaurants found for ${activeCuisine}`}
          </h2>
          <p className="mt-1 max-w-sm text-gray-500">
            Try a different restaurant name or cuisine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleRestaurants.map((restaurant, index) => (
            <div key={restaurant._id} style={{ animationDelay: `${index * 45}ms` }}>
              <RestaurantCard restaurant={restaurant} featured={mode === "trending"} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
