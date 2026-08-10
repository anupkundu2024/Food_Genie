// models/Order.js
// Mongoose model for customer orders placed with a restaurant.

const mongoose = require("mongoose");

// Snapshot of an ordered item. We store name/price at order time so the
// order history stays accurate even if the menu item changes later.
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

// Delivery address captured at the time of ordering.
const deliveryAddressSchema = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Who placed the order.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Which restaurant fulfils it.
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // Line items in the order.
    items: [orderItemSchema],

    // Server-calculated checkout math.
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 40 },
    taxAmount: { type: Number, required: true },

    // Total payable amount for the order.
    totalAmount: { type: Number, required: true },

    // Lifecycle status of the order.
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // Payment lifecycle status.
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Stripe payment intent ID (set once payment is initiated).
    paymentId: { type: String },

    deliveryAddress: deliveryAddressSchema,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
