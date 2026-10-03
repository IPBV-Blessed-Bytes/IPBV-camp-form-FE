import fetcher from '@/fetchers';

export const getPaymentFees = async () => {
  const { data } = await fetcher.get('/payment-fees');
  return data;
};
