// models/User.js
// Mongoose model for application users (customers, restaurant owners, admins).

const mongoose = require("mongoose");

// Sub-schema for a single saved address.
// `_id: false` because these are embedded entries, not standalone documents.
const addressSchema = new mongoose.Schema(
  {
    label: { type: String },      // e.g. "Home", "Work"
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    isDefault: { type: Boolean, default: false }, // marks the preferred address
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Unique login identifier.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Stored as a bcrypt hash (hashing handled later in auth logic, not here).
    password: { type: String, required: true },

    phone: { type: String },

    // Determines what the user can do in the app.
    role: {
      type: String,
      enum: ["customer", "restaurant", "admin"],
      default: "customer",
    },

    // A user can save multiple delivery addresses.
    address: [addressSchema],
  },
  {
    // Adds createdAt and updatedAt fields automatically.
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
