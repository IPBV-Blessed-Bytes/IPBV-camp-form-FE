import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAdminSessions = async () => {
  const { data } = await authFetcher.get('/admin-sessions');
  return Array.isArray(data?.sessions) ? data.sessions : [];
};

export const updateAdminSession = async (sessionKey, payload) => {
  const { data } = await authFetcher.put(`/admin-sessions/${sessionKey}`, payload);
  return data;
};
