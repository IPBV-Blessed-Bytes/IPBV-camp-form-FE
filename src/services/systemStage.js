import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getSystemStage = async () => {
  const { data } = await fetcher.get('/system/stage');
  return data;
};

export const updateSystemStage = async (payload) => {
  const { data } = await authFetcher.put('/system/stage', payload);
  return data;
};
