import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getPlatformBillingStatus = async () => {
  const { data } = await authFetcher.get('/platform-billing/status');
  return data;
};

export const createPlatformCharge = async (payload) => {
  const { data } = await authFetcher.post('/platform-billing/charge', payload);
  return data;
};
