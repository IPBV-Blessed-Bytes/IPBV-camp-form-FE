import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getRoles = async () => {
  const { data } = await authFetcher.get('/roles');
  return data;
};

export const getPermissions = async () => {
  const { data } = await authFetcher.get('/permissions');
  return data;
};

export const createRole = async (payload) => {
  const { data } = await authFetcher.post('/roles', payload);
  return data;
};

export const updateRole = async (id, payload) => {
  const { data } = await authFetcher.patch(`/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id) => {
  const { data } = await authFetcher.delete(`/roles/${id}`);
  return data;
};
