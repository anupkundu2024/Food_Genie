import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://placehold.co/600x450/fed7aa/9a3412?text=Food+Genie";

export default function RestaurantCard({ restaurant, featured = false }) {
  const { _id, name, cuisine = [], rating, image, isOpen } = restaurant;
  const deliveryTime = featured ? "20-25 min" : "25-30 min";

  return (
    <Link
      to={`/restaurant/${_id}`}
      className="fade-in-card group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-orange-50">
        <img
          src={image || FALLBACK_IMAGE}
          alt={name}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
        {Number(rating) > 0 && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-black text-gray-900 shadow-sm backdrop-blur">
            <span className="text-amber-500">{"\u2605"}</span>
            {Number(rating).toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-black leading-snug text-gray-950 line-clamp-1">
          {name}
        </h3>

        {cuisine.length > 0 && (
          <p className="mt-1 text-sm font-medium text-gray-500 line-clamp-1">
            {cuisine.slice(0, 3).join(" \u2022 ")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">
            {deliveryTime}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-gray-600">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isOpen ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>
    </Link>
  );
}
