import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAllDonations = async () => {
  const { data } = await authFetcher.get('/donations');
  return Array.isArray(data) ? data : [];
};
