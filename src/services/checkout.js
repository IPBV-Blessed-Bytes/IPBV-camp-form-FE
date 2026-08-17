import authFetcher from '@/fetchers/fetcherWithCredentials';

export const createCheckout = (payload) => authFetcher.post('/checkout/create', payload);

export const createGenericCheckout = async (payload) => {
  const { data } = await authFetcher.post('/checkout/generic', payload);
  return data;
};
