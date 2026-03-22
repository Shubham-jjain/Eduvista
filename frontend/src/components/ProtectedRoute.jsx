import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

// Route guard that checks authentication and optional role-based authorization
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
