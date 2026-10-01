import { useQuery } from '@tanstack/react-query';

import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import { listParticipants } from '@/services/participants';

export const CAMPERS_QUERY_KEY = ['campers'];

const EMPTY_CAMPERS = [];

export const fetchParticipantsList = async () => {
  const response = await listParticipants({ size: MAX_SIZE_CAMPERS });
  if (!Array.isArray(response.content)) {
    console.error('Data received is not an array:', response);
    return EMPTY_CAMPERS;
  }
  return response.content;
};

export const useParticipantsList = (options = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: CAMPERS_QUERY_KEY,
    queryFn: fetchParticipantsList,
    ...options,
  });

  return { campers: data ?? EMPTY_CAMPERS, isLoading, isError, refetch };
};
