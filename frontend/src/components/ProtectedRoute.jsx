// components/ProtectedRoute.jsx
// Wraps routes that require authentication. Optionally restricts access to
// specific roles. Redirects to /login when not authenticated, or to Home when
// authenticated but lacking the required role.

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * @param {ReactNode} children - the protected element to render
 * @param {string[]} [roles]   - optional list of allowed roles
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // Wait for the session-restore check before deciding.
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  // Not logged in → send to login, remembering where they wanted to go.
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → bounce to Home.
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
