const DEFAULT_EVENT_SLUG = 'acampamento-ipbv';

export const SELECTED_EVENT_KEY = 'selected-event';

export const EVENT_SCOPED_PREFIXES = new Set([
  'camper',
  'aggregate',
  'base-date',
  'ride',
  'checkout',
  'coupon',
  'feedback',
  'form-context',
  'homepage-info',
  'lots',
  'products',
  'team',
  'user-wristbands',
  'total-registrations',
  'package-count',
]);

export const getEventSlugFromPath = (pathname = window.location.pathname) => {
  const match = pathname.match(/^\/e\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const getEventSlug = () =>
  getEventSlugFromPath() || localStorage.getItem(SELECTED_EVENT_KEY) || DEFAULT_EVENT_SLUG;

export const setSelectedEvent = (slug) => {
  if (slug) localStorage.setItem(SELECTED_EVENT_KEY, slug);
};

export const withEventScope = (url) => {
  if (typeof url !== 'string' || !url.startsWith('/')) return url;

  const segment = url.split('/')[1]?.split(/[?#]/)[0];
  if (!EVENT_SCOPED_PREFIXES.has(segment)) return url;

  return `/e/${getEventSlug()}${url}`;
};

export const stripEventPrefix = (pathname = window.location.pathname) => {
  const stripped = pathname.replace(/^\/e\/[^/]+/, '');
  return stripped === '' ? '/' : stripped;
};

export const eventPath = (sub = '', slug = getEventSlug()) =>
  `/e/${slug}${sub === '/' ? '' : sub}`;
