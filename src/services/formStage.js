import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getFormStage = async () => {
  const { data } = await fetcher.get('/form-stage');
  return data;
};

export const updateFormStage = async (formStage) => {
  const { data } = await authFetcher.put('/form-stage', { formStage });
  return data;
};
