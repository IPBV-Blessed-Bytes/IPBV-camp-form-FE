import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const checkCoupon = async ({ cpf, birthday }) => {
  const { data } = await fetcher.post('/coupon/check', { cpf, birthday });
  return data;
};

export const listCoupons = async () => {
  const { data } = await authFetcher.get('/coupon');
  return data;
};

export const createCoupon = async (payload) => {
  const { data } = await authFetcher.post('/coupon/create', payload);
  return data;
};

export const updateCoupon = async (id, payload) => {
  const { data } = await authFetcher.put(`/coupon/${id}`, payload);
  return data;
};

export const deleteCoupon = async (id, payload) => {
  const { data } = await authFetcher.delete(`/coupon/${id}`, { data: payload });
  return data;
};
