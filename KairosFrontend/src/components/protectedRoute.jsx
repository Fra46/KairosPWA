"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.roleName || user.role

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
