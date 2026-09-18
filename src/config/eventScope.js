export const SELECTED_EVENT_KEY = 'selected-event';

export const GLOBAL_ADMIN_SEGMENTS = new Set(['', 'eventos', 'usuarios', 'papeis', 'logs']);

export const EVENT_SCOPED_PREFIXES = new Set([
  'camper',
  'rooms',
  'base-date',
  'ride',
  'checkout',
  'discount',
  'feedback',
  'form-stage',
  'form-fields',
  'sections',
  'package-categories',
  'age-price-rules',
  'admin-sessions',
  'faqs',
  'submissions',
  'homepage-info',
  'lots',
  'products',
  'team',
  'user-wristbands',
  'total-registrations',
  'package-count',
  'non-paying-children',
  'crew-bus',
  'donations',
  'deleted-registrations',
  'chatbot',
]);

export const getEventSlugFromPath = (pathname = window.location.pathname) => {
  const match = pathname.match(/^\/e\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const getEventSlug = () => getEventSlugFromPath() || localStorage.getItem(SELECTED_EVENT_KEY) || null;

export const adminSegmentFromPath = (pathname = window.location.pathname) => {
  const match = pathname.match(/^\/(?:admin|dev)(?:\/([^/?#]+))?/);
  return match ? { isAdmin: true, segment: match[1] || '' } : { isAdmin: false, segment: null };
};

export const setSelectedEvent = (slug) => {
  if (slug) localStorage.setItem(SELECTED_EVENT_KEY, slug);
};

export const withEventScope = (url) => {
  if (typeof url !== 'string' || !url.startsWith('/')) return url;

  const segment = url.split('/')[1]?.split(/[?#]/)[0];
  if (!EVENT_SCOPED_PREFIXES.has(segment)) return url;

  const slug = getEventSlug();
  if (!slug) return url;

  return `/e/${slug}${url}`;
};

export const stripEventPrefix = (pathname = window.location.pathname) => {
  const stripped = pathname.replace(/^\/e\/[^/]+/, '');
  return stripped === '' ? '/' : stripped;
};

export const eventPath = (sub = '', slug = getEventSlug()) =>
  `/e/${slug}${sub === '/' ? '' : sub}`;
