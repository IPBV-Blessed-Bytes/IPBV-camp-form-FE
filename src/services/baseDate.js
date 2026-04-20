import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getBaseDate = async () => {
  const { data } = await authFetcher.get('/base-date');
  return data;
};

export const createBaseDate = async (baseDate) => {
  const { data } = await authFetcher.post('/base-date', { baseDate });
  return data;
};

export const updateBaseDate = async (baseDate) => {
  const { data } = await authFetcher.put('/base-date', { baseDate });
  return data;
};
