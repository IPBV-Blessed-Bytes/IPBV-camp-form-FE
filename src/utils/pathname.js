const isAdminPath = (pathname) =>
  pathname.startsWith('/admin') || pathname.startsWith('/dev') || pathname === '/unauthorized';

const shouldRenderForm = (pathname) => {
  return (
    pathname !== '/opiniao' &&
    pathname !== '/verificacao' &&
    pathname !== '/verificacao/dados' &&
    pathname !== '/perguntas' &&
    pathname !== '/esqueci-senha' &&
    pathname !== '/reset-password' &&
    pathname !== '/unlock'
  );
};

export { isAdminPath, shouldRenderForm };
