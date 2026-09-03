import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAllRefunds = async () => {
  const { data } = await authFetcher.get('/refunds');
  return Array.isArray(data) ? data : [];
};
