import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import { listEvents, getOrganizationCatalog, eventImageUrl } from '@/services/events';
import { orgLogoUrl } from '@/services/organizationBranding';
import { eventPath, setSelectedEvent } from '@/config/eventScope';
import Loading from '@/components/Global/Loading';
import EventIcons, { EVENT_ICONS } from '@/components/Global/EventIcons';
import './style.scss';

const ICON_KEYS = new Set(EVENT_ICONS.map((icon) => icon.key));

const DEFAULT_COLOR = '#007185';

const EventCardImage = ({ id, alt }) => {
  const [status, setStatus] = useState('loading');
  if (status === 'error') return null;
  return (
    <img
      className="event-card__img"
      src={eventImageUrl(id)}
      alt={alt}
      style={status === 'loading' ? { display: 'none' } : undefined}
      onLoad={() => setStatus('ok')}
      onError={() => setStatus('error')}
    />
  );
};

EventCardImage.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  alt: PropTypes.string,
};

const OrgLogo = ({ slug, name, accent }) => {
  const [status, setStatus] = useState('loading');
  if (status === 'error') {
    return (
      <span className="event-catalog__monogram" style={{ '--brand': accent }}>
        {(name || '?').charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <span className="event-catalog__logo-wrap">
      <img
        className="event-catalog__logo"
        src={orgLogoUrl(slug)}
        alt={name}
        style={status === 'loading' ? { display: 'none' } : undefined}
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
      />
    </span>
  );
};

OrgLogo.propTypes = {
  slug: PropTypes.string,
  name: PropTypes.string,
  accent: PropTypes.string,
};

const EventCard = ({ event, accent, navigate }) => {
  const color = event.color || accent;
  const registrationsOpen = event.registrationsOpen !== false;

  const handleClick = () => {
    if (registrationsOpen) {
      navigate(eventPath('/', event.slug));
    } else {
      setSelectedEvent(event.slug, event.name);
      navigate('/entrar');
    }
  };

  return (
    <button type="button" className="event-card" style={{ '--card-accent': color }} onClick={handleClick}>
      <EventCardImage id={event.id} alt={event.name} />

      <span className="event-card__icon">
        {ICON_KEYS.has(event.iconKey) ? (
          <EventIcons typeIcon={event.iconKey} iconSize={50} />
        ) : (
          <span className="event-card__initial">{(event.name || '?').charAt(0).toUpperCase()}</span>
        )}
      </span>

      {event.year && <span className="event-card__year">{event.year}</span>}
      <span className="event-card__name">{event.name}</span>

      {!registrationsOpen && <span className="event-card__badge">Inscrições encerradas</span>}

      <span className="event-card__cta">
        {registrationsOpen ? 'Fazer inscrição' : 'Entrar na minha conta'}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
};

EventCard.propTypes = {
  event: PropTypes.object,
  accent: PropTypes.string,
  navigate: PropTypes.func,
};

const EventCatalog = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const [events, setEvents] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (orgSlug) {
          const { organization: org, events: list } = await getOrganizationCatalog(orgSlug);
          setOrganization(org);
          setEvents(Array.isArray(list) ? list : []);
        } else {
          const data = await listEvents();
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [orgSlug]);

  const orgName = organization?.name || '';

  useEffect(() => {
    document.title = orgName ? `Eventos · ${orgName}` : 'Escolha seu evento';
  }, [orgName]);

  if (loading) return <Loading loading />;

  const accent = organization?.brandColor || DEFAULT_COLOR;
  const openCount = events.filter((event) => event.registrationsOpen !== false).length;
  const contactEmail = organization?.contactEmail;

  return (
    <div className="event-catalog" style={{ '--brand': accent }}>
      <Container>
        <div className="event-catalog__hero">
          {orgSlug && (
            <OrgLogo slug={organization?.slug || orgSlug} name={orgName} accent={accent} />
          )}

          {openCount > 0 && <span className="event-catalog__eyebrow">Inscrições abertas</span>}

          <h1 className="event-catalog__title">{orgName || 'Escolha seu Evento'}</h1>

          <p className="event-catalog__subtitle">
            {organization?.description || 'Selecione um evento abaixo para iniciar sua inscrição'}
          </p>
        </div>

        {error && <p className="text-center event-catalog__empty">Não foi possível carregar os eventos.</p>}

        {!error && events.length === 0 && (
          <p className="text-center event-catalog__empty">Nenhum evento disponível no momento.</p>
        )}

        <Row className="g-4 justify-content-center">
          {events.map((event) => (
            <Col key={event.slug} xs={12} sm={6} lg={4}>
              <EventCard event={event} accent={accent} navigate={navigate} />
            </Col>
          ))}
        </Row>

        {orgSlug && (orgName || contactEmail) && (
          <footer className="event-catalog__footer">
            <span className="event-catalog__footer-org">{orgName}</span>
            {contactEmail && (
              <a className="event-catalog__footer-contact" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            )}
          </footer>
        )}
      </Container>
    </div>
  );
};

export default EventCatalog;
