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
    pathname !== '/unlock' &&
    pathname !== '/criar-conta' &&
    pathname !== '/entrar' &&
    pathname !== '/confirmar-email' &&
    pathname !== '/minha-conta' &&
    pathname !== '/minha-conta/boletos'
  );
};

export { isAdminPath, shouldRenderForm };
