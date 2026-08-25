import fetcher from '@/fetchers/fetcherWithCredentials';

export const createSubmission = async (payload) => {
  const { data } = await fetcher.post('/submissions', payload);
  return data;
};

export const listSubmissions = async () => {
  const { data } = await fetcher.get('/submissions');
  return data?.submissions || [];
};

export const updateSubmission = async (id, payload) => {
  const { data } = await fetcher.put(`/submissions/${id}`, payload);
  return data;
};

export const deleteSubmission = async (id) => {
  const { data } = await fetcher.delete(`/submissions/${id}`);
  return data;
};
