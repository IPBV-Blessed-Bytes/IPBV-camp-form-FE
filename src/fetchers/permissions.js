const ADMIN = 'admin';
const COLLABORATOR = 'collaborator';
const COLLABORATOR_VIEWER = 'collaborator-viewer';
const CHECKER = 'checker';

export const permissions = (userRole, context) => {
  const permissionsMap = {
    'settings-button-home': userRole === ADMIN,
    'data-panel-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'registered-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'ride-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'discount-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'rooms-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'feedback-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'extra-meals-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'packages-and-totals-cards-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'utilities-links-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'advanced-options-admin-table': userRole === ADMIN || userRole === COLLABORATOR,
    'checkin-balance-panel': userRole === ADMIN || userRole === CHECKER,
    'vacancies-progression-panel': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'checkin': userRole === ADMIN || userRole === CHECKER,
  };

  return permissionsMap[context] || false;
};
