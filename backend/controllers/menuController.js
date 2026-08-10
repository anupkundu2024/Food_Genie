// controllers/menuController.js
// Handles CRUD for menu items, guarded by restaurant ownership checks.

const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

/**
 * Helper: confirm that the given restaurant exists and is owned by the user.
 * Returns { restaurant } on success, or { error: { status, message } }.
 */
const verifyOwnership = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return { error: { status: 404, message: "Restaurant not found" } };
  }

  if (restaurant.owner?.toString() !== userId) {
    return {
      error: { status: 403, message: "Forbidden: you do not own this restaurant" },
    };
  }

  return { restaurant };
};

/**
 * @route  POST /api/menu
 * @desc   Add a menu item to a restaurant the user owns
 * @access Private (role: "restaurant")
 */
const addMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, description, price, category, image, isVeg } =
      req.body;

    if (!restaurantId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, name, and price are required",
      });
    }

    // Only the owner of the target restaurant may add items to it.
    const { restaurant, error } = await verifyOwnership(
      restaurantId,
      req.user.id
    );
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const menuItem = await MenuItem.create({
      restaurant: restaurant._id,
      name,
      description,
      price,
      category,
      image,
      isVeg,
    });

    return res.status(201).json({
      success: true,
      data: { menuItem },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error adding menu item",
    });
  }
};

/**
 * @route  GET /api/menu/:restaurantId
 * @desc   List a restaurant's menu items, optionally filtered by category/isVeg
 * @access Public
 */
const getMenuByRestaurant = async (req, res) => {
  try {
    const { category, isVeg } = req.query;

    // Restaurant is always part of the filter; category/isVeg are optional.
    const filter = { restaurant: req.params.restaurantId };

    if (category) {
      filter.category = category;
    }

    if (isVeg !== undefined) {
      // Query params arrive as strings; coerce to a real boolean.
      filter.isVeg = isVeg === "true";
    }

    const menu = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    return res.status(200).json({
      success: true,
      data: { menu },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching menu",
    });
  }
};

/**
 * @route  PUT /api/menu/:id
 * @desc   Update a menu item (owning restaurant only)
 * @access Private (role: "restaurant")
 */
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Confirm the user owns the restaurant this item belongs to.
    const { error } = await verifyOwnership(menuItem.restaurant, req.user.id);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const { name, description, price, category, image, isVeg, isAvailable } =
      req.body;

    // Only overwrite fields that were actually provided.
    if (name !== undefined) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = price;
    if (category !== undefined) menuItem.category = category;
    if (image !== undefined) menuItem.image = image;
    if (isVeg !== undefined) menuItem.isVeg = isVeg;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    const updatedItem = await menuItem.save();

    return res.status(200).json({
      success: true,
      data: { menuItem: updatedItem },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating menu item",
    });
  }
};

/**
 * @route  DELETE /api/menu/:id
 * @desc   Delete a menu item (owning restaurant only)
 * @access Private (role: "restaurant")
 */
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const { error } = await verifyOwnership(menuItem.restaurant, req.user.id);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    await menuItem.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Menu item deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error deleting menu item",
    });
  }
};

/**
 * @route  PATCH /api/menu/:id/availability
 * @desc   Flip a menu item's isAvailable flag (owning restaurant only)
 * @access Private (role: "restaurant")
 */
const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const { error } = await verifyOwnership(menuItem.restaurant, req.user.id);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    // Simple toggle of the current availability state.
    menuItem.isAvailable = !menuItem.isAvailable;
    const updatedItem = await menuItem.save();

    return res.status(200).json({
      success: true,
      data: { menuItem: updatedItem },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error toggling availability",
    });
  }
};

module.exports = {
  addMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
