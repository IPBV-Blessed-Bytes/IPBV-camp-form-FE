import { USER_PERMISSIONS_KEY } from '@/config';

const ADMIN = 'admin';
const COLLABORATOR = 'collaborator';
const COLLABORATOR_VIEWER = 'collaborator-viewer';
const CHECKER = 'checker';
const JOKER_MANAGER = 'ride-manager';
const TEAM_CREATOR = 'team-creator';

const CONTEXT_PERMISSION = {
  'settings-button-home': 'SETTINGS',
  'data-panel-button-home': 'PANEL_VIEW',
  'registered-button-home': 'REGISTRATIONS_READ',
  'ride-button-home': 'RIDES_MANAGE',
  'discount-button-home': 'COUPONS_MANAGE',
  'rooms-button-home': 'ROOMS_MANAGE',
  'teams-button-home': 'TEAMS_MANAGE',
  'feedback-button-home': 'FEEDBACK_VIEW',
  'extra-meals-button-home': 'EXTRAMEALS_VIEW',
  'packages-and-totals-cards-home': 'PANEL_VIEW',
  'utilities-links-home': 'PANEL_VIEW',
  'edit-delete-admin-table': 'REGISTRATIONS_WRITE',
  'create-registration-admin-table': 'REGISTRATIONS_WRITE',
  'delete-registrations-admin-table': 'REGISTRATIONS_DELETE',
  'vacancies-progression-panel': 'CHARTS_VIEW',
  'checkin-balance-panel': 'CHECKIN',
  'filled-vacancies-chart-panel': 'CHARTS_VIEW',
  'all-info-chart-panel': 'CHARTS_VIEW',
  checkin: 'CHECKIN',
  'campers-table-button-checkin': 'CHECKIN',
};

const getStoredPermissions = () => {
  try {
    const raw = localStorage.getItem(USER_PERMISSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const legacyPermission = (userRole, context) => {
  const map = {
    'settings-button-home': userRole === ADMIN,
    'data-panel-button-home':
      userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'registered-button-home':
      userRole === ADMIN ||
      userRole === COLLABORATOR ||
      userRole === COLLABORATOR_VIEWER ||
      userRole === TEAM_CREATOR ||
      userRole === JOKER_MANAGER,
    'ride-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'discount-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'rooms-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'teams-button-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === TEAM_CREATOR,
    'feedback-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'extra-meals-button-home': userRole === ADMIN || userRole === COLLABORATOR,
    'packages-and-totals-cards-home':
      userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === JOKER_MANAGER,
    'utilities-links-home': userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER,
    'edit-delete-admin-table': userRole === ADMIN || userRole === COLLABORATOR || userRole === JOKER_MANAGER,
    'create-registration-admin-table': userRole === ADMIN || userRole === COLLABORATOR,
    'delete-registrations-admin-table': userRole === ADMIN || userRole === COLLABORATOR,
    'vacancies-progression-panel':
      userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'checkin-balance-panel': userRole === ADMIN || userRole === CHECKER,
    'filled-vacancies-chart-panel':
      userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    'all-info-chart-panel':
      userRole === ADMIN || userRole === COLLABORATOR || userRole === COLLABORATOR_VIEWER || userRole === CHECKER,
    checkin: userRole === ADMIN || userRole === CHECKER || userRole === JOKER_MANAGER,
    'campers-table-button-checkin': userRole === ADMIN || userRole === JOKER_MANAGER,
  };
  return map[context] || false;
};

export const permissions = (userRole, context) => {
  const stored = getStoredPermissions();

  if (stored) {
    const required = CONTEXT_PERMISSION[context];
    return required ? stored.includes(required) : false;
  }

  return legacyPermission(userRole, context);
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
