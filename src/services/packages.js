import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getPackageCount = async () => {
  const { data } = await fetcher.get('/package-count');
  return data;
};

export const getTotalRegistrations = async () => {
  const { data } = await fetcher.get('/total-registrations');
  return data;
};

export const updatePackageCount = async (payload) => {
  const { data } = await authFetcher.put('/package-count', payload);
  return data;
};

export const updateTotalBusVacancies = async (payload) => {
  const { data } = await authFetcher.put('/package-count/total-bus-vacancies', payload);
  return data;
};
