import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';

import { getEvent } from '@/services/events';
import { getEventSlug } from '@/config/eventScope';

const DEFAULT_COLOR = '#007185';

const EventBrandingContext = createContext(null);

export const EventBrandingProvider = ({ children }) => {
  const location = useLocation();
  const slug = getEventSlug();

  const { data: event } = useQuery({
    queryKey: ['event-branding', slug],
    queryFn: () => getEvent(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });

  const color = event?.color || DEFAULT_COLOR;

  useEffect(() => {
    document.documentElement.style.setProperty('--event-color', color);
  }, [color, location.pathname]);

  const value = useMemo(
    () => ({
      name: event?.name || '',
      logoUrl: event?.logoUrl || '',
      contact: event?.contact || '',
      year: event?.year || null,
      color,
    }),
    [event, color],
  );

  return <EventBrandingContext.Provider value={value}>{children}</EventBrandingContext.Provider>;
};

EventBrandingProvider.propTypes = {
  children: PropTypes.node,
};

export const useEventBranding = () => useContext(EventBrandingContext) || {};
