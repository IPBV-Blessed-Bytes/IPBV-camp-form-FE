import fetcher from '@/fetchers';

export const createCheckout = (payload) => fetcher.post('/checkout/create', payload);
