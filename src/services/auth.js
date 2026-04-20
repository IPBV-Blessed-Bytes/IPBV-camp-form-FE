import fetcher from '@/fetchers';

export const login = async ({ login, password }) => {
  const { data } = await fetcher.post('/auth/login', { login, password });
  return data;
};
