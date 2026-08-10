// routes/authRoutes.js
// Authentication routes mounted at /api/auth.

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser); // POST /api/auth/register
router.post("/login", loginUser);       // POST /api/auth/login

// Private route — requires a valid JWT
router.get("/me", protect, getMyProfile); // GET /api/auth/me

module.exports = router;
