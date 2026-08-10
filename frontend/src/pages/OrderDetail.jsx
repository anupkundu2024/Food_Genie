import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { formatCurrency } from "../utils/checkoutMath";

const steps = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
const labels = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data.order);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder(true);
    const timer = setInterval(() => loadOrder(false), 18000);
    return () => clearInterval(timer);
  }, [id]);

  const canCancel = ["pending", "confirmed"].includes(order?.status);
  const activeIndex = useMemo(() => steps.indexOf(order?.status), [order?.status]);

  const cancelOrder = async () => {
    const confirmed = window.confirm("Cancel this order?");
    if (!confirmed) return;

    setCancelling(true);
    setCancelError("");
    try {
      const res = await api.patch(`/orders/${id}/cancel`);
      setOrder(res.data.data.order);
    } catch (err) {
      setCancelError(err.response?.data?.message || "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-4 py-8 sm:px-6">
        <div className="h-40 rounded-2xl bg-white ring-1 ring-gray-100" />
        <div className="mt-5 h-72 rounded-2xl bg-white ring-1 ring-gray-100" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-black text-gray-900">Order not found</h1>
        <p className="mt-2 text-gray-500">{error}</p>
        <Link to="/orders" className="mt-5 inline-flex min-h-11 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
            {order.restaurant?.name || "Restaurant"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        {canCancel && (
          <button
            onClick={cancelOrder}
            disabled={cancelling}
            className="min-h-11 self-start rounded-full border border-red-200 px-5 py-2 font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>

      {cancelError && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {cancelError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Tracking</h2>
            {order.status === "cancelled" ? (
              <div className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-red-700">
                This order has been cancelled.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-5">
                {steps.map((step, index) => {
                  const done = index <= activeIndex;
                  return (
                    <div key={step} className="flex items-center gap-3 sm:block">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:mx-auto ${
                          done ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p
                        className={`text-sm font-semibold sm:mt-2 sm:text-center ${
                          done ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {labels[step]}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Items</h2>
            <div className="mt-4 divide-y">
              {order.items?.map((item) => (
                <div key={item.menuItem?._id || item.name} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row">
                  <img
                    src={item.menuItem?.image || "https://placehold.co/120x100/fed7aa/9a3412?text=Food"}
                    alt={item.name}
                    className="h-36 w-full rounded-xl object-cover sm:h-20 sm:w-24"
                  />
                  <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Bill Details</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST and taxes</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Payment: {order.paymentStatus}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {order.deliveryAddress?.street}
              <br />
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
              <br />
              {order.deliveryAddress?.pincode}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
