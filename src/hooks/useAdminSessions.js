import { useQuery } from '@tanstack/react-query';
import { listAdminSessions } from '@/services/adminSessions';
import { getEventSlug } from '@/config/eventScope';
import { resolveSession } from '@/config/adminSessions';

export const useAdminSessions = () => {
  const { data = [], refetch } = useQuery({
    queryKey: ['admin-sessions', getEventSlug()],
    queryFn: listAdminSessions,
    staleTime: 5 * 60 * 1000,
  });

  const configs = {};
  data.forEach((session) => {
    configs[session.sessionKey] = session;
  });

  return { configs, refetch };
};

export const useAdminSession = (key) => {
  const { configs } = useAdminSessions();
  return resolveSession(key, configs[key]);
};

export default useAdminSessions;
