import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';
import { eventPath } from '@/config/eventScope';

export const productImageUrl = (id) => (id ? `${BASE_URL}${eventPath(`/products/${id}/image`)}` : '');

export const uploadProductImage = async (id, file) => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await authFetcher.post(`/products/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteProductImage = async (id) => {
  const { data } = await authFetcher.delete(`/products/${id}/image`);
  return data;
};

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

export const assignProductPackageCategory = async (productId, packageCategoryId) => {
  const { data } = await authFetcher.patch(`/products/${productId}/package-category`, { packageCategoryId });
  return data;
};
