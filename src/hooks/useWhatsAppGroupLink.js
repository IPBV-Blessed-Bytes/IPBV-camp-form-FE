import { useQuery } from '@tanstack/react-query';
import { getPublicSetting } from '@/services/settings';

const WHATSAPP_GROUP_KEY = 'whatsapp_group_link';

const useWhatsAppGroupLink = () => {
  const { data } = useQuery({
    queryKey: ['whatsapp-group-link'],
    queryFn: () => getPublicSetting(WHATSAPP_GROUP_KEY),
    staleTime: 5 * 60 * 1000,
  });
  return data || '';
};

export default useWhatsAppGroupLink;
