import authFetcher from '@/fetchers/fetcherWithCredentials';
import fetcher from '@/fetchers';

export const getHomeInfo = async () => {
  const { data } = await authFetcher.get('/homepage-info');
  return data;
};

export const getPublicHomeInfo = async () => {
  const { data } = await fetcher.get('/homepage-info');
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
