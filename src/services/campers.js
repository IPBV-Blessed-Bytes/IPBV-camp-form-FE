import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listCampers = async (params, options = {}) => {
  const { data } = await authFetcher.get('/camper', { params, ...options });
  return data;
};

export const createCamper = async (payload) => {
  const { data } = await authFetcher.post('/camper', payload);
  return data;
};

export const updateCamper = async (id, payload) => {
  const { data } = await authFetcher.put(`/camper/${id}`, payload);
  return data;
};

export const deleteCamper = async (id) => {
  const { data } = await authFetcher.delete(`/camper/${id}`);
  return data;
};

export const deleteCampers = async (ids) => {
  await Promise.all(ids.map((id) => authFetcher.delete(`/camper/${id}`)));
};

export const checkinCamper = async (id, payload) => {
  const { data } = await authFetcher.patch(`/camper/checkin/${id}`, payload);
  return data;
};

export const getPersonData = async (payload) => {
  const { data } = await authFetcher.post('/camper/get-person-data', payload);
  return data;
};

export const saveConfirmationUserData = async ({ cpf, authorization }) => {
  const { data } = await fetcher.post('/camper/confirmationUserData', { cpf, authorization });
  return data;
};

export const saveFinalObservation = async ({ cpf, text }) => {
  const { data } = await fetcher.post('/camper/finalObservation', { cpf, text });
  return data;
};

export const getUserPreviousYear = async ({ cpf, birthday }) => {
  const { data } = await fetcher.post('/camper/user-previous-year', { cpf, birthday });
  return data;
};

export const deleteUserPreviousYear = async (cpf) => {
  const { data } = await fetcher.delete(`/camper/user-previous-year/${cpf}`);
  return data;
};
