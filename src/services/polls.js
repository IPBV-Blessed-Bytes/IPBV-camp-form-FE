import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';

export const listPolls = async () => {
  const { data } = await authFetcher.get('/polls');
  return data;
};

export const createPoll = async (title) => {
  const { data } = await authFetcher.post('/polls', { title });
  return data;
};

export const updatePoll = async (id, payload) => {
  const { data } = await authFetcher.put(`/polls/${id}`, payload);
  return data;
};

export const deletePoll = async (id) => {
  const { data } = await authFetcher.delete(`/polls/${id}`);
  return data;
};

export const addPollOption = async (pollId, label, file) => {
  const formData = new FormData();
  formData.append('label', label);
  if (file) formData.append('file', file);
  const { data } = await authFetcher.post(`/polls/${pollId}/options`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deletePollOption = async (optionId) => {
  const { data } = await authFetcher.delete(`/polls/options/${optionId}`);
  return data;
};

export const getPollResults = async (id) => {
  const { data } = await authFetcher.get(`/polls/${id}/results`);
  return data;
};

export const getActivePolls = async () => {
  const { data } = await fetcher.get('/polls/active');
  return data;
};

export const votePoll = async (pollId, optionId, voterToken) => {
  const { data } = await fetcher.post(`/polls/${pollId}/vote`, { optionId, voterToken });
  return data;
};

export const pollOptionImageUrl = (optionId) => `${BASE_URL}/polls/options/${optionId}/image`;
