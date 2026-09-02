import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getBoletosByOrder = async (orderNumber) => {
  const { data } = await fetcher.get(`/boletos/order/${orderNumber}`);
  return Array.isArray(data) ? data : [];
};

export const listAllBoletos = async () => {
  const { data } = await authFetcher.get('/boletos');
  return Array.isArray(data) ? data : [];
};

export const updateBoletoDueDate = async (id, dueDate) => {
  const { data } = await authFetcher.patch(`/boletos/${id}/due-date`, { dueDate });
  return data;
};

export const cancelBoleto = async (id) => {
  const { data } = await authFetcher.post(`/boletos/${id}/cancel`);
  return data;
};

export const reissueBoleto = async (id, amount, dueDate) => {
  const { data } = await authFetcher.post(`/boletos/${id}/reissue`, { amount: String(amount), dueDate });
  return data;
};
