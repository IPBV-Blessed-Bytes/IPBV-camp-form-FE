import fetcher from '@/fetchers/fetcherWithCredentials';

export const createSubmission = async (payload) => {
  const { data } = await fetcher.post('/submissions', payload);
  return data;
};

export const listSubmissions = async () => {
  const { data } = await fetcher.get('/submissions');
  return data?.submissions || [];
};
