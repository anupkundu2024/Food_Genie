export const cuisineIcons = {
  All: "\u2728",
  Pizza: "\u{1F355}",
  Chinese: "\u{1F35C}",
  Indian: "\u{1F35B}",
  Mexican: "\u{1F32E}",
  Desserts: "\u{1F370}",
  Italian: "\u{1F35D}",
  Thai: "\u{1F372}",
  Burger: "\u{1F354}",
  Burgers: "\u{1F354}",
  "Fast Food": "\u{1F35F}",
  FastFood: "\u{1F35F}",
  Continental: "\u{1F957}",
  American: "\u{1F354}",
  Asian: "\u{1F35C}",
  Bakery: "\u{1F950}",
  Bengali: "\u{1F35A}",
  Cafe: "\u2615",
  "South Indian": "\u{1F95E}",
  Vegetarian: "\u{1F966}",
  Seafood: "\u{1F364}",
};

export const getCuisineIcon = (cuisine) => cuisineIcons[cuisine] || "\u{1F37D}\uFE0F";

export const normalizeCuisine = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

export const restaurantMatchesCuisine = (restaurant, cuisine) => {
  if (!cuisine || normalizeCuisine(cuisine) === "all") return true;
  const selected = normalizeCuisine(cuisine);
  return (restaurant.cuisine || []).some((item) => normalizeCuisine(item) === selected);
};

export const filterRestaurants = (restaurants, { search = "", cuisine = "All" } = {}) => {
  const term = search.trim().toLowerCase();
  return restaurants.filter((restaurant) => {
    const matchesName =
      !term || String(restaurant.name || "").toLowerCase().includes(term);
    return matchesName && restaurantMatchesCuisine(restaurant, cuisine);
  });
};

export const getCuisineOptions = (restaurants) => {
  const byNormalized = new Map();
  restaurants.forEach((restaurant) => {
    (restaurant.cuisine || []).forEach((cuisine) => {
      const trimmed = String(cuisine).trim();
      if (!trimmed) return;
      const key = normalizeCuisine(trimmed);
      if (!byNormalized.has(key)) byNormalized.set(key, trimmed);
    });
  });
  return ["All", ...[...byNormalized.values()].sort((a, b) => a.localeCompare(b))];
};

export const getTopRatedRestaurants = (restaurants, limit) => {
  const sorted = [...restaurants]
    .filter((restaurant) => Number(restaurant.rating) > 0)
    .sort((a, b) => Number(b.rating) - Number(a.rating));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
};
