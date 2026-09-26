import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getAdminTourDismissed = async () => {
  const { data } = await authFetcher.get('/me/tour');
  return !!data?.dismissed;
};

export const setAdminTourDismissed = async (dismissed) => {
  const { data } = await authFetcher.patch('/me/tour', { dismissed });
  return !!data?.dismissed;
};
