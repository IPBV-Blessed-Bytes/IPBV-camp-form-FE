import authFetcher from '@/fetchers/fetcherWithCredentials';

export const listTeams = async () => {
  const { data } = await authFetcher.get('/team');
  return data;
};

export const createTeam = async (payload) => {
  const { data } = await authFetcher.post('/team', payload);
  return data;
};

export const updateTeam = async (id, payload) => {
  const { data } = await authFetcher.patch(`/team/${id}`, payload);
  return data;
};

export const deleteTeam = async (id) => {
  const { data } = await authFetcher.delete(`/team/${id}`);
  return data;
};

export const assignCamperToTeam = async (payload) => {
  const { data } = await authFetcher.patch('/team/camper', payload);
  return data;
};

export const removeCamperFromTeam = async (camperId) => {
  const { data } = await authFetcher.delete(`/team/camper/${camperId}`);
  return data;
};
