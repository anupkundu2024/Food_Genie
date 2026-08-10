// models/Review.js
// Mongoose model for customer reviews of restaurants.

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Reviewer.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Restaurant being reviewed.
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // Optional link to the order that prompted the review.
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    // Star rating from 1 to 5.
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
