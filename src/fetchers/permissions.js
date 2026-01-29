const ADMIN = 'admin';
const COLLABORATOR = 'collaborator';
const COLLABORATOR_VIEWER = 'collaborator-viewer';
const CHECKER = 'checker';
const JOKER_MANAGER = 'ride-manager';
const TEAM_CREATOR = 'team-creator';

export const permissions = (userRole, context) => {
  const permissionsMap = {
    'settings-button-home': userRole === ADMIN,
    'data-panel-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'registered-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === JOKER_MANAGER,
    'ride-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'discount-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'rooms-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'teams-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === TEAM_CREATOR,
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
    'campers-table-button-checkin': userRole === ADMIN || userRole === JOKER_MANAGER,
  };

  return permissionsMap[context] || false;
};

export const permissionsSections = (userRole) => ({
  adminTableEditDeletePermissions: permissions(userRole, 'edit-delete-admin-table'),
  adminTableCreateRegistrationPermissions: permissions(userRole, 'create-registration-admin-table'),
  adminTableDeleteRegistrationsAndSelectRowsPermissions: permissions(userRole, 'delete-registrations-admin-table'),
  campersTableButtonPermissions: permissions(userRole, 'campers-table-button-checkin'),
  vacanciesProgressionPermissions: permissions(userRole, 'vacancies-progression-panel'),
  checkinBalancePermissions: permissions(userRole, 'checkin-balance-panel'),
  filledVacanciesChartPermissions: permissions(userRole, 'filled-vacancies-chart-panel'),
  allInfoChartPermissions: permissions(userRole, 'all-info-chart-panel'),
  registeredButtonHomePermissions: permissions(userRole, 'registered-button-home'),
  rideButtonHomePermissions: permissions(userRole, 'ride-button-home'),
  discountButtonHomePermissions: permissions(userRole, 'discount-button-home'),
  roomsButtonHomePermissions: permissions(userRole, 'rooms-button-home'),
  teamsButtonHomePermissions: permissions(userRole, 'teams-button-home'),
  feedbackButtonHomePermissions: permissions(userRole, 'feedback-button-home'),
  settingsButtonPermissions: permissions(userRole, 'settings-button-home'),
  packagesAndTotalCardsPermissions: permissions(userRole, 'packages-and-totals-cards-home'),
  dataPanelButtonPermissions: permissions(userRole, 'data-panel-button-home'),
  utilitiesLinksPermissions: permissions(userRole, 'utilities-links-home'),
  checkinPermissions: permissions(userRole, 'checkin'),
});
