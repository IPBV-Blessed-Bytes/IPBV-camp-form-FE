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
