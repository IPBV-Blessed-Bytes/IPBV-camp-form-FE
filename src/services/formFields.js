import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listFormFields = async () => {
  const { data } = await fetcher.get('/form-fields');
  return data?.fields || [];
};

export const createFormField = async (payload) => {
  const { data } = await authFetcher.post('/form-fields', payload);
  return data;
};

export const updateFormField = async (id, payload) => {
  const { data } = await authFetcher.put(`/form-fields/${id}`, payload);
  return data;
};

export const deleteFormField = async (id) => {
  const { data } = await authFetcher.delete(`/form-fields/${id}`);
  return data;
};
