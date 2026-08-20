import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listFaqs = async () => {
  const { data } = await fetcher.get('/faq');
  return data?.faqs || [];
};

export const createFaq = async (payload) => {
  const { data } = await authFetcher.post('/faq', payload);
  return data;
};

export const updateFaq = async (id, payload) => {
  const { data } = await authFetcher.put(`/faq/${id}`, payload);
  return data;
};

export const deleteFaq = async (id) => {
  const { data } = await authFetcher.delete(`/faq/${id}`);
  return data;
};
