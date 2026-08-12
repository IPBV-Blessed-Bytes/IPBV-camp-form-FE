import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listEvents = async () => {
  const { data } = await fetcher.get('/events');
  return data?.events || [];
};

export const getEvent = async (slug) => {
  const { data } = await fetcher.get(`/events/${slug}`);
  return data;
};

export const listAllEvents = async () => {
  const { data } = await authFetcher.get('/events/all');
  return data?.events || [];
};

export const createEvent = async (payload) => {
  const { data } = await authFetcher.post('/events', payload);
  return data;
};

export const updateEvent = async (id, payload) => {
  const { data } = await authFetcher.put(`/events/${id}`, payload);
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await authFetcher.delete(`/events/${id}`);
  return data;
};
