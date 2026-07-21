import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import { USER_PERMISSIONS_KEY } from '@/config';

const getStoredPermissions = () => {
  try {
    const raw = localStorage.getItem(USER_PERMISSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// Gating de rota por permissão do BE. Quando `requiredPermission` é informado,
// a decisão vem das permissões do usuário (GET /auth/me/permissions). Enquanto
// a lista não carrega, cai no fallback por papel (`allowedRoles`) para não
// bloquear indevidamente um usuário válido (ex.: primeiro render/refresh).
const ProtectedRoute = ({ userRole, allowedRoles, requiredPermission, children }) => {
  const storedPermissions = getStoredPermissions();

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
