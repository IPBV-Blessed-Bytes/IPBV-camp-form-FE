const ADMIN = 'admin';
const COLLABORATOR = 'collaborator';
const COLLABORATOR_VIEWER = 'collaborator-viewer';
const CHECKER = 'checker';
const JOKER_MANAGER = 'ride-manager';

export const permissions = (userRole, context) => {
  const permissionsMap = {
    'settings-button-home': userRole === ADMIN,
    'data-panel-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'registered-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === JOKER_MANAGER,
    'ride-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'discount-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'rooms-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'feedback-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'extra-meals-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'packages-and-totals-cards-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === JOKER_MANAGER,
    'utilities-links-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'edit-delete-admin-table': userRole === ADMIN || userRole === COLLABORATOR || userRole === JOKER_MANAGER,
    'create-registration-admin-table': userRole === ADMIN || userRole === COLLABORATOR,
    'delete-registrations-admin-table': userRole === ADMIN || userRole === COLLABORATOR,
    'vacancies-progression-panel': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'checkin-balance-panel': userRole === ADMIN || userRole === CHECKER,
    'filled-vacancies-chart-panel': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'all-info-chart-panel': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'checkin': userRole === ADMIN || userRole === CHECKER || userRole === JOKER_MANAGER,
  };

  return permissionsMap[context] || false;
};
