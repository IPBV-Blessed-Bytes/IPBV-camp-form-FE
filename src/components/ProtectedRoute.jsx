import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ userRole, allowedRoles, children }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
