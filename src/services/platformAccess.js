import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getPlatformPermissions = async () => {
  const { data } = await authFetcher.get('/platform/permissions');
  return data?.permissions || [];
};

export const getPlatformRoles = async () => {
  const { data } = await authFetcher.get('/platform/roles');
  return data?.roles || [];
};

export const createPlatformRole = async (payload) => {
  const { data } = await authFetcher.post('/platform/roles', payload);
  return data;
};

export const updatePlatformRole = async (id, payload) => {
  const { data } = await authFetcher.put(`/platform/roles/${id}`, payload);
  return data;
};

export const deletePlatformRole = async (id) => {
  const { data } = await authFetcher.delete(`/platform/roles/${id}`);
  return data;
};

export const getPlatformUsers = async () => {
  const { data } = await authFetcher.get('/platform/users');
  return data?.users || [];
};

export const grantPlatformAccess = async (payload) => {
  const { data } = await authFetcher.post('/platform/users', payload);
  return data;
};

export const setPlatformUserRole = async (id, platformRoleId) => {
  const { data } = await authFetcher.put(`/platform/users/${id}/role`, { platformRoleId });
  return data;
};

export const revokePlatformUser = async (id) => {
  const { data } = await authFetcher.delete(`/platform/users/${id}/role`);
  return data;
};
