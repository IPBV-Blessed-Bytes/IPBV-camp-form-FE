import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const uploadGuardianDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await fetcher.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return data;
};

export const openGuardianDocument = async (id) => {
  const { data } = await authFetcher.get(`/documents/${id}`, { responseType: 'blob' });
  const url = URL.createObjectURL(data);
  window.open(url, '_blank', 'noopener');
};
