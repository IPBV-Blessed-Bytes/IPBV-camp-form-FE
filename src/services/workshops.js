import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listPublicWorkshops = async () => {
  const { data } = await fetcher.get('/workshops');
  return data;
};

export const listAllWorkshops = async () => {
  const { data } = await authFetcher.get('/workshops/all');
  return data;
};

export const getWorkshopSettings = async () => {
  const { data } = await authFetcher.get('/workshops/settings');
  return data;
};

export const updateWorkshopSettings = async (payload) => {
  const { data } = await authFetcher.put('/workshops/settings', payload);
  return data;
};

export const createWorkshop = async (payload) => {
  const { data } = await authFetcher.post('/workshops', payload);
  return data;
};

export const updateWorkshop = async (id, payload) => {
  const { data } = await authFetcher.patch(`/workshops/${id}`, payload);
  return data;
};

export const deleteWorkshop = async (id) => {
  const { data } = await authFetcher.delete(`/workshops/${id}`);
  return data;
};

export const getWorkshopRegistrations = async (id) => {
  const { data } = await authFetcher.get(`/workshops/${id}/registrations`);
  return data;
};
