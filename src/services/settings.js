import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getSetting = async (key) => {
  const { data } = await authFetcher.get(`/settings/${key}`);
  return data?.value ?? '';
};

export const getPublicSetting = async (key) => {
  const { data } = await fetcher.get(`/settings/public/${key}`);
  return data?.value ?? '';
};

export const updateSetting = async (key, value) => {
  const { data } = await authFetcher.put(`/settings/${key}`, { value });
  return data?.value ?? '';
};
