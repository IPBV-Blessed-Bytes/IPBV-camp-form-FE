import { useQuery } from '@tanstack/react-query';

import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import { listCampers } from '@/services/campers';

// Query key compartilhada por todas as telas que leem a lista de acampantes
// (Campers, Teams, DataPanel, ExtraMeals). Mesma key = mesmo cache: navegar
// entre elas reusa os ~1000 registros em vez de rebuscar a cada montagem.
export const CAMPERS_QUERY_KEY = ['campers'];

// Referência estável para o estado de carregamento (evita o loop de auto-reset
// do react-table que um novo `[]` a cada render dispararia).
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
