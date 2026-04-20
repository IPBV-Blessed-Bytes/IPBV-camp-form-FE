import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listRideOffers = async () => {
  const { data } = await authFetcher.get('/ride/offer');
  return data;
};

export const listRideNeeds = async () => {
  const { data } = await authFetcher.get('/ride/need');
  return data;
};

export const setRideChecked = async (id, checked) => {
  const { data } = await authFetcher.patch(`/ride/${id}`, { checked });
  return data;
};

export const matchRide = async (offerRideId, needRideId) => {
  const { data } = await authFetcher.put(`/ride/${offerRideId}/${needRideId}`);
  return data;
};

export const deleteRide = async (needRideId) => {
  const { data } = await authFetcher.delete(`/ride/${needRideId}`);
  return data;
};
