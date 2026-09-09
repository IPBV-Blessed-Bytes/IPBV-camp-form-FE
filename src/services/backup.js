import authFetcher from '@/fetchers/fetcherWithCredentials';

export const exportBackup = async () => {
  const { data } = await authFetcher.get('/backup/export');
  return data;
};

export const emailBackup = async () => {
  const { data } = await authFetcher.post('/backup/email');
  return data;
};

export const getBackupConfig = async () => {
  const { data } = await authFetcher.get('/backup/config');
  return data;
};

export const saveBackupConfig = async (payload) => {
  const { data } = await authFetcher.put('/backup/config', payload);
  return data;
};

export const restoreBackup = async (payload) => {
  const { data } = await authFetcher.post('/backup/restore', payload);
  return data;
};
