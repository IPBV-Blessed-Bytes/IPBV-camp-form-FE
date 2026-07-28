import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getMyRegistrations = async () => {
  const { data } = await authFetcher.get('/me/registrations');
  return Array.isArray(data?.registrations) ? data.registrations : [];
};

export const getMyRegistration = async (id) => {
  const { data } = await authFetcher.get(`/me/registrations/${id}`);
  return data;
};

export const createChangeRequest = async (id, payload) => {
  const { data } = await authFetcher.post(`/me/registrations/${id}/change-request`, payload);
  return data;
};

export const getMyChangeRequests = async () => {
  const { data } = await authFetcher.get('/me/change-requests');
  return Array.isArray(data?.changeRequests) ? data.changeRequests : [];
};
