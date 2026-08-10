// routes/health.routes.js
// A simple health-check route used to confirm the API is running
// and reachable from the frontend.

const express = require("express");
const router = express.Router();

// GET /api/health -> { status: "ok" }
router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;
