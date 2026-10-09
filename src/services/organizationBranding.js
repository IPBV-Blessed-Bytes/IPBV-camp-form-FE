import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';
import { compressImage } from '@/utils/compressImage';

export const orgLogoUrl = (slug) => (slug ? `${BASE_URL}/organizations/${slug}/logo` : '');

export const getOrgBranding = async () => {
  const { data } = await authFetcher.get('/organization/branding');
  return data;
};

export const updateOrgBranding = async (payload) => {
  const { data } = await authFetcher.put('/organization/branding', payload);
  return data;
};

export const uploadOrgLogo = async (file) => {
  const formData = new FormData();
  formData.append('file', await compressImage(file));
  const { data } = await authFetcher.post('/organization/branding/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return data;
};

export const deleteOrgLogo = async () => {
  const { data } = await authFetcher.delete('/organization/branding/logo');
  return data;
};
