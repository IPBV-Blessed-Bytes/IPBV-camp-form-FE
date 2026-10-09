export const SELECTED_EVENT_KEY = 'selected-event';
export const SELECTED_EVENT_NAME_KEY = 'selected-event-name';

export const APEX_DOMAIN = 'inscriptio.com.br';
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'mail', 'painel-interno']);

export const getTenantFromHostname = (hostname = window.location.hostname) => {
  try {
    const override = new URLSearchParams(window.location.search).get('tenant') || localStorage.getItem('tenant-override');
    if (override) return override;
  } catch {
    /* ignore */
  }
  if (!hostname || !hostname.endsWith(`.${APEX_DOMAIN}`)) return null;
  const subdomain = hostname.slice(0, hostname.length - `.${APEX_DOMAIN}`.length);
  if (!subdomain || subdomain.includes('.') || RESERVED_SUBDOMAINS.has(subdomain)) return null;
  return subdomain;
};

export const GLOBAL_ADMIN_SEGMENTS = new Set(['', 'eventos', 'usuarios', 'papeis', 'logs']);

export const EVENT_SCOPED_PREFIXES = new Set([
  'participants',
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
  'registration-metrics',
  'donations',
  'deleted-registrations',
  'chatbot',
  'institutional',
  'admin-fields',
  'minor-template',
  'uploads',
  'plan-tier',
  'recipient-onboarding',
  'platform-billing',
  'finance',
  'refunds',
  'boleto-installments',
  'backup',
  'store-orders',
  'workshops',
]);

export const getEventSlugFromPath = (pathname = window.location.pathname) => {
  const match = pathname.match(/^\/e\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const getEventSlug = () => getEventSlugFromPath() || localStorage.getItem(SELECTED_EVENT_KEY) || null;

export const setSelectedEventName = (name) => {
  if (name) localStorage.setItem(SELECTED_EVENT_NAME_KEY, name);
  else localStorage.removeItem(SELECTED_EVENT_NAME_KEY);
};

export const getEventName = () => {
  const stored = localStorage.getItem(SELECTED_EVENT_NAME_KEY);
  return stored || getEventSlug() || '';
};

export const adminSegmentFromPath = (pathname = window.location.pathname) => {
  const match = pathname.match(/^\/(?:admin|dev)(?:\/([^/?#]+))?/);
  return match ? { isAdmin: true, segment: match[1] || '' } : { isAdmin: false, segment: null };
};

export const setSelectedEvent = (slug, name) => {
  if (!slug) return;
  const previous = localStorage.getItem(SELECTED_EVENT_KEY);
  localStorage.setItem(SELECTED_EVENT_KEY, slug);
  if (name) localStorage.setItem(SELECTED_EVENT_NAME_KEY, name);
  else if (previous !== slug) localStorage.removeItem(SELECTED_EVENT_NAME_KEY);
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
