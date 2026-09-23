import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAdminFields = async () => {
  const { data } = await authFetcher.get('/admin-fields');
  return data?.fields || [];
};

export const createAdminField = async (payload) => {
  const { data } = await authFetcher.post('/admin-fields', payload);
  return data;
};

export const updateAdminField = async (id, payload) => {
  const { data } = await authFetcher.put(`/admin-fields/${id}`, payload);
  return data;
};

export const deleteAdminField = async (id) => {
  const { data } = await authFetcher.delete(`/admin-fields/${id}`);
  return data;
};

export const updateSubmissionAdminAnswers = async (id, adminAnswers) => {
  const { data } = await authFetcher.put(`/submissions/${id}/admin-answers`, { adminAnswers });
  return data;
};
