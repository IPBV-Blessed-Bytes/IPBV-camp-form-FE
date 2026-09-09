import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import { USER_PERMISSIONS_KEY } from '@/config';
import { getEventSlug, adminSegmentFromPath, GLOBAL_ADMIN_SEGMENTS } from '@/config/eventScope';

const getStoredPermissions = () => {
  try {
    const raw = localStorage.getItem(USER_PERMISSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ userRole, allowedRoles, requiredPermission, children }) => {
  const location = useLocation();
  const storedPermissions = getStoredPermissions();

  const { isAdmin, segment } = adminSegmentFromPath(location.pathname);
  if (isAdmin && !GLOBAL_ADMIN_SEGMENTS.has(segment) && !getEventSlug()) {
    const home = location.pathname.startsWith('/dev') ? '/dev' : '/admin';
    return <Navigate to={home} replace />;
  }

  let allowed;
  if (requiredPermission) {
    allowed = storedPermissions
      ? storedPermissions.includes(requiredPermission)
      : Array.isArray(allowedRoles)
        ? allowedRoles.includes(userRole)
        : true;
  } else if (Array.isArray(allowedRoles)) {
    allowed = allowedRoles.includes(userRole);
  } else {
    allowed = true;
  }

  if (!allowed) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  requiredPermission: PropTypes.string,
  userRole: PropTypes.string,
  children: PropTypes.element,
};

export default ProtectedRoute;
