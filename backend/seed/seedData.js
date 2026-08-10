// seed/seedData.js
// Standalone database seeding script for Food Genie.
//
//   Run with:  npm run seed        (from the backend/ folder)
//         or:  node seed/seedData.js
//
// What it does:
//   1. Connects to MongoDB using MONGO_URI from .env (via config/db.js, which
//      also applies the public-DNS fix needed for the mongodb+srv:// lookup).
//   2. Clears ONLY the Restaurant and MenuItem collections (Users and Orders
//      are left untouched).
//   3. Ensures a single "restaurant" role user exists to own all listings.
//   4. Inserts a set of realistic Kolkata-based restaurants, each with its own
//      menu of dishes (real Unsplash food photography).
//   5. Prints a summary and disconnects.
//
// This is demo/seed data only — it does not touch auth, payment, or any
// business logic.

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

// The single owner account all seeded restaurants are attached to.
const SEED_OWNER = {
  name: "Food Genie Demo Owner",
  email: "seedowner@foodgenie.com",
  password: "seed1234", // hashed before insert
  role: "restaurant",
};

// ---------------------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------------------
// Real Unsplash food photography. We append consistent sizing params so every
// image loads cropped and optimized. The frontend also has an onError fallback,
// so any occasional miss degrades gracefully.
const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

// A pool of cuisine-appropriate dish photos to draw from when building menus.
const DISH = {
  biryani: img("1563379091339-03b21ab4a4f8"),
  curry: img("1585937421612-70a008356fbe"),
  butterChicken: img("1588166524941-3bf61a9c41db"),
  tandoori: img("1599487488170-d11ec9c172f0"),
  naan: img("1601050690597-df0568f70950"),
  paneer: img("1631452180519-c014fe946bc7"),
  samosa: img("1601050690117-94f5f6fa8bd7"),
  thali: img("1567188040759-fb8a883dc6d8"),

  pizza: img("1513104890138-7c749659a591"),
  pasta: img("1621996346565-e3dbc646d9a9"),
  lasagna: img("1574894709920-11b28e7367e3"),
  risotto: img("1476124369491-e7addf5db371"),
  bruschetta: img("1572695157366-5e585ab2b69f"),
  tiramisu: img("1571877227200-a0d98ea607e9"),

  noodles: img("1585032226651-759b368d7246"),
  friedRice: img("1603133872878-684f208fb84b"),
  dumplings: img("1496116218417-1a781b1c416c"),
  springRoll: img("1544025162-d76694265947"),
  manchurian: img("1626074353765-517a681e40be"),
  hotAndSour: img("1547592166-23ac45744acd"),

  tacos: img("1565299624946-b28f40a0ae38"),
  burrito: img("1626700051175-6818013e1d4f"),
  nachos: img("1513456852971-30c0b8199d4d"),
  quesadilla: img("1618040996337-56904b7850b9"),

  burger: img("1568901346375-23c9450c58cd"),
  fries: img("1573080496219-bb080dd4f877"),
  hotdog: img("1599599810769-bcde5a160d32"),
  wrap: img("1626700051175-6818013e1d4f"),
  wings: img("1608039755401-742074f0548d"),

  cake: img("1578985545062-69928b1d9587"),
  brownie: img("1606313564200-e75d5e30476c"),
  iceCream: img("1563805042-7684c019e1cb"),
  donut: img("1551024601-bec78aea704b"),
  cheesecake: img("1533134242443-d4fd215305ad"),

  dosa: img("1630383249896-424e482df921"),
  idli: img("1589301760014-d929f3979dbc"),
  vada: img("1668236543090-82eba5ee5976"),
  uttapam: img("1668236543090-82eba5ee5976"),

  fishCurry: img("1626777552726-4a6b54c97e46"),
  roshogolla: img("1666190092159-3171cf0fbb12"),
  mishtiDoi: img("1589308078059-be1415eab4c3"),
  kosha: img("1606491956689-2ea866880c84"),

  momo: img("1534422298391-e4f8c172dddb"),
  thukpa: img("1547592166-23ac45744acd"),

  cola: img("1554866585-cd94860890b7"),
  lassi: img("1626200419199-391ae4be7a41"),
  coffee: img("1509042239860-f550ce710b93"),
  juice: img("1600271886742-f049cd451bba"),
};

// Restaurant cover images.
const COVER = {
  spiceRoute: img("1517248135467-4c7edcad34c4"),
  bellaNapoli: img("1552566626-52f8b828add9"),
  dragonWok: img("1552611052-33e04de081de"),
  elMexicano: img("1414235077428-338989a2e8c0"),
  burgerBarn: img("1550547660-d9450f859349"),
  sweetSymphony: img("1567620905732-2d1ec7ab7445"),
  dosaDelight: img("1630383249896-424e482df921"),
  banglarRannaghar: img("1606491956689-2ea866880c84"),
  momoMagic: img("1607330289024-1535c6b4e1c1"),
  theGrandThali: img("1567188040759-fb8a883dc6d8"),
};

// ---------------------------------------------------------------------------
// Seed data: restaurants + their menus
// ---------------------------------------------------------------------------
const RESTAURANTS = [
  {
    name: "Spice Route",
    description:
      "Aromatic North Indian classics — rich curries, sizzling tandoor and fresh-baked naan.",
    cuisine: ["Indian", "North Indian", "Tandoori"],
    image: COVER.spiceRoute,
    rating: 4.6,
    address: {
      street: "12 Park Street",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700016",
    },
    menu: [
      { name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken and saffron.", price: 249, category: "Main Course", image: DISH.biryani, isVeg: false },
      { name: "Butter Chicken", description: "Tandoori chicken simmered in a silky tomato-butter gravy.", price: 289, category: "Main Course", image: DISH.butterChicken, isVeg: false },
      { name: "Paneer Tikka Masala", description: "Chargrilled paneer in a creamy onion-tomato masala.", price: 229, category: "Main Course", image: DISH.paneer, isVeg: true },
      { name: "Tandoori Chicken (Half)", description: "Yogurt-and-spice marinated chicken from the clay oven.", price: 269, category: "Starters", image: DISH.tandoori, isVeg: false },
      { name: "Veg Samosa (2 pcs)", description: "Crisp pastry stuffed with spiced potato and peas.", price: 99, category: "Starters", image: DISH.samosa, isVeg: true },
      { name: "Garlic Naan", description: "Soft tandoor-baked flatbread brushed with garlic butter.", price: 69, category: "Main Course", image: DISH.naan, isVeg: true },
      { name: "Sweet Lassi", description: "Chilled churned yogurt drink, lightly sweetened.", price: 89, category: "Beverages", image: DISH.lassi, isVeg: true },
      { name: "Gulab Jamun (2 pcs)", description: "Warm milk dumplings soaked in rose-cardamom syrup.", price: 109, category: "Desserts", image: DISH.roshogolla, isVeg: true },
    ],
  },
  {
    name: "Bella Napoli",
    description:
      "Wood-fired Neapolitan pizzas and hand-rolled pasta, straight from the heart of Italy.",
    cuisine: ["Italian", "Pizza", "Continental"],
    image: COVER.bellaNapoli,
    rating: 4.8,
    address: {
      street: "45 Camac Street",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700017",
    },
    menu: [
      { name: "Margherita Pizza", description: "San Marzano tomato, fresh mozzarella and basil.", price: 299, category: "Main Course", image: DISH.pizza, isVeg: true },
      { name: "Spaghetti Carbonara", description: "Classic Roman pasta with egg, pecorino and pancetta.", price: 329, category: "Main Course", image: DISH.pasta, isVeg: false },
      { name: "Chicken Lasagna", description: "Layered pasta baked with béchamel and chicken ragù.", price: 349, category: "Main Course", image: DISH.lasagna, isVeg: false },
      { name: "Mushroom Risotto", description: "Creamy arborio rice with porcini and parmesan.", price: 319, category: "Main Course", image: DISH.risotto, isVeg: true },
      { name: "Bruschetta (4 pcs)", description: "Toasted sourdough topped with tomato, garlic and basil.", price: 179, category: "Starters", image: DISH.bruschetta, isVeg: true },
      { name: "Tiramisu", description: "Espresso-soaked ladyfingers with mascarpone cream.", price: 199, category: "Desserts", image: DISH.tiramisu, isVeg: true },
      { name: "Cold Brew Coffee", description: "Slow-steeped, smooth and refreshing.", price: 149, category: "Beverages", image: DISH.coffee, isVeg: true },
    ],
  },
  {
    name: "Dragon Wok",
    description:
      "Bold Indo-Chinese street flavours — smoky, saucy and served hot from the wok.",
    cuisine: ["Chinese", "Indo-Chinese", "Asian"],
    image: COVER.dragonWok,
    rating: 4.3,
    address: {
      street: "8 Salt Lake Sector V",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700091",
    },
    menu: [
      { name: "Hakka Noodles", description: "Wok-tossed noodles with crunchy vegetables.", price: 179, category: "Main Course", image: DISH.noodles, isVeg: true },
      { name: "Chicken Fried Rice", description: "Classic fried rice with egg and chicken.", price: 199, category: "Main Course", image: DISH.friedRice, isVeg: false },
      { name: "Veg Manchurian", description: "Fried veg balls in a tangy garlic-soy gravy.", price: 189, category: "Main Course", image: DISH.manchurian, isVeg: true },
      { name: "Chicken Momos (6 pcs)", description: "Steamed dumplings with spicy red chutney.", price: 149, category: "Starters", image: DISH.dumplings, isVeg: false },
      { name: "Veg Spring Rolls (4 pcs)", description: "Crisp rolls stuffed with shredded vegetables.", price: 129, category: "Starters", image: DISH.springRoll, isVeg: true },
      { name: "Hot & Sour Soup", description: "Spiced, tangy broth with vegetables and tofu.", price: 119, category: "Starters", image: DISH.hotAndSour, isVeg: true },
      { name: "Coke", description: "Chilled 300ml.", price: 59, category: "Beverages", image: DISH.cola, isVeg: true },
    ],
  },
  {
    name: "El Mexicano",
    description:
      "Vibrant Tex-Mex fiesta — loaded tacos, burritos and nachos with a zesty kick.",
    cuisine: ["Mexican", "Tex-Mex", "Continental"],
    image: COVER.elMexicano,
    rating: 4.4,
    address: {
      street: "22 Gariahat Road",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700019",
    },
    menu: [
      { name: "Chicken Tacos (3 pcs)", description: "Soft tortillas with grilled chicken, salsa and lime.", price: 239, category: "Main Course", image: DISH.tacos, isVeg: false },
      { name: "Veg Burrito", description: "Stuffed tortilla with beans, rice, cheese and veggies.", price: 259, category: "Main Course", image: DISH.burrito, isVeg: true },
      { name: "Loaded Nachos", description: "Corn chips smothered in cheese, jalapeños and salsa.", price: 219, category: "Starters", image: DISH.nachos, isVeg: true },
      { name: "Chicken Quesadilla", description: "Grilled tortilla folded with chicken and molten cheese.", price: 249, category: "Main Course", image: DISH.quesadilla, isVeg: false },
      { name: "Cheese Fries", description: "Crispy fries drenched in cheddar sauce.", price: 159, category: "Starters", image: DISH.fries, isVeg: true },
      { name: "Churro Sundae", description: "Cinnamon churros with vanilla ice cream.", price: 189, category: "Desserts", image: DISH.iceCream, isVeg: true },
      { name: "Fresh Lime Soda", description: "Zesty, fizzy and refreshing.", price: 79, category: "Beverages", image: DISH.juice, isVeg: true },
    ],
  },
  {
    name: "Burger Barn",
    description:
      "Juicy smash burgers, crispy fries and loaded shakes — American comfort done right.",
    cuisine: ["Fast Food", "American", "Burgers"],
    image: COVER.burgerBarn,
    rating: 4.2,
    address: {
      street: "5 Elgin Road",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700020",
    },
    menu: [
      { name: "Classic Chicken Burger", description: "Crispy chicken patty, lettuce and mayo in a toasted bun.", price: 189, category: "Main Course", image: DISH.burger, isVeg: false },
      { name: "Veg Cheese Burger", description: "Spiced veg patty with melted cheese and pickles.", price: 149, category: "Main Course", image: DISH.burger, isVeg: true },
      { name: "Peri-Peri Fries", description: "Crispy fries tossed in fiery peri-peri.", price: 119, category: "Starters", image: DISH.fries, isVeg: true },
      { name: "Chicken Wings (6 pcs)", description: "Smoky glazed wings with a tangy dip.", price: 229, category: "Starters", image: DISH.wings, isVeg: false },
      { name: "Loaded Hot Dog", description: "Grilled sausage with onions, mustard and cheese.", price: 169, category: "Main Course", image: DISH.hotdog, isVeg: false },
      { name: "Chocolate Brownie", description: "Fudgy warm brownie with a scoop of ice cream.", price: 139, category: "Desserts", image: DISH.brownie, isVeg: true },
      { name: "Cola Float", description: "Chilled cola topped with vanilla ice cream.", price: 99, category: "Beverages", image: DISH.cola, isVeg: true },
    ],
  },
  {
    name: "Sweet Symphony",
    description:
      "A dessert lover's paradise — decadent cakes, brownies and artisan ice creams.",
    cuisine: ["Desserts", "Bakery", "Cafe"],
    image: COVER.sweetSymphony,
    rating: 4.9,
    address: {
      street: "30 Hindustan Park",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700029",
    },
    menu: [
      { name: "Belgian Chocolate Cake", description: "Rich flourless chocolate cake, slice.", price: 189, category: "Desserts", image: DISH.cake, isVeg: true },
      { name: "New York Cheesecake", description: "Creamy baked cheesecake with a biscuit base.", price: 209, category: "Desserts", image: DISH.cheesecake, isVeg: true },
      { name: "Fudge Brownie", description: "Dense, gooey chocolate brownie.", price: 119, category: "Desserts", image: DISH.brownie, isVeg: true },
      { name: "Glazed Donut (2 pcs)", description: "Soft ring donuts with a sugar glaze.", price: 99, category: "Desserts", image: DISH.donut, isVeg: true },
      { name: "Vanilla Bean Ice Cream", description: "Two scoops of Madagascar vanilla.", price: 129, category: "Desserts", image: DISH.iceCream, isVeg: true },
      { name: "Cappuccino", description: "Espresso with velvety steamed milk.", price: 139, category: "Beverages", image: DISH.coffee, isVeg: true },
    ],
  },
  {
    name: "Dosa Delight",
    description:
      "Authentic South Indian tiffin — crispy dosas, fluffy idlis and filter coffee.",
    cuisine: ["South Indian", "Indian", "Vegetarian"],
    image: COVER.dosaDelight,
    rating: 4.5,
    address: {
      street: "17 Lake Market",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700029",
    },
    menu: [
      { name: "Masala Dosa", description: "Crispy rice crêpe filled with spiced potato masala.", price: 129, category: "Main Course", image: DISH.dosa, isVeg: true },
      { name: "Idli Sambar (3 pcs)", description: "Steamed rice cakes with sambar and chutney.", price: 99, category: "Main Course", image: DISH.idli, isVeg: true },
      { name: "Medu Vada (2 pcs)", description: "Crispy lentil doughnuts with coconut chutney.", price: 89, category: "Starters", image: DISH.vada, isVeg: true },
      { name: "Onion Uttapam", description: "Thick savoury pancake topped with onions.", price: 119, category: "Main Course", image: DISH.uttapam, isVeg: true },
      { name: "Rava Dosa", description: "Lacy semolina crêpe, extra crisp.", price: 139, category: "Main Course", image: DISH.dosa, isVeg: true },
      { name: "Filter Coffee", description: "Strong South Indian drip coffee.", price: 59, category: "Beverages", image: DISH.coffee, isVeg: true },
      { name: "Mysore Pak", description: "Rich ghee-and-gram-flour fudge.", price: 79, category: "Desserts", image: DISH.roshogolla, isVeg: true },
    ],
  },
  {
    name: "Banglar Rannaghar",
    description:
      "Traditional Bengali home cooking — fish curries, kosha mangsho and sweet endings.",
    cuisine: ["Bengali", "Indian", "Seafood"],
    image: COVER.banglarRannaghar,
    rating: 4.7,
    address: {
      street: "9 Shyambazar",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700004",
    },
    menu: [
      { name: "Kosha Mangsho", description: "Slow-cooked spicy Bengali mutton curry.", price: 329, category: "Main Course", image: DISH.kosha, isVeg: false },
      { name: "Macher Jhol", description: "Light rohu fish curry with potato and spices.", price: 259, category: "Main Course", image: DISH.fishCurry, isVeg: false },
      { name: "Shorshe Ilish", description: "Hilsa fish in a pungent mustard gravy.", price: 379, category: "Main Course", image: DISH.fishCurry, isVeg: false },
      { name: "Aloo Posto", description: "Potatoes in a creamy poppy-seed paste.", price: 179, category: "Main Course", image: DISH.curry, isVeg: true },
      { name: "Vegetable Chop (2 pcs)", description: "Crumb-fried spiced beetroot-and-veg croquettes.", price: 99, category: "Starters", image: DISH.samosa, isVeg: true },
      { name: "Roshogolla (2 pcs)", description: "Spongy cottage-cheese balls in light syrup.", price: 89, category: "Desserts", image: DISH.roshogolla, isVeg: true },
      { name: "Mishti Doi", description: "Traditional sweet caramelised yogurt.", price: 79, category: "Desserts", image: DISH.mishtiDoi, isVeg: true },
    ],
  },
  {
    name: "Momo Magic",
    description:
      "Steamed, fried and tandoori momos with fiery chutneys — Himalayan comfort food.",
    cuisine: ["Tibetan", "Nepalese", "Street Food"],
    image: COVER.momoMagic,
    rating: 4.1,
    address: {
      street: "3 New Town Action Area I",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700156",
    },
    menu: [
      { name: "Steamed Chicken Momos (8 pcs)", description: "Juicy chicken dumplings with spicy chutney.", price: 149, category: "Main Course", image: DISH.momo, isVeg: false },
      { name: "Veg Momos (8 pcs)", description: "Steamed dumplings stuffed with seasoned vegetables.", price: 119, category: "Main Course", image: DISH.momo, isVeg: true },
      { name: "Pan-Fried Momos (6 pcs)", description: "Crispy-bottomed momos, chicken filling.", price: 169, category: "Starters", image: DISH.dumplings, isVeg: false },
      { name: "Chicken Thukpa", description: "Hearty Himalayan noodle soup with vegetables.", price: 179, category: "Main Course", image: DISH.thukpa, isVeg: false },
      { name: "Tandoori Momos (6 pcs)", description: "Char-grilled momos tossed in tandoori masala.", price: 189, category: "Starters", image: DISH.dumplings, isVeg: false },
      { name: "Masala Chai", description: "Spiced milk tea, served hot.", price: 39, category: "Beverages", image: DISH.coffee, isVeg: true },
    ],
  },
  {
    name: "The Grand Thali",
    description:
      "Unlimited regional thalis — a lavish platter of dals, sabzis, breads and sweets.",
    cuisine: ["Indian", "Thali", "Vegetarian"],
    image: COVER.theGrandThali,
    rating: 4.5,
    address: {
      street: "50 Rashbehari Avenue",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700026",
    },
    menu: [
      { name: "Royal Veg Thali", description: "Paneer, dal, two sabzis, rice, breads and dessert.", price: 349, category: "Main Course", image: DISH.thali, isVeg: true },
      { name: "Deluxe Non-Veg Thali", description: "Chicken curry, egg, dal, rice, roti and sweet.", price: 399, category: "Main Course", image: DISH.thali, isVeg: false },
      { name: "Dal Makhani", description: "Slow-cooked black lentils in butter and cream.", price: 189, category: "Main Course", image: DISH.curry, isVeg: true },
      { name: "Paneer Butter Masala", description: "Cottage cheese in a rich creamy tomato gravy.", price: 229, category: "Main Course", image: DISH.paneer, isVeg: true },
      { name: "Butter Roti (2 pcs)", description: "Soft whole-wheat flatbread with butter.", price: 49, category: "Main Course", image: DISH.naan, isVeg: true },
      { name: "Jeera Rice", description: "Basmati rice tempered with cumin.", price: 129, category: "Main Course", image: DISH.friedRice, isVeg: true },
      { name: "Sweet Lassi", description: "Thick, chilled sweetened yogurt drink.", price: 89, category: "Beverages", image: DISH.lassi, isVeg: true },
      { name: "Rasmalai (2 pcs)", description: "Soft paneer discs in saffron-cardamom milk.", price: 119, category: "Desserts", image: DISH.roshogolla, isVeg: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------
const seed = async () => {
  try {
    await connectDB();

    // 1. Clear ONLY restaurants and menu items — leave Users and Orders intact.
    const deletedMenu = await MenuItem.deleteMany({});
    const deletedRestaurants = await Restaurant.deleteMany({});
    console.log(
      `🧹 Cleared ${deletedRestaurants.deletedCount} restaurants and ${deletedMenu.deletedCount} menu items.`
    );

    // 2. Ensure the seed owner user exists (create only if missing).
    let owner = await User.findOne({ email: SEED_OWNER.email });
    if (!owner) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(SEED_OWNER.password, salt);
      owner = await User.create({
        name: SEED_OWNER.name,
        email: SEED_OWNER.email,
        password: hashedPassword,
        role: SEED_OWNER.role,
      });
      console.log(`👤 Created seed owner user: ${owner.email}`);
    } else {
      console.log(`👤 Reusing existing seed owner user: ${owner.email}`);
    }

    // 3. Insert restaurants and their menus.
    let restaurantCount = 0;
    let menuCount = 0;

    for (const data of RESTAURANTS) {
      const { menu, ...restaurantFields } = data;

      const restaurant = await Restaurant.create({
        ...restaurantFields,
        owner: owner._id,
        isOpen: true,
      });
      restaurantCount += 1;

      const itemsToInsert = menu.map((item) => ({
        ...item,
        restaurant: restaurant._id,
        isAvailable: true,
      }));
      const inserted = await MenuItem.insertMany(itemsToInsert);
      menuCount += inserted.length;

      console.log(
        `  🍽️  ${restaurant.name} — ${inserted.length} menu items`
      );
    }

    // 4. Summary.
    console.log("\n──────────────────────────────────────────");
    console.log(`✅ Seeding complete.`);
    console.log(`   Restaurants created: ${restaurantCount}`);
    console.log(`   Menu items created:  ${menuCount}`);
    console.log("──────────────────────────────────────────\n");
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

seed();
