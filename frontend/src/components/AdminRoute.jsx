// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useRoles from '../hooks/useRoles';

/**
 * Protects admin-only pages.
 *   • While roles are still loading   → render nothing (prevents flicker)
 *   • If user *is* platform_admin    → allow access
 *   • Otherwise                      → bounce to /dashboard
 */
export default function AdminRoute({ children }) {
    const { isAdmin, ready } = useRoles();

    if (!ready) return null;                     // roles still resolving
    return isAdmin ? children : <Navigate to="/dashboard" replace />;
}
