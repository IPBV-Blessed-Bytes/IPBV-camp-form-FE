import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listFormSections = async () => {
  const { data } = await fetcher.get('/sections');
  return data?.sections || [];
};

export const createFormSection = async (payload) => {
  const { data } = await authFetcher.post('/sections', payload);
  return data;
};

export const updateFormSection = async (id, payload) => {
  const { data } = await authFetcher.put(`/sections/${id}`, payload);
  return data;
};

export const deleteFormSection = async (id) => {
  const { data } = await authFetcher.delete(`/sections/${id}`);
  return data;
};
