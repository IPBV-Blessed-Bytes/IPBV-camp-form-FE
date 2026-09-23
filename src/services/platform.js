import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getPlatformMe = async () => {
  const { data } = await authFetcher.get('/platform/me');
  return data;
};

export const listPlatformOrganizations = async () => {
  const { data } = await authFetcher.get('/platform/organizations');
  return data?.organizations || [];
};

export const createPlatformOrganization = async (payload) => {
  const { data } = await authFetcher.post('/platform/organizations', payload);
  return data;
};

export const updatePlatformOrganization = async (id, payload) => {
  const { data } = await authFetcher.put(`/platform/organizations/${id}`, payload);
  return data;
};

export const getPlatformStats = async () => {
  const { data } = await authFetcher.get('/platform/stats');
  return data;
};

export const platformSignup = async (payload) => {
  const { data } = await fetcher.post('/platform/signup', payload);
  return data;
};
