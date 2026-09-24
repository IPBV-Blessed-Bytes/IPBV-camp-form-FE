import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getRecipientStatus = async () => {
  const { data } = await authFetcher.get('/recipient-onboarding');
  return Boolean(data?.onboarded);
};

export const getRecipientOnboardingStatus = async () => {
  const { data } = await authFetcher.get('/recipient-onboarding');
  return {
    onboarded: Boolean(data?.onboarded),
    required: Boolean(data?.required),
  };
};

export const onboardRecipient = async (payload) => {
  const { data } = await authFetcher.post('/recipient-onboarding', payload);
  return data;
};
