import authFetcher from '@/fetchers/fetcherWithCredentials';

export const submitFeedback = async (values) => {
  const { data } = await authFetcher.post('/feedback', values);
  return data;
};

export const listFeedback = async () => {
  const { data } = await authFetcher.get('/feedback');
  return data;
};

export const deleteAllFeedback = async () => {
  const { data } = await authFetcher.delete('/feedback');
  return data;
};
