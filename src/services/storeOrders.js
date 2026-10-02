import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listStoreOrders = async () => {
  const { data } = await authFetcher.get('/store-orders');
  return Array.isArray(data) ? data : [];
};

export const getProductSales = async () => {
  const { data } = await authFetcher.get('/store-orders/summary');
  return Array.isArray(data) ? data : [];
};
