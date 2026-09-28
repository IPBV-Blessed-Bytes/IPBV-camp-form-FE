import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getStoreOrders = async () => {
  const { data } = await authFetcher.get('/store/orders');
  return {
    orders: Array.isArray(data?.orders) ? data.orders : [],
    summary: Array.isArray(data?.summary) ? data.summary : [],
  };
};
