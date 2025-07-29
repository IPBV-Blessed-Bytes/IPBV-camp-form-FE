const isAdminPath = (pathname) => pathname.startsWith('/admin') || pathname === '/unauthorized';

const shouldRenderForm = (pathname) => {
  return (
    pathname !== '/opiniao' &&
    pathname !== '/verificacao' &&
    pathname !== '/verificacao/dados' &&
    pathname !== '/perguntas'
  );
};

export { isAdminPath, shouldRenderForm };
