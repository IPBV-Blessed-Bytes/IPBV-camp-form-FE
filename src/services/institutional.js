import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';
import { getEventSlug } from '@/config/eventScope';

export const getInstitutionalContent = async () => {
  const { data } = await fetcher.get('/institutional/content');
  return data && typeof data === 'object' ? data : {};
};

export const updateInstitutionalContent = async (content) => {
  const { data } = await authFetcher.put('/institutional/content', content);
  return data;
};

export const uploadInstitutionalImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await authFetcher.post('/institutional/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return data;
};

export const deleteInstitutionalImage = async (id) => {
  const { data } = await authFetcher.delete(`/institutional/images/${id}`);
  return data;
};

export const institutionalImageUrl = (id) => {
  if (!id) return '';
  const slug = getEventSlug();
  return slug ? `${BASE_URL}/e/${slug}/institutional/images/${id}` : `${BASE_URL}/institutional/images/${id}`;
};

export const registerInstitutionalVisit = async () => {
  const { data } = await fetcher.post('/institutional/visit');
  return data?.count ?? null;
};
