// routes/menuRoutes.js
// Menu item routes mounted at /api/menu.

const express = require("express");
const router = express.Router();

const {
  addMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require("../controllers/menuController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public: all menu items for a restaurant (supports ?category=&isVeg= filters)
router.get("/:restaurantId", getMenuByRestaurant);

// Private: add a menu item (restaurant role only; ownership checked in controller)
router.post("/", protect, authorizeRoles("restaurant"), addMenuItem);

// Private: update a menu item.
router.put("/:id", protect, authorizeRoles("restaurant"), updateMenuItem);

// Private: quick availability toggle.
router.patch(
  "/:id/availability",
  protect,
  authorizeRoles("restaurant"),
  toggleAvailability
);

// Private: delete a menu item.
router.delete("/:id", protect, authorizeRoles("restaurant"), deleteMenuItem);

module.exports = router;
