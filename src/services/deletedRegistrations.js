import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listDeletedRegistrations = async () => {
  const { data } = await authFetcher.get('/deleted-registrations');
  return Array.isArray(data) ? data : [];
};

export const restoreDeletedRegistration = async (id) => {
  const { data } = await authFetcher.post(`/deleted-registrations/${id}/restore`);
  return data;
};

export const purgeDeletedRegistration = async (id) => {
  const { data } = await authFetcher.delete(`/deleted-registrations/${id}`);
  return data;
};
