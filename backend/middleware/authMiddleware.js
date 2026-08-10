// middleware/authMiddleware.js
// Authentication (protect) and authorization (authorizeRoles) middleware.

const jwt = require("jsonwebtoken");

/**
 * protect
 * Verifies the JWT sent in the Authorization header:
 *   Authorization: Bearer <token>
 * On success, attaches { id, role } to req.user and calls next().
 * On failure, responds with 401.
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Header must exist and start with "Bearer ".
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // Extract the token part after "Bearer ".
    const token = authHeader.split(" ")[1];

    // Verify signature + expiry. Throws if invalid/expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make the decoded payload available to downstream handlers.
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

/**
 * authorizeRoles(...roles)
 * Returns a middleware that only allows users whose role is in the
 * provided list. Must be used AFTER protect (needs req.user).
 *
 * Example: router.get("/admin", protect, authorizeRoles("admin"), handler)
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
