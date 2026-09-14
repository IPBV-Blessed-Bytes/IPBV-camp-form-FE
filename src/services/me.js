import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getMyRegistrations = async () => {
  const { data } = await authFetcher.get('/me/registrations');
  return Array.isArray(data?.registrations) ? data.registrations : [];
};

export const getMyRegistration = async (id) => {
  const { data } = await authFetcher.get(`/me/registrations/${id}`);
  return data;
};

export const createChangeRequest = async (id, payload, justification) => {
  const { data } = await authFetcher.post(`/me/registrations/${id}/change-request`, {
    data: payload,
    justification,
  });
  return data;
};

export const cancelPendingRegistration = async (id) => {
  await authFetcher.delete(`/me/registrations/pending/${id}`);
};

export const getMyChangeRequests = async () => {
  const { data } = await authFetcher.get('/me/change-requests');
  return Array.isArray(data?.changeRequests) ? data.changeRequests : [];
};

export const getInscriptionDraft = async () => {
  const { data } = await authFetcher.get('/me/inscription-draft');
  if (!data?.draft) return null;
  try {
    return typeof data.draft === 'string' ? JSON.parse(data.draft) : data.draft;
  } catch {
    return null;
  }
};

export const deleteInscriptionDraft = async () => {
  await authFetcher.delete('/me/inscription-draft');
};
