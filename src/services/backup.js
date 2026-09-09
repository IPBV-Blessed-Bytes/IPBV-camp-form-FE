import authFetcher from '@/fetchers/fetcherWithCredentials';

export const exportBackup = async () => {
  const { data } = await authFetcher.get('/backup/export');
  return data;
};

export const emailBackup = async () => {
  const { data } = await authFetcher.post('/backup/email');
  return data;
};
