import { useEffect, useState } from 'react';
import { getEvent } from '@/services/events';
import { getEventSlug, getEventName, setSelectedEventName, SELECTED_EVENT_NAME_KEY } from '@/config/eventScope';

const useEventName = () => {
  const [name, setName] = useState(() => getEventName());

  useEffect(() => {
    const slug = getEventSlug();
    if (!slug) return;
    const stored = localStorage.getItem(SELECTED_EVENT_NAME_KEY);
    if (stored) {
      setName(stored);
      return;
    }
    getEvent(slug)
      .then((event) => {
        if (event?.name) {
          setSelectedEventName(event.name);
          setName(event.name);
        }
      })
      .catch(() => {});
  }, []);

  return name;
};

export default useEventName;
