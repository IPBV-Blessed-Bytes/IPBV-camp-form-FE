import { useQuery } from '@tanstack/react-query';
import { getPublicSetting } from '@/services/settings';

const CONTACT_KEY = 'contact_phone';

const useContactPhone = () => {
  const { data } = useQuery({
    queryKey: ['contact-phone'],
    queryFn: () => getPublicSetting(CONTACT_KEY),
    staleTime: 5 * 60 * 1000,
  });
  return data || '';
};

export default useContactPhone;
