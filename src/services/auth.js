import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const login = async ({ login, password }) => {
  const { data } = await fetcher.post('/auth/login', { login, password });
  return data;
};

// Permissões do usuário logado. O BE retorna um array puro de strings
// (["PRODUCTS_READ", ...]); tolera também { permissions: [...] }.
export const getMyPermissions = async () => {
  const { data } = await authFetcher.get('/auth/me/permissions');
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.permissions) ? data.permissions : [];
};
