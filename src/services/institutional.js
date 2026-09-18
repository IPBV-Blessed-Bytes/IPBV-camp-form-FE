import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';

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

export const institutionalImageUrl = (id) => (id ? `${BASE_URL}/institutional/images/${id}` : '');
