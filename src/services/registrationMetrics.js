import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getCamperMetrics = async () => {
  const { data } = await authFetcher.get('/camper-metrics');
  return data;
};
