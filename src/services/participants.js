import fetcher from '@/fetchers';
import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listParticipants = async (params, options = {}) => {
  const { data } = await authFetcher.get('/participants', { params, ...options });
  return data;
};

export const createParticipant = async (payload) => {
  const { data } = await authFetcher.post('/participants', payload);
  return data;
};

export const bulkImportParticipants = async (payload) => {
  const { data } = await authFetcher.post('/participants/bulk-import', payload);
  return data;
};

export const updateParticipant = async (id, payload) => {
  const { data } = await authFetcher.put(`/participants/${id}`, payload);
  return data;
};

export const deleteParticipant = async (id) => {
  const { data } = await authFetcher.delete(`/participants/${id}`);
  return data;
};

export const deleteParticipants = async (ids) => {
  await Promise.all(ids.map((id) => authFetcher.delete(`/participants/${id}`)));
};

export const checkinParticipant = async (id, payload) => {
  const { data } = await authFetcher.patch(`/participants/checkin/${id}`, payload);
  return data;
};

export const getPersonData = async (payload) => {
  const { data } = await authFetcher.post('/participants/get-person-data', payload);
  return data;
};

export const saveFinalObservation = async ({ cpf, text }) => {
  const { data } = await fetcher.post('/participants/finalObservation', { cpf, text });
  return data;
};

export const getUserPreviousYear = async ({ cpf, birthday }) => {
  const { data } = await fetcher.post('/participants/user-previous-year', { cpf, birthday });
  return data;
};

export const deleteUserPreviousYear = async (cpf, birthday) => {
  const { data } = await fetcher.delete(`/participants/user-previous-year/${cpf}`, {
    params: { birthday },
  });
  return data;
};
