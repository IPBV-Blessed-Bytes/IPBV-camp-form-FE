import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getRegistrationMetrics = async () => {
  const { data } = await authFetcher.get('/registration-metrics');
  return data;
};
