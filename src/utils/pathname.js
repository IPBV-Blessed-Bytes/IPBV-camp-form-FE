import { getEventSlugFromPath, stripEventPrefix } from '@/config/eventScope';

const isAdminPath = (pathname) =>
  pathname.startsWith('/admin') || pathname.startsWith('/dev') || pathname === '/unauthorized';

const FORM_SUBROUTES_WITHOUT_SKELETON = ['/opiniao', '/verificacao', '/verificacao/dados', '/perguntas'];

const shouldRenderForm = (pathname) => {
  if (!getEventSlugFromPath(pathname)) return false;
  return !FORM_SUBROUTES_WITHOUT_SKELETON.includes(stripEventPrefix(pathname));
};

export { isAdminPath, shouldRenderForm };
