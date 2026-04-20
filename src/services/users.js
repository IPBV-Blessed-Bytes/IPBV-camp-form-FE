import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listUsers = async () => {
  const { data } = await authFetcher.get('/users');
  return data;
};

export const createUser = async (payload) => {
  const { data } = await authFetcher.post('/users', payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await authFetcher.put(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await authFetcher.delete(`/users/${id}`);
  return data;
};
