import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { formatCurrency } from "../utils/checkoutMath";

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const activeStatuses = ["pending", "confirmed", "preparing", "out_for_delivery"];

const badgeClass = (status) => {
  if (status === "delivered") return "bg-green-50 text-green-700 ring-green-100";
  if (status === "cancelled") return "bg-red-50 text-red-700 ring-red-100";
  return "bg-orange-50 text-orange-700 ring-orange-100";
};

const prettyStatus = (status = "") => status.replaceAll("_", " ");

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let ignore = false;
    const loadOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        if (!ignore) setOrders(res.data.data.orders || []);
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Could not load orders.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadOrders();
    return () => {
      ignore = true;
    };
  }, []);

  const visibleOrders = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") return orders.filter((order) => activeStatuses.includes(order.status));
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Orders
        </p>
        <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">Your order history</h1>
        {location.state?.message && (
          <p className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {location.state.message}
          </p>
        )}
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              filter === tab.id
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-100 hover:text-orange-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl bg-white ring-1 ring-gray-100" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="rounded-2xl bg-red-50 p-5 font-semibold text-red-600">{error}</p>
      )}

      {!loading && !error && visibleOrders.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900">No orders here yet</h2>
          <p className="mt-2 text-gray-500">Your next Food Genie order will show up here.</p>
          <Link to="/" className="mt-5 inline-flex rounded-full bg-orange-600 px-6 py-3 font-semibold text-white">
            Browse Restaurants
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {visibleOrders.map((order) => (
          <article key={order._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={order.restaurant?.image || "https://placehold.co/160x120/fed7aa/9a3412?text=Food"}
                alt={order.restaurant?.name || "Restaurant"}
                className="h-36 w-full rounded-xl object-cover sm:h-28 sm:w-36"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {order.restaurant?.name || "Restaurant"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${badgeClass(order.status)}`}>
                    {prettyStatus(order.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {order.items?.slice(0, 2).map((item) => `${item.quantity} x ${item.name}`).join(", ")}
                  {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ""}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="min-h-11 rounded-full border border-orange-200 px-4 py-3 text-center text-sm font-bold text-orange-700 hover:bg-orange-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
