import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getProducts = async () => {
  const { data } = await fetcher.get('/products');
  return data;
};

export const getAllProducts = async () => {
  const { data } = await authFetcher.get('/products/all');
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await authFetcher.post('/products', payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await authFetcher.patch(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await authFetcher.delete(`/products/${id}`);
  return data;
};

export const setLotProductPrice = async (lotId, productId, payload) => {
  const { data } = await authFetcher.put(`/lots/${lotId}/products/${productId}`, payload);
  return data;
};
