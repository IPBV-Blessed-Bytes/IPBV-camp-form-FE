import fetcher from '@/fetchers';

export const listEvents = async () => {
  const { data } = await fetcher.get('/events');
  return data;
};

export const getEvent = async (slug) => {
  const { data } = await fetcher.get(`/events/${slug}`);
  return data;
};
