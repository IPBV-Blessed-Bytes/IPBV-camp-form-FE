import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';
import { getEventSlug } from '@/config/eventScope';

export const uploadRegistrationFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await authFetcher.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const registrationFileUrl = (id) => {
  const slug = getEventSlug();
  return slug && id ? `${BASE_URL}/e/${slug}/uploads/${id}` : '';
};
