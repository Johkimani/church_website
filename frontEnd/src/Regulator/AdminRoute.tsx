import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  checkAccess,
  getFirstAllowedPath,
  hasAnyAdminAccess,
  isChair,
  normalizeRoles,
} from "../utils/adminAccess";
import type { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * AdminRoute - Gate for every /admin page.
 *  - Not logged in            -> /login
 *  - Logged in without any admin role -> home (admin shell never mounts)
 *  - Chair only opens /admin hub
 *  - Anyone landing on a page they may not open -> their first allowed page
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roles = normalizeRoles(user?.role);

  if (!hasAnyAdminAccess(roles)) {
    return <Navigate to="/" replace />;
  }

  if (location.pathname === "/admin" || location.pathname === "/admin/") {
    if (!isChair(roles)) {
      return <Navigate to={getFirstAllowedPath(roles) ?? "/"} replace />;
    }
  }

  if (!checkAccess(roles, location.pathname)) {
    return <Navigate to={getFirstAllowedPath(roles) ?? "/"} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
