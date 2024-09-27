const ADMIN = 'admin'
const CONTROLLER = 'controller'
const CHECKER = 'checker'

export const permissions = (userRole, context) => {
  const permissionsMap = {
    'settings-button-home': userRole === ADMIN,
    'main-button-home': userRole === ADMIN || userRole === CONTROLLER,
    'checkin': userRole === ADMIN || userRole === CONTROLLER || userRole === CHECKER,
  };

  return permissionsMap[context] || false;
};
