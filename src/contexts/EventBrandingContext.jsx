import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';

import { getEvent } from '@/services/events';
import { getEventSlug, getEventSlugFromPath } from '@/config/eventScope';

const DEFAULT_COLOR = '#007185';
const DEFAULT_SECONDARY_COLOR = '#ffc107';

const EventBrandingContext = createContext(null);

export const EventBrandingProvider = ({ children }) => {
  const location = useLocation();
  const slug = getEventSlug();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event-branding', slug],
    queryFn: () => getEvent(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });

  const color = event?.color || DEFAULT_COLOR;
  const secondaryColor = event?.secondaryColor || DEFAULT_SECONDARY_COLOR;

  const faviconUrl = event?.faviconUrl || null;

  useEffect(() => {
    const root = document.documentElement;
    const onEventPage = Boolean(getEventSlugFromPath(location.pathname));

    if (onEventPage) {
      root.style.setProperty('--event-color', color);
      root.style.setProperty('--event-secondary-color', secondaryColor);
    } else {
      root.style.removeProperty('--event-color');
      root.style.removeProperty('--event-secondary-color');
    }
  }, [color, secondaryColor, location.pathname]);

  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]');
    if (!link) return;

    if (!link.dataset.defaultHref) {
      link.dataset.defaultHref = link.getAttribute('href') || '';
    }
    const onEventPage = Boolean(getEventSlugFromPath(location.pathname));

    if (onEventPage && faviconUrl) {
      link.setAttribute('href', faviconUrl);
    } else {
      link.setAttribute('href', link.dataset.defaultHref);
    }
  }, [faviconUrl, location.pathname]);

  const value = useMemo(
    () => ({
      name: event?.name || '',
      contact: event?.contact || '',
      year: event?.year || null,
      color,
      secondaryColor,
      legacyForm: Boolean(event?.legacyForm),
      paymentEnabled: Boolean(event?.paymentEnabled),
      registrationFeeEnabled: Boolean(event?.registrationFeeEnabled),
      registrationsOpen: event?.registrationsOpen !== false,
      contactMessage: event?.contactMessage || '',
      shareMessage: event?.shareMessage || '',
      oldSpreadsheetUrl: event?.oldSpreadsheetUrl || '',
      faviconUrl,
      loading: isLoading,
    }),
    [event, color, secondaryColor, faviconUrl, isLoading],
  );

  return <EventBrandingContext.Provider value={value}>{children}</EventBrandingContext.Provider>;
};

EventBrandingProvider.propTypes = {
  children: PropTypes.node,
};

export const useEventBranding = () => useContext(EventBrandingContext) || {};
