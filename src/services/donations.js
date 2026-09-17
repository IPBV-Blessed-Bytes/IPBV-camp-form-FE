import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAllDonations = async () => {
  const { data } = await authFetcher.get('/donations');
  return Array.isArray(data) ? data : [];
};

export const createManualDonation = async (payload) => {
  const { data } = await authFetcher.post('/donations', payload);
  return data;
};
