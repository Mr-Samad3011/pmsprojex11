


/* eslint-disable no-unused-vars */
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute ensures that only authorized users can access a route.
 * @param {ReactNode} children - Components to render if access is allowed
 * @param {Array<string>} allowedDepartments - Array of allowed departments (case-insensitive)
 * @param {string} permission - Optional permission check
 */
export default function ProtectedRoute({ children, allowedDepartments = [], permission }) {
  const token = localStorage.getItem("token");
  let user = null;

  // Safely parse user from localStorage
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    console.warn("Failed to parse user from localStorage:", err);
    user = null;
  }

  // 🚫 Not logged in
  if (!token || !user) return <Navigate to="/" replace />;

  // Ensure departments is always an array
  const departments = Array.isArray(user.departments) ? user.departments : [user.departments];

  // Case-insensitive department check
  const allowedLower = allowedDepartments.map((dep) => dep.toLowerCase());
  const userLower = departments.map((dep) => dep.toLowerCase());

  const hasAccess = userLower.some((dep) => allowedLower.includes(dep));

  if (allowedDepartments.length > 0 && !hasAccess) {
    return <Navigate to="/" replace />;
  }

  // Optional permission check
  if (permission && !user.permissions?.includes(permission)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized: render children
  return children;
}
