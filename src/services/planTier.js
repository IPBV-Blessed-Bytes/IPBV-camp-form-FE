import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getPlanTier = async () => {
  const { data } = await authFetcher.get('/plan-tier');
  return data?.tier || 'completo';
};
