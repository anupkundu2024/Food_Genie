// routes/paymentRoutes.js
// Payment routes mounted at /api/payments.

const express = require("express");
const router = express.Router();

const { createPaymentIntent } = require("../controllers/paymentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post(
  "/create-intent",
  protect,
  authorizeRoles("customer"),
  createPaymentIntent
);

module.exports = router;
