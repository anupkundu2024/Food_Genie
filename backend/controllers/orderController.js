// controllers/orderController.js
// Handles order creation and lifecycle. Prices and totals are always computed
// server-side from the database — never trusted from the client payload.

const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

/**
 * Allowed order status transitions. A status may only move to one of the
 * values listed for its current state. Terminal states map to an empty array.
 */
const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// Helper: true if the string is a valid Mongo ObjectId.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @route  POST /api/orders
 * @desc   Create an order from a validated cart payload
 * @access Private (role: "customer")
 */
const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    // Validate the incoming shape.
    if (!restaurantId || !isValidId(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "A valid restaurantId is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Restaurant must exist.
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Build validated line items using DB prices, and compute totals.
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { menuItem: menuItemId, quantity } = item;

      if (!menuItemId || !isValidId(menuItemId)) {
        return res.status(400).json({
          success: false,
          message: "Each item requires a valid menuItem id",
        });
      }

      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "Each item requires a quantity of at least 1",
        });
      }

      const menuItem = await MenuItem.findById(menuItemId);

      // Must exist and belong to the same restaurant as the order.
      if (!menuItem || menuItem.restaurant.toString() !== restaurantId) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${menuItemId} not found for this restaurant`,
        });
      }

      // Reject items that are currently unavailable.
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `"${menuItem.name}" is currently unavailable`,
        });
      }

      // Snapshot name/price at order time; trust the DB price only.
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
      });

      subtotal += menuItem.price * qty;
    }

    const taxAmount = Math.round(subtotal * TAX_RATE);
    const totalAmount = subtotal + DELIVERY_FEE + taxAmount;

    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      taxAmount,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
      deliveryAddress,
    });

    return res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating order",
    });
  }
};

/**
 * @route  GET /api/orders/my
 * @desc   Get the logged-in customer's order history (newest first)
 * @access Private (role: "customer")
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("restaurant", "name image");

    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching orders",
    });
  }
};

/**
 * @route  GET /api/orders/restaurant
 * @desc   Get all orders placed to the logged-in user's restaurant (newest first)
 * @access Private (role: "restaurant")
 */
const getRestaurantOrders = async (req, res) => {
  try {
    // Find the restaurant owned by this user.
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "You have not created a restaurant yet",
      });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .populate("user", "name phone");

    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching restaurant orders",
    });
  }
};

/**
 * @route  GET /api/orders/:id
 * @desc   View a single order. Access depends on role/ownership:
 *         - customer: only their own orders
 *         - restaurant: only orders placed to their restaurant
 *         - admin: any order
 * @access Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await Order.findById(id)
      .populate("restaurant", "name image owner")
      .populate("user", "name phone")
      .populate("items.menuItem", "name image isVeg category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Determine whether the requester is allowed to see this order.
    const { id: userId, role } = req.user;
    let allowed = false;

    if (role === "admin") {
      allowed = true;
    } else if (role === "customer") {
      // order.user may be populated; compare against its _id.
      allowed = order.user?._id?.toString() === userId;
    } else if (role === "restaurant") {
      // order.restaurant is populated with its owner field.
      allowed = order.restaurant?.owner?.toString() === userId;
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you cannot view this order",
      });
    }

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching order",
    });
  }
};

/**
 * @route  PATCH /api/orders/:id/status
 * @desc   Update an order's status (owning restaurant or admin only).
 *         Enforces the allowed-transitions map.
 * @access Private (role: "restaurant", "admin")
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const { status } = req.body;

    // Status must be a known enum value.
    if (!status || !STATUS_TRANSITIONS.hasOwnProperty(status)) {
      return res.status(400).json({
        success: false,
        message: "A valid status value is required",
      });
    }

    const order = await Order.findById(id).populate("restaurant", "owner");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only the owning restaurant or an admin may change the status.
    const isOwner = order.restaurant?.owner?.toString() === req.user.id;
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you cannot update this order",
      });
    }

    // Enforce a logical progression between states.
    const allowedNext = STATUS_TRANSITIONS[order.status] || [];
    if (order.status === status) {
      return res.status(400).json({
        success: false,
        message: `Order is already "${status}"`,
      });
    }
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${order.status}" to "${status}"`,
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating order status",
    });
  }
};

/**
 * @route  PATCH /api/orders/:id/cancel
 * @desc   Customer cancels their own order (only while pending/confirmed)
 * @access Private (role: "customer")
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Customers may only cancel their own orders.
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: this is not your order",
      });
    }

    // Cancellation is only allowed early in the lifecycle.
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is "${order.status}"`,
      });
    }

    order.status = "cancelled";
    if (order.paymentStatus === "pending") {
      order.paymentStatus = "failed";
    }
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error cancelling order",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
