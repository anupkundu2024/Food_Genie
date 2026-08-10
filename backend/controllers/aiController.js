// controllers/aiController.js
// AI features powered by Google Gemini:
//   1. getRecommendations  — personalized menu-item suggestions
//   2. chatWithAssistant   — a conversational food ordering assistant
//
// Every Gemini call is wrapped in try/catch and degrades to a graceful
// fallback so a flaky/rate-limited AI API never turns into a 500 for the user.
// (Gemini's free tier has per-minute/per-day request limits — expect 429s.)

const { getModel, isConfigured } = require("../config/gemini");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Cap how many available items we send to the model, to keep the prompt small
// (cheaper + faster + avoids hitting token limits on large catalogs).
const MAX_MENU_FOR_PROMPT = 40;

/**
 * Strip Markdown code fences (```json ... ``` or ``` ... ```) that Gemini often
 * wraps JSON in, then JSON.parse the remainder.
 * Returns the parsed object, or null if parsing fails.
 */
const parseJsonFromModel = (text) => {
  if (!text) return null;
  try {
    // Remove leading/trailing fences and an optional "json" language tag.
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
};

/**
 * Fallback recommendation source: the most-ordered available items across the
 * platform (i.e. "trending"), used when the user has no history or when the AI
 * call fails. Falls back further to newest available items if there are no
 * orders yet at all.
 */
const getPopularItems = async (restaurantFilter = {}, limit = 5) => {
  // Aggregate order line items to rank menu items by total quantity ordered.
  const popular = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItem",
        totalOrdered: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalOrdered: -1 } },
    { $limit: 50 }, // over-fetch; we filter to available ones below
  ]);

  const rankedIds = popular.map((p) => p._id).filter(Boolean);

  if (rankedIds.length > 0) {
    const items = await MenuItem.find({
      _id: { $in: rankedIds },
      isAvailable: true,
      ...restaurantFilter,
    }).populate("restaurant", "name");

    // Preserve the popularity ordering from the aggregation.
    const order = new Map(rankedIds.map((id, i) => [id.toString(), i]));
    items.sort(
      (a, b) => order.get(a._id.toString()) - order.get(b._id.toString())
    );

    if (items.length > 0) {
      return items.slice(0, limit).map((item) => ({
        item,
        reason: "Popular choice among Food Genie customers",
      }));
    }
  }

  // No orders anywhere yet — just surface some available items.
  const newest = await MenuItem.find({ isAvailable: true, ...restaurantFilter })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("restaurant", "name");

  return newest.map((item) => ({
    item,
    reason: "A fresh pick you might enjoy",
  }));
};

/**
 * @route  GET /api/ai/recommendations
 * @desc   Personalized menu-item recommendations for the logged-in customer.
 *         Optional query: ?restaurantId= to scope suggestions to one restaurant.
 * @access Private (role: "customer")
 */
const getRecommendations = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const restaurantFilter = restaurantId ? { restaurant: restaurantId } : {};

    // 1. Pull the customer's recent orders (newest first), with item categories.
    const pastOrders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("items.menuItem", "category");

    // Flatten ordered items into a set of names + categories.
    const orderedNames = new Set();
    const orderedCategories = new Set();
    for (const order of pastOrders) {
      for (const line of order.items) {
        if (line.name) orderedNames.add(line.name);
        // menuItem may be null if the item was later deleted.
        if (line.menuItem?.category) orderedCategories.add(line.menuItem.category);
      }
    }

    // 2. Available items to recommend from.
    const availableItems = await MenuItem.find({
      isAvailable: true,
      ...restaurantFilter,
    })
      .limit(MAX_MENU_FOR_PROMPT)
      .populate("restaurant", "name");

    // If there's nothing to recommend, say so cleanly.
    if (availableItems.length === 0) {
      return res.status(200).json({
        success: true,
        data: { recommendations: [], source: "none" },
      });
    }

    // 3. No history OR AI not configured → fall back to popular items.
    if (orderedNames.size === 0 || !isConfigured) {
      const fallback = await getPopularItems(restaurantFilter, 5);
      return res.status(200).json({
        success: true,
        data: {
          recommendations: fallback.map((f) => ({
            menuItem: f.item,
            reason: f.reason,
          })),
          source: orderedNames.size === 0 ? "popular" : "popular_ai_unconfigured",
        },
      });
    }

    // 4. Build the prompt and ask Gemini for JSON-only recommendations.
    const menuList = availableItems
      .map(
        (m) =>
          `- ${m.name}${m.category ? ` (${m.category})` : ""}${
            m.isVeg ? " [veg]" : " [non-veg]"
          } — ₹${m.price}`
      )
      .join("\n");

    const prompt = `You are a food recommendation engine for "Food Genie".

The customer has previously ordered these items: ${[...orderedNames].join(", ")}.
They tend to like these categories: ${
      [...orderedCategories].join(", ") || "unknown"
    }.

Here are the currently available menu items you may recommend from:
${menuList}

Recommend 3 to 5 items from the available list above that this customer would likely enjoy, each with a short one-sentence reason.
Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape:
{"recommendations":[{"menuItemName":"<exact name from the list>","reason":"<short reason>"}]}`;

    let parsed = null;
    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      parsed = parseJsonFromModel(text);
    } catch (aiErr) {
      // Network error, rate limit (429), etc. — fall through to fallback below.
      console.error("Gemini recommendation error:", aiErr.message);
    }

    // 5. If the AI failed or returned unusable JSON, degrade to popular items.
    if (!parsed || !Array.isArray(parsed.recommendations)) {
      const fallback = await getPopularItems(restaurantFilter, 5);
      return res.status(200).json({
        success: true,
        data: {
          recommendations: fallback.map((f) => ({
            menuItem: f.item,
            reason: f.reason,
          })),
          source: "popular_fallback",
        },
      });
    }

    // 6. Match the AI's suggested names back to real MenuItem documents.
    //    Build a case-insensitive lookup of available items by name.
    const byName = new Map(
      availableItems.map((m) => [m.name.trim().toLowerCase(), m])
    );

    const recommendations = [];
    for (const rec of parsed.recommendations) {
      const name = (rec.menuItemName || "").trim().toLowerCase();
      const match = byName.get(name);
      if (match) {
        recommendations.push({
          menuItem: match,
          reason: rec.reason || "Recommended for you",
        });
      }
    }

    // If the model hallucinated names that don't match anything, fall back.
    if (recommendations.length === 0) {
      const fallback = await getPopularItems(restaurantFilter, 5);
      return res.status(200).json({
        success: true,
        data: {
          recommendations: fallback.map((f) => ({
            menuItem: f.item,
            reason: f.reason,
          })),
          source: "popular_fallback",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: { recommendations, source: "ai" },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error generating recommendations",
    });
  }
};

/**
 * Normalize a caller-supplied conversationHistory entry into the shape the
 * Gemini SDK expects: { role: "user" | "model", parts: [{ text }] }.
 * Accepts common variants (assistant/ai/bot → model; content/text/message).
 */
const normalizeHistory = (history) => {
  if (!Array.isArray(history)) return [];
  return history
    .map((entry) => {
      if (!entry) return null;
      const rawRole = (entry.role || "").toLowerCase();
      const role =
        rawRole === "model" ||
        rawRole === "assistant" ||
        rawRole === "ai" ||
        rawRole === "bot"
          ? "model"
          : "user";
      const text = entry.text || entry.content || entry.message || "";
      if (!text) return null;
      return { role, parts: [{ text: String(text) }] };
    })
    .filter(Boolean);
};

/**
 * @route  POST /api/ai/chat
 * @desc   Conversational food assistant for the logged-in customer.
 *         Body: { message: string, conversationHistory?: Array }
 * @access Private (role: "customer")
 */
const chatWithAssistant = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty 'message' is required",
      });
    }

    // If AI isn't configured, return a friendly canned reply rather than error.
    if (!isConfigured) {
      return res.status(200).json({
        success: true,
        data: {
          reply:
            "Sorry, the food assistant is temporarily unavailable. Please try again later!",
          fallback: true,
        },
      });
    }

    const systemInstruction = `You are "Food Genie's" friendly food ordering assistant.
You help customers with cuisine suggestions, dietary questions (vegetarian/non-vegetarian, spice level, allergies), and general food queries.
You do NOT have live access to place orders, process payments, or check real-time restaurant availability — if asked, politely explain that and suggest they use the app's ordering screens.
Keep replies concise: under 100 words unless the user explicitly asks for more detail. Be warm and helpful.`;

    let reply = null;
    try {
      const model = getModel({
        systemInstruction,
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      });

      // Seed the chat with prior turns so context carries across the session.
      const chat = model.startChat({
        history: normalizeHistory(conversationHistory),
      });

      const result = await chat.sendMessage(message.trim());
      reply = result.response.text();
    } catch (aiErr) {
      // Rate limit / network / safety block — log and fall back gracefully.
      console.error("Gemini chat error:", aiErr.message);
    }

    if (!reply || !reply.trim()) {
      return res.status(200).json({
        success: true,
        data: {
          reply:
            "I'm having trouble responding right now. Please try again in a moment!",
          fallback: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: { reply: reply.trim(), fallback: false },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error in chat assistant",
    });
  }
};

module.exports = { getRecommendations, chatWithAssistant };
