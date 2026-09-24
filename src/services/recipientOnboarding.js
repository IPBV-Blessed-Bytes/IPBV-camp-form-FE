import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getRecipientStatus = async () => {
  const { data } = await authFetcher.get('/recipient-onboarding');
  return Boolean(data?.onboarded);
};

export const onboardRecipient = async (payload) => {
  const { data } = await authFetcher.post('/recipient-onboarding', payload);
  return data;
};
