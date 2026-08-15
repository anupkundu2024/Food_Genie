// server.js
// Entry point for the Food Genie backend API.

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");

const { handleStripeWebhook } = require("./controllers/paymentController");

// Create Express app
const app = express();

// CORS
app.use(cors());

// Stripe webhook must come before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

// JSON parser
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);

// Render provides PORT automatically
const PORT = process.env.PORT || 5000;

// Connect MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
