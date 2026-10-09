import authFetcher from '@/fetchers/fetcherWithCredentials';

export const previewRetention = async () => {
  const { data } = await authFetcher.post('/scheduled-tasks/retention/preview');
  return data;
};
