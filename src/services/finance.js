import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getFinanceOverview = async () => {
  const { data } = await authFetcher.get('/finance/overview');
  return data;
};
