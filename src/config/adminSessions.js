export const ADMIN_SESSIONS = [
  { key: 'acampantes', cardType: 'registered-card', defaultIcon: 'person' },
  { key: 'carona', cardType: 'ride-card', defaultIcon: 'ride' },
  { key: 'onibus', cardType: 'bus-card', defaultIcon: 'bus' },
  { key: 'descontos', cardType: 'discount-card', defaultIcon: 'discount' },
  { key: 'quartos', cardType: 'rooms-card', defaultIcon: 'rooms' },
  { key: 'times', cardType: 'teams-card', defaultIcon: 'team' },
  { key: 'opiniao', cardType: 'feedback-card', defaultIcon: 'feedback' },
  { key: 'checkin', cardType: 'checkin-card', defaultIcon: 'checkin' },
];

export const defaultIconFor = (key) =>
  ADMIN_SESSIONS.find((session) => session.key === key)?.defaultIcon || 'info';

export const resolveSession = (key, config, defaults = {}) => ({
  title: defaults.title || key,
  description: defaults.description || '',
  color: config?.color || null,
  icon: config?.iconKey || defaults.icon || defaultIconFor(key),
});
