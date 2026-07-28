import authFetcher from '@/fetchers/fetcherWithCredentials';

export const createCheckout = (payload) => authFetcher.post('/checkout/create', payload);
