import authFetcher from '@/fetchers/fetcherWithCredentials';

export const getMyBoletos = async () => {
  const { data } = await authFetcher.get('/boleto-installments/mine');
  return Array.isArray(data) ? data : [];
};

export const getBoletosByOrder = async (orderNumber) => {
  const { data } = await authFetcher.get(`/boleto-installments/order/${orderNumber}`);
  return Array.isArray(data) ? data : [];
};

export const listAllBoletos = async () => {
  const { data } = await authFetcher.get('/boleto-installments/admin');
  return Array.isArray(data) ? data : [];
};

export const updateBoletoDueDate = async (id, dueDate) => {
  const { data } = await authFetcher.patch(`/boleto-installments/${id}/due-date`, { dueDate });
  return data;
};

export const cancelBoleto = async (id) => {
  const { data } = await authFetcher.post(`/boleto-installments/${id}/cancel`);
  return data;
};

export const reissueBoleto = async (id, amount, dueDate) => {
  const { data } = await authFetcher.post(`/boleto-installments/${id}/reissue`, { amount: String(amount), dueDate });
  return data;
};
