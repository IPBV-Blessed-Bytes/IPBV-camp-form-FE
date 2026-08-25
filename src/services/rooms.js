import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listAggregates = async () => {
  const { data } = await authFetcher.get('/rooms');
  return data;
};

export const listRooms = async () => {
  const { data } = await authFetcher.get('/rooms/room');
  return data;
};

export const createRoom = async (payload) => {
  const { data } = await authFetcher.post('/rooms', payload);
  return data;
};

export const reorderRooms = async (orderedIds) => {
  const { data } = await authFetcher.put('/rooms/reorder', { orderedIds });
  return data;
};

export const updateRoom = async (roomId, payload) => {
  const { data } = await authFetcher.put(`/rooms/${roomId}`, payload);
  return data;
};

export const renameRoom = async (roomId, payload) => {
  const { data } = await authFetcher.put(`/rooms/name/${roomId}`, payload);
  return data;
};

export const deleteRoom = async (roomId, payload) => {
  const { data } = await authFetcher.delete(`/rooms/${roomId}`, { data: payload });
  return data;
};

export const removeCamperFromRoom = async (camperId) => {
  const { data } = await authFetcher.delete(`/rooms/room/${camperId}`);
  return data;
};
