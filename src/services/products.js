import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';

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

export const uploadProductImage = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await authFetcher.post(`/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return data;
};

export const deleteProductImage = async (id) => {
  const { data } = await authFetcher.delete(`/products/${id}/image`);
  return data;
};

export const productImageUrl = (id) => (id ? `${BASE_URL}/products/${id}/image` : '');
