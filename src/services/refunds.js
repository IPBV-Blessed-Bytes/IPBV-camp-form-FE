import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAllRefunds = async () => {
  const { data } = await authFetcher.get('/refunds');
  return Array.isArray(data) ? data : [];
};

export const refundRegistration = async (registrationId, payload) => {
  const { data } = await authFetcher.post(`/refunds/${registrationId}`, payload);
  return data;
};
