// routes/restaurantRoutes.js
// Restaurant routes mounted at /api/restaurants.

const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurant,
} = require("../controllers/restaurantController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public: list all restaurants (supports ?cuisine=&city=&search= filters)
router.get("/", getAllRestaurants);

// Private: the logged-in restaurant user's own profile.
// NOTE: declared before "/:id" so "my" isn't captured as an id param.
router.get("/my", protect, authorizeRoles("restaurant"), getMyRestaurant);

// Public: single restaurant details + its menu.
router.get("/:id", getRestaurantById);

// Private: create a restaurant (restaurant role only).
router.post("/", protect, authorizeRoles("restaurant"), createRestaurant);

// Private: update / delete (owner or admin — ownership checked in controller).
router.put(
  "/:id",
  protect,
  authorizeRoles("restaurant", "admin"),
  updateRestaurant
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("restaurant", "admin"),
  deleteRestaurant
);

module.exports = router;
