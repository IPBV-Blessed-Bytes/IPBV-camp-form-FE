import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listFaqs = async () => {
  const { data } = await fetcher.get('/faqs');
  return data?.faqs || [];
};

export const createFaq = async (payload) => {
  const { data } = await authFetcher.post('/faqs', payload);
  return data;
};

export const updateFaq = async (id, payload) => {
  const { data } = await authFetcher.put(`/faqs/${id}`, payload);
  return data;
};

export const deleteFaq = async (id) => {
  const { data } = await authFetcher.delete(`/faqs/${id}`);
  return data;
};
