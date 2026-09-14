import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getChangeRequests = async () => {
  const { data } = await authFetcher.get('/change-requests');
  return Array.isArray(data?.changeRequests) ? data.changeRequests : [];
};

export const approveChangeRequest = async (id, note) => {
  const { data } = await authFetcher.post(`/change-requests/${id}/approve`, { note });
  return data;
};

export const rejectChangeRequest = async (id, note) => {
  const { data } = await authFetcher.post(`/change-requests/${id}/reject`, { note });
  return data;
};
