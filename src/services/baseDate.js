import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getBaseDate = async () => {
  const { data } = await authFetcher.get('/base-date');
  return data;
};

export const getPublicBaseDate = async () => {
  const { data } = await fetcher.get('/base-date');
  return data;
};

export const createBaseDate = async (payload) => {
  const body = typeof payload === 'string' ? { baseDate: payload } : payload;
  const { data } = await authFetcher.post('/base-date', body);
  return data;
};

export const updateBaseDate = async (payload) => {
  const body = typeof payload === 'string' ? { baseDate: payload } : payload;
  const { data } = await authFetcher.put('/base-date', body);
  return data;
};
