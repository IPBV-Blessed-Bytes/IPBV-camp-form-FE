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

export const getSubmissionsByOrder = async (orderNumber) => {
  const { data } = await fetcher.get(`/submissions/order/${orderNumber}`);
  return data?.submissions || [];
};

export const checkinSubmission = async (id, value = true) => {
  const { data } = await fetcher.post(`/submissions/${id}/checkin`, { checkin: value });
  return data;
};

export const checkinOrder = async (orderNumber) => {
  const { data } = await fetcher.post(`/submissions/order/${orderNumber}/checkin`);
  return data?.submissions || [];
};
