import { useQuery } from '@tanstack/react-query';

import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import { listCampers } from '@/services/campers';

export const CAMPERS_QUERY_KEY = ['campers'];

const EMPTY_CAMPERS = [];

export const fetchCampersList = async () => {
  const response = await listCampers({ size: MAX_SIZE_CAMPERS });
  if (!Array.isArray(response.content)) {
    console.error('Data received is not an array:', response);
    return EMPTY_CAMPERS;
  }
  return response.content;
};

export const useCampersList = (options = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: CAMPERS_QUERY_KEY,
    queryFn: fetchCampersList,
    ...options,
  });

  return { campers: data ?? EMPTY_CAMPERS, isLoading, isError, refetch };
};
