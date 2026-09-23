import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';
import { getEventSlug } from '@/config/eventScope';

export const getMinorTemplateExists = async () => {
  const { data } = await fetcher.get('/minor-template/exists');
  return Boolean(data?.exists);
};

export const uploadMinorTemplate = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await authFetcher.post('/minor-template', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteMinorTemplate = async () => {
  const { data } = await authFetcher.delete('/minor-template');
  return data;
};

export const minorTemplateDownloadUrl = () => {
  const slug = getEventSlug();
  return slug ? `${BASE_URL}/e/${slug}/minor-template` : '';
};
