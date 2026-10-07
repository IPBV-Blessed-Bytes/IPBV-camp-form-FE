import authFetcher from '@/fetchers/fetcherWithCredentials';

export const createGenericCheckout = async (payload) => {
  const { data } = await authFetcher.post('/checkout/generic', payload);
  return data;
};
