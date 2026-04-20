import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getHomeInfo = async () => {
  const { data } = await authFetcher.get('/homepage-info');
  return data;
};

export const createHomeInfo = async (payload) => {
  const { data } = await authFetcher.post('/homepage-info', payload);
  return data;
};

export const updateHomeInfo = async (payload) => {
  const { data } = await authFetcher.put('/homepage-info', payload);
  return data;
};

export const deleteHomeInfo = async () => {
  const { data } = await authFetcher.delete('/homepage-info');
  return data;
};

export const deleteOnDemandHomeInfo = async (payload) => {
  const { data } = await authFetcher.delete('/homepage-info/on-demand', { data: payload });
  return data;
};
