import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getLots = async () => {
  const { data } = await fetcher.get('/lots');
  return data;
};

export const getLotsAuthenticated = async () => {
  const { data } = await authFetcher.get('/lots');
  return data;
};

export const createLot = async (payload) => {
  const { data } = await authFetcher.post('/lots', payload);
  return data;
};

export const updateLot = async (id, payload) => {
  const { data } = await authFetcher.patch(`/lots/${id}`, payload);
  return data;
};

export const deleteLot = async (id) => {
  const { data } = await authFetcher.delete(`/lots/${id}`);
  return data;
};
