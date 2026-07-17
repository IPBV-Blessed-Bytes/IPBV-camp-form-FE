import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

// Consumo público: produtos ativos já com preço/vaga do lote ativo.
export const getProducts = async () => {
  const { data } = await fetcher.get('/products');
  return data;
};

// Admin: catálogo completo (inclui inativos) com preços por lote.
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

// Define preço + vaga de um produto em um lote específico.
export const setLotProductPrice = async (lotId, productId, payload) => {
  const { data } = await authFetcher.put(`/lots/${lotId}/products/${productId}`, payload);
  return data;
};
