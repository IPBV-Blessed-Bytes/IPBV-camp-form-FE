import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listPackageCategories = async () => {
  const { data } = await fetcher.get('/package-categories');
  return data?.categories || [];
};

export const createPackageCategory = async (payload) => {
  const { data } = await authFetcher.post('/package-categories', payload);
  return data;
};

export const updatePackageCategory = async (id, payload) => {
  const { data } = await authFetcher.put(`/package-categories/${id}`, payload);
  return data;
};

export const deletePackageCategory = async (id) => {
  const { data } = await authFetcher.delete(`/package-categories/${id}`);
  return data;
};
