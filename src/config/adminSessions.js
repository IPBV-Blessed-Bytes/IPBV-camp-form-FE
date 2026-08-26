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

const sessionIndex = (key) => {
  const index = ADMIN_SESSIONS.findIndex((session) => session.key === key);
  return index === -1 ? ADMIN_SESSIONS.length + 1 : index + 1;
};

export const fallbackTitle = (key) => `Título ${sessionIndex(key)}`;
export const fallbackDescription = (key) => `Descrição ${sessionIndex(key)}`;

export const defaultIconFor = (key) =>
  ADMIN_SESSIONS.find((session) => session.key === key)?.defaultIcon || 'info';

export const resolveSession = (key, config) => ({
  title: config?.title || fallbackTitle(key),
  description: config?.description || fallbackDescription(key),
  color: config?.color || null,
  icon: config?.iconKey || defaultIconFor(key),
});
