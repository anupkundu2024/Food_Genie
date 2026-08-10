// server.js
// Entry point for the Food Genie backend API.

// 1. Load environment variables from .env as early as possible.
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

// 3. Create the Express app.
const app = express();

// 4. Global middleware.
app.use(cors()); // Allow cross-origin requests from the React frontend.

// Stripe needs the raw body to verify webhook signatures, so this route is
// mounted before the JSON parser.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json()); // Parse incoming JSON request bodies.

// 5. Routes.
app.use("/api/health", healthRoutes); // Health check
app.use("/api/auth", authRoutes); // Authentication (register, login, me)
app.use("/api/restaurants", restaurantRoutes); // Restaurant CRUD
app.use("/api/menu", menuRoutes); // Menu item CRUD
app.use("/api/orders", orderRoutes); // Order lifecycle
app.use("/api/payments", paymentRoutes); // Stripe payment intents
app.use("/api/ai", aiRoutes); // AI recommendations + chat assistant

// 6. Connect to MongoDB, then start the server.
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.error(
      "❌ Server startup aborted because MongoDB connection failed.",
    );
    process.exit(1);
  });
