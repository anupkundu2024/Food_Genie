// context/AuthContext.jsx
// Global authentication state: current user, JWT token, and the login /
// register / logout actions. Persists the session to localStorage and restores
// it on mount by calling /auth/me.

import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Initialize token from localStorage so the request interceptor works
  // immediately on the first render.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  // `loading` is true while we restore an existing session on mount.
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, verify it and load the user via /auth/me.
  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem("token");
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data.user);
        setToken(stored);
      } catch (err) {
        // Token invalid/expired — clear it.
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Store credentials in both state and localStorage.
  const persistAuth = (nextUser, nextToken) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(nextToken);
  };

  /**
   * Log in with email + password.
   * Returns the user on success; throws on failure so the caller can show an
   * error message.
   */
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: loggedInUser, token: newToken } = res.data.data;
    persistAuth(loggedInUser, newToken);
    return loggedInUser;
  };

  /**
   * Register a new account. `userData` = { name, email, password, phone, role }.
   * Backend logs the user in immediately and returns a token.
   */
  const register = async (userData) => {
    const res = await api.post("/auth/register", userData);
    const { user: newUser, token: newToken } = res.data.data;
    persistAuth(newUser, newToken);
    return newUser;
  };

  // Clear the session everywhere.
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  const value = { user, token, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for consuming the auth context.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
