// models/Restaurant.js
// Mongoose model for restaurants listed on the platform.

const mongoose = require("mongoose");

// Embedded address for the restaurant's physical location.
const addressSchema = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Reference to the User (role: "restaurant") who owns this listing.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    description: { type: String },

    // e.g. ["Indian", "Chinese", "Italian"]
    cuisine: [{ type: String }],

    address: addressSchema,

    // URL to the restaurant's cover/logo image.
    image: { type: String },

    // Average rating, updated as reviews come in.
    rating: { type: Number, default: 0 },

    // Whether the restaurant is currently accepting orders.
    isOpen: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
