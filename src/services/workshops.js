import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';

export const getActiveWorkshops = async () => {
  const { data } = await fetcher.get('/workshops/active');
  return data;
};

export const workshopImageUrl = (id) => `${BASE_URL}/workshops/${id}/image`;

export const registerWorkshops = async (payload) => {
  const { data } = await authFetcher.post('/workshops/register', payload);
  return data;
};

export const getMyWorkshops = async () => {
  const { data } = await authFetcher.get('/workshops/my');
  return data;
};

export const listWorkshops = async () => {
  const { data } = await authFetcher.get('/workshops');
  return data;
};

export const createWorkshop = async (payload) => {
  const { data } = await authFetcher.post('/workshops', payload);
  return data;
};

export const updateWorkshop = async (id, payload) => {
  const { data } = await authFetcher.put(`/workshops/${id}`, payload);
  return data;
};

export const deleteWorkshop = async (id) => {
  const { data } = await authFetcher.delete(`/workshops/${id}`);
  return data;
};

export const getWorkshopRegistrations = async (id) => {
  const { data } = await authFetcher.get(`/workshops/${id}/registrations`);
  return data;
};

export const uploadWorkshopImage = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await authFetcher.post(`/workshops/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteWorkshopImage = async (id) => {
  const { data } = await authFetcher.delete(`/workshops/${id}/image`);
  return data;
};
