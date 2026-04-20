import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAggregates = async () => {
  const { data } = await authFetcher.get('/aggregate');
  return data;
};

export const listRooms = async () => {
  const { data } = await authFetcher.get('/aggregate/room');
  return data;
};

export const createRoom = async (payload) => {
  const { data } = await authFetcher.post('/aggregate', payload);
  return data;
};

export const updateRoom = async (roomId, payload) => {
  const { data } = await authFetcher.put(`/aggregate/${roomId}`, payload);
  return data;
};

export const renameRoom = async (roomId, payload) => {
  const { data } = await authFetcher.put(`/aggregate/name/${roomId}`, payload);
  return data;
};

export const deleteRoom = async (roomId, payload) => {
  const { data } = await authFetcher.delete(`/aggregate/${roomId}`, { data: payload });
  return data;
};

export const removeCamperFromRoom = async (camperId) => {
  const { data } = await authFetcher.delete(`/aggregate/room/${camperId}`);
  return data;
};
