const ADMIN = 'admin';
const COLLABORATOR = 'collaborator';
const COLLABORATOR_VIEWER = 'collaborator-viewer';
const CHECKER = 'checker';

export const permissions = (userRole, context) => {
  const permissionsMap = {
    'settings-button-home': userRole === ADMIN,
    'registered-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'ride-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'coupon-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'aggregate-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'feedback-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'packages-and-totals-cards-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'utilities-links-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'advanced-options-admin-table': userRole === ADMIN || userRole === COLLABORATOR,
    'checkin': userRole === ADMIN || userRole === CHECKER,
  };

  return permissionsMap[context] || false;
};
