// routes/orderRoutes.js
// Order routes mounted at /api/orders.

const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Private: customer places an order.
router.post("/", protect, authorizeRoles("customer"), createOrder);

// Private: customer's own order history.
// NOTE: static paths declared before "/:id" so they aren't captured as ids.
router.get("/my", protect, authorizeRoles("customer"), getMyOrders);

// Private: orders placed to the logged-in restaurant.
router.get(
  "/restaurant",
  protect,
  authorizeRoles("restaurant"),
  getRestaurantOrders
);

// Private: single order (access decided per-role inside the controller).
router.get("/:id", protect, getOrderById);

// Private: restaurant/admin updates status.
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("restaurant", "admin"),
  updateOrderStatus
);

// Private: customer cancels their order.
router.patch("/:id/cancel", protect, authorizeRoles("customer"), cancelOrder);

module.exports = router;
