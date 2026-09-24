import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getPlatformMe = async () => {
  const { data } = await authFetcher.get('/platform/me');
  return data;
};

export const listPlatformOrganizations = async () => {
  const { data } = await authFetcher.get('/platform/organizations');
  return data?.organizations || [];
};

export const createPlatformOrganization = async (payload) => {
  const { data } = await authFetcher.post('/platform/organizations', payload);
  return data;
};

export const updatePlatformOrganization = async (id, payload) => {
  const { data } = await authFetcher.put(`/platform/organizations/${id}`, payload);
  return data;
};

export const regularizePlatformOrganization = async (id, periodDays) => {
  const { data } = await authFetcher.post(`/platform/organizations/${id}/regularize`, periodDays ? { periodDays } : {});
  return data;
};

export const getPlatformStats = async () => {
  const { data } = await authFetcher.get('/platform/stats');
  return data;
};

export const getPlatformBillingOverview = async () => {
  const { data } = await authFetcher.get('/platform/billing-overview');
  return data;
};

export const platformSignup = async (payload) => {
  const { data } = await fetcher.post('/platform/signup', payload);
  return data;
};

export const getPlatformSettings = async () => {
  const { data } = await fetcher.get('/platform/settings');
  return data;
};

export const updatePlatformSettings = async (payload) => {
  const { data } = await authFetcher.put('/platform/settings', payload);
  return data;
};

export const listPlatformFaqs = async () => {
  const { data } = await fetcher.get('/platform/faqs');
  return data?.faqs || [];
};

export const createPlatformFaq = async (payload) => {
  const { data } = await authFetcher.post('/platform/faqs', payload);
  return data;
};

export const updatePlatformFaq = async (id, payload) => {
  const { data } = await authFetcher.put(`/platform/faqs/${id}`, payload);
  return data;
};

export const deletePlatformFaq = async (id) => {
  const { data } = await authFetcher.delete(`/platform/faqs/${id}`);
  return data;
};
