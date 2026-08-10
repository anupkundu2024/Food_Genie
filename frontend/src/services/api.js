// services/api.js
// Centralized Axios instance. Every API call in the app goes through this so
// the base URL and auth headers are configured in one place.

import axios from "axios";

// Backend origin from env, falling back to localhost. We append "/api" so
// callers can use clean paths like api.get("/restaurants").
const origin = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${origin}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach the JWT (if we have one) to every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
