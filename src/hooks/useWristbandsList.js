import { useQuery } from '@tanstack/react-query';

import { listWristbands } from '@/services/wristbands';

export const WRISTBANDS_QUERY_KEY = ['wristbands'];

const EMPTY_WRISTBANDS = [];

export const fetchWristbandsList = async () => {
  const data = await listWristbands();
  return Array.isArray(data) ? data : EMPTY_WRISTBANDS;
};

export const useWristbandsList = (options = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: WRISTBANDS_QUERY_KEY,
    queryFn: fetchWristbandsList,
    ...options,
  });

  return { wristbands: data ?? EMPTY_WRISTBANDS, isLoading, isError, refetch };
};
