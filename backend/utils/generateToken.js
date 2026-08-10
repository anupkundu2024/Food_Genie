// utils/generateToken.js
// Helper to create a signed JWT for an authenticated user.

const jwt = require("jsonwebtoken");

/**
 * Generate a JWT containing the user's id and role.
 *
 * @param {string} userId - The user's MongoDB _id.
 * @param {string} role   - The user's role (customer | restaurant | admin).
 * @returns {string} A signed JWT that expires in 7 days.
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role }, // payload — kept small, no sensitive data
    process.env.JWT_SECRET, // secret from .env
    { expiresIn: "7d" } // token validity
  );
};

module.exports = generateToken;
