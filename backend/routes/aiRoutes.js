// routes/aiRoutes.js
// AI feature routes mounted at /api/ai.

const express = require("express");
const router = express.Router();

const {
  getRecommendations,
  chatWithAssistant,
} = require("../controllers/aiController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Private: personalized recommendations for the logged-in customer.
// Optional query param: ?restaurantId= to scope suggestions to one restaurant.
router.get(
  "/recommendations",
  protect,
  authorizeRoles("customer"),
  getRecommendations
);

// Private: conversational food assistant.
router.post("/chat", protect, authorizeRoles("customer"), chatWithAssistant);

module.exports = router;
