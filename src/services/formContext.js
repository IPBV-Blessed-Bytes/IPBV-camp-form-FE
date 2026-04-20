import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getFormContext = async () => {
  const { data } = await fetcher.get('/form-context');
  return data;
};

export const updateFormContext = async (formContext) => {
  const { data } = await authFetcher.put('/form-context', { formContext });
  return data;
};
