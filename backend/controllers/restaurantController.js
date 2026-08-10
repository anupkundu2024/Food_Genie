// controllers/restaurantController.js
// Handles CRUD for restaurant listings and fetching menu items alongside them.

const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

/**
 * @route  POST /api/restaurants
 * @desc   Create a new restaurant listing owned by the logged-in user
 * @access Private (role: "restaurant")
 */
const createRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine, address, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    // The authenticated "restaurant" user becomes the owner.
    const restaurant = await Restaurant.create({
      name,
      description,
      cuisine,
      address,
      image,
      owner: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: { restaurant },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating restaurant",
    });
  }
};

/**
 * @route  GET /api/restaurants
 * @desc   List restaurants with optional cuisine/city/search filters
 * @access Public
 */
const getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, city, search } = req.query;

    // Build the Mongo filter dynamically from the provided query params.
    const filter = {};

    if (cuisine) {
      // cuisine is an array field; match restaurants that include the value.
      filter.cuisine = cuisine;
    }

    if (city) {
      // Case-insensitive match on the embedded address city.
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    if (search) {
      // Case-insensitive partial match on the restaurant name.
      filter.name = { $regex: search, $options: "i" };
    }

    const restaurants = await Restaurant.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { restaurants },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching restaurants",
    });
  }
};

/**
 * @route  GET /api/restaurants/:id
 * @desc   Get a single restaurant's details along with its menu items
 * @access Public
 */
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Fetch the menu separately so the response stays flat and predictable.
    const menu = await MenuItem.find({ restaurant: restaurant._id }).sort({
      category: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      data: { restaurant, menu },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching restaurant",
    });
  }
};

/**
 * @route  PUT /api/restaurants/:id
 * @desc   Update a restaurant (owner or admin only)
 * @access Private (role: "restaurant" owner, or "admin")
 */
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Only the owning restaurant user or an admin may update.
    const isOwner = restaurant.owner?.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not own this restaurant",
      });
    }

    const { name, description, cuisine, address, image, isOpen } = req.body;

    // Only overwrite fields that were actually provided.
    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (cuisine !== undefined) restaurant.cuisine = cuisine;
    if (address !== undefined) restaurant.address = address;
    if (image !== undefined) restaurant.image = image;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;

    const updatedRestaurant = await restaurant.save();

    return res.status(200).json({
      success: true,
      data: { restaurant: updatedRestaurant },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating restaurant",
    });
  }
};

/**
 * @route  DELETE /api/restaurants/:id
 * @desc   Delete a restaurant and all of its menu items (owner or admin only)
 * @access Private (role: "restaurant" owner, or "admin")
 */
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Only the owning restaurant user or an admin may delete.
    const isOwner = restaurant.owner?.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not own this restaurant",
      });
    }

    // Cascade: remove every menu item belonging to this restaurant first.
    await MenuItem.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Restaurant and its menu items deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error deleting restaurant",
    });
  }
};

/**
 * @route  GET /api/restaurants/my
 * @desc   Get the logged-in restaurant user's own restaurant profile
 * @access Private (role: "restaurant")
 */
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "You have not created a restaurant yet",
      });
    }

    return res.status(200).json({
      success: true,
      data: { restaurant },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching your restaurant",
    });
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurant,
};
