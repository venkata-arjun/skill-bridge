import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Protects a route for authenticated users with valid roles.
 * - If not authenticated -> redirect to /login
 * - If authenticated but invalid role -> redirect to /login
 * - Valid roles: student, faculty, speaker
 *
 * Usage:
 * <Route path="/protected" element={<ProtectedRoute><SomeComponent/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, profile, loading } = useAuth();

  // Show loading spinner while auth is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no profile loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has a valid role
  const validRoles = ["student", "faculty", "speaker"];
  if (!validRoles.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  // If specific role required, check it
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
