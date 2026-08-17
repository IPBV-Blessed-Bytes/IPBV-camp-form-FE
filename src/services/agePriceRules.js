import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAgePriceRules = async () => {
  const { data } = await fetcher.get('/age-price-rules');
  return data?.rules || [];
};

export const createAgePriceRule = async (payload) => {
  const { data } = await authFetcher.post('/age-price-rules', payload);
  return data;
};

export const updateAgePriceRule = async (id, payload) => {
  const { data } = await authFetcher.put(`/age-price-rules/${id}`, payload);
  return data;
};

export const deleteAgePriceRule = async (id) => {
  const { data } = await authFetcher.delete(`/age-price-rules/${id}`);
  return data;
};
