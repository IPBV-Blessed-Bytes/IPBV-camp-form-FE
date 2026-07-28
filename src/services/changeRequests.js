import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getChangeRequests = async () => {
  const { data } = await authFetcher.get('/change-requests');
  return Array.isArray(data?.changeRequests) ? data.changeRequests : [];
};

export const approveChangeRequest = async (id) => {
  const { data } = await authFetcher.post(`/change-requests/${id}/approve`);
  return data;
};

export const rejectChangeRequest = async (id) => {
  const { data } = await authFetcher.post(`/change-requests/${id}/reject`);
  return data;
};
