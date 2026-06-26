import { useQuery } from '@tanstack/react-query';

import { listRooms } from '@/services/rooms';

export const ROOMS_QUERY_KEY = ['rooms'];

const EMPTY_ROOMS = [];

export const fetchRoomsList = async () => {
  const data = await listRooms();
  return Array.isArray(data) ? data : EMPTY_ROOMS;
};

export const useRoomsList = (options = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: fetchRoomsList,
    ...options,
  });

  return { rooms: data ?? EMPTY_ROOMS, isLoading, isError, refetch };
};
