import { useQuery } from '@tanstack/react-query';

import { listFormFields } from '@/services/formFields';
import { getEventSlug } from '@/config/eventScope';

const DEFAULT_SECTION = 'Informações';

export const groupFieldsBySection = (fields = []) => {
  const sections = [];
  const byName = new Map();

  fields.forEach((field) => {
    const name = field.section?.trim() || DEFAULT_SECTION;
    if (!byName.has(name)) {
      const section = { name, fields: [] };
      byName.set(name, section);
      sections.push(section);
    }
    byName.get(name).fields.push(field);
  });

  return sections;
};

const useEventSchema = () => {
  const slug = getEventSlug();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ['event-schema', slug],
    queryFn: listFormFields,
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });

  return {
    fields,
    sections: groupFieldsBySection(fields),
    hasSchema: fields.length > 0,
    loading: isLoading,
  };
};

export default useEventSchema;
