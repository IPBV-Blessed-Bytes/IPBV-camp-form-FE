import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getNonPayingChildren = async () => {
  const { data } = await authFetcher.get('/non-paying-children');
  return data;
};

export const getCrewBus = async () => {
  const { data } = await authFetcher.get('/crew-bus');
  return data;
};
