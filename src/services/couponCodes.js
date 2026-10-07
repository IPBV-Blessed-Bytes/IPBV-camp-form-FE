import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const validateCouponCode = async ({ code, cpf }) => {
  const { data } = await fetcher.post('/coupon-codes/validate', { code, cpf });
  return data;
};

export const listCouponCodes = async () => {
  const { data } = await authFetcher.get('/coupon-codes');
  return data;
};

export const createCouponCode = async (payload) => {
  const { data } = await authFetcher.post('/coupon-codes', payload);
  return data;
};

export const updateCouponCode = async (id, payload) => {
  const { data } = await authFetcher.put(`/coupon-codes/${id}`, payload);
  return data;
};

export const deleteCouponCode = async (id) => {
  const { data } = await authFetcher.delete(`/coupon-codes/${id}`);
  return data;
};
