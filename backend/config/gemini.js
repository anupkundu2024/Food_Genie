// config/gemini.js
// Initializes the Google Gemini client used for AI features (recommendations
// and the food assistant chatbot).
//
// We use "gemini-2.0-flash" — the fast/cheap tier — which is a good fit for
// short recommendation and chat responses.
//
// NOTE on rate limits: the Gemini free tier is capped (roughly ~15 requests
// per minute / limited requests per day depending on the model). Controllers
// that call this client should always wrap requests in try/catch and degrade
// gracefully rather than surfacing a 429/500 to the user.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // Don't throw at import time — the rest of the API should still boot even
  // if AI features are unconfigured. Calls will fail gracefully instead.
  console.warn(
    "⚠️  GEMINI_API_KEY is not set. AI features will use fallback responses."
  );
}

// Model id used across all AI features.
const MODEL_NAME = "gemini-2.0-flash";

// A single shared client instance.
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Returns a configured generative model.
 * @param {object} options - passed through to getGenerativeModel
 *        (e.g. { systemInstruction, generationConfig }).
 */
const getModel = (options = {}) =>
  genAI.getGenerativeModel({ model: MODEL_NAME, ...options });

// True only when an API key is present; controllers can short-circuit to a
// fallback when this is false instead of making a doomed network call.
const isConfigured = Boolean(apiKey);

module.exports = { genAI, getModel, MODEL_NAME, isConfigured };
