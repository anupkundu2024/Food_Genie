// models/MenuItem.js
// Mongoose model for individual dishes/items on a restaurant's menu.

const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    // The restaurant this item belongs to.
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: { type: String, required: true },

    description: { type: String },

    // Price in the platform's base currency unit.
    price: { type: Number, required: true },

    // Menu section, e.g. "Starters", "Main Course", "Desserts".
    category: { type: String },

    // URL to the dish image.
    image: { type: String },

    // Vegetarian flag (true = veg, false = non-veg).
    isVeg: { type: Boolean, default: true },

    // Whether the item can currently be ordered.
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
