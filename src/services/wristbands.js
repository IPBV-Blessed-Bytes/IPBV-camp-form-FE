import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listWristbands = async (params, options = {}) => {
  const { data } = await authFetcher.get('/user-wristbands', { params, ...options });
  return data;
};

export const createWristband = async (payload) => {
  const { data } = await authFetcher.post('/user-wristbands', payload);
  return data;
};

export const updateWristband = async (id, payload) => {
  const { data } = await authFetcher.patch(`/user-wristbands/${id}`, payload);
  return data;
};

export const deleteWristband = async (id) => {
  const { data } = await authFetcher.delete(`/user-wristbands/${id}`);
  return data;
};
