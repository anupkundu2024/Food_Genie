// controllers/authController.js
// Handles user registration, login, and fetching the current profile.

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Build a plain user object safe to send back to the client
 * (i.e. without the hashed password).
 */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  address: user.address,
  createdAt: user.createdAt,
});

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Basic presence check for the required fields.
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Reject duplicate emails.
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash the password with 10 salt rounds before storing.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user. Role defaults to "customer" if not provided.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "customer",
    });

    // Issue a JWT for immediate login after registration.
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user), token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate a user and return a token
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Look up the user by email.
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generic message so we don't reveal whether the email exists.
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare the provided password with the stored hash.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user), token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

/**
 * @route  GET /api/auth/me
 * @desc   Get the currently authenticated user's profile
 * @access Private (requires protect middleware)
 */
const getMyProfile = async (req, res) => {
  try {
    // req.user.id is set by the protect middleware.
    // Exclude the password field from the query result.
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching profile",
    });
  }
};

module.exports = { registerUser, loginUser, getMyProfile };
