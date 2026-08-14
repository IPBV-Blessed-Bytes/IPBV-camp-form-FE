import { useQuery } from '@tanstack/react-query';

import { listFormFields } from '@/services/formFields';
import { listFormSections } from '@/services/formSections';
import { getEventSlug } from '@/config/eventScope';

const useEventSchema = () => {
  const slug = getEventSlug();

  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['event-sections', slug],
    queryFn: listFormSections,
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });

  const { data: fields = [], isLoading: loadingFields } = useQuery({
    queryKey: ['event-schema', slug],
    queryFn: listFormFields,
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });

  const groupedSections = sections.map((section) => ({
    ...section,
    fields: fields.filter((field) => field.sectionId === section.id),
  }));

  return {
    sections: groupedSections,
    fields,
    hasSchema: fields.length > 0,
    loading: loadingSections || loadingFields,
  };
};

export default useEventSchema;
