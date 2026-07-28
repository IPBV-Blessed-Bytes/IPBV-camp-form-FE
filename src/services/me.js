import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getMyRegistrations = async () => {
  const { data } = await authFetcher.get('/me/registrations');
  return Array.isArray(data?.registrations) ? data.registrations : [];
};
