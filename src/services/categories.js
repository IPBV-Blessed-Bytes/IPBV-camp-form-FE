import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getCategories = async () => {
  const { data } = await fetcher.get('/categories');
  return Array.isArray(data?.categories) ? data.categories : [];
};

export const getCategoriesAll = async () => {
  const { data } = await authFetcher.get('/categories/all');
  return Array.isArray(data?.categories) ? data.categories : [];
};

export const createCategory = async (payload) => {
  const { data } = await authFetcher.post('/categories', payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await authFetcher.patch(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await authFetcher.delete(`/categories/${id}`);
  return data;
};
