import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listDeletedCampers = async () => {
  const { data } = await authFetcher.get('/deleted-campers');
  return Array.isArray(data) ? data : [];
};

export const restoreDeletedCamper = async (id) => {
  const { data } = await authFetcher.post(`/deleted-campers/${id}/restore`);
  return data;
};

export const purgeDeletedCamper = async (id) => {
  const { data } = await authFetcher.delete(`/deleted-campers/${id}`);
  return data;
};
