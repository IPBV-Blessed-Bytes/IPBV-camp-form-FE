import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ userRole, allowedRoles, children }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  userRole: PropTypes.string,
  allowedRoles: PropTypes.string,
  children: PropTypes.element,
};

export default ProtectedRoute;
