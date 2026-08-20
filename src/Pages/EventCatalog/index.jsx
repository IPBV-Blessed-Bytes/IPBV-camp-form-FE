import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { listEvents } from '@/services/events';
import { eventPath, setSelectedEvent } from '@/config/eventScope';
import Loading from '@/components/Global/Loading';
import EventIcons, { EVENT_ICONS } from '@/components/Global/EventIcons';
import './style.scss';

const ICON_KEYS = new Set(EVENT_ICONS.map((icon) => icon.key));

const DEFAULT_COLOR = '#007185';

const EventCatalog = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await listEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <Loading loading />;

  return (
    <div className="event-catalog">
      <Container>
        <div className="event-catalog__hero">
          <span className="event-catalog__eyebrow">Inscrições abertas</span>
          <h1 className="event-catalog__title">Escolha seu Evento</h1>
          <p className="event-catalog__subtitle">Selecione um evento abaixo para iniciar sua inscrição</p>
        </div>

        {error && <p className="text-center event-catalog__empty">Não foi possível carregar os eventos.</p>}

        {!error && events.length === 0 && (
          <p className="text-center event-catalog__empty">Nenhum evento disponível no momento.</p>
        )}

        <Row className="g-4 justify-content-center">
          {events.map((event) => {
            const color = event.color || DEFAULT_COLOR;
            const registrationsOpen = event.registrationsOpen !== false;

            const handleClick = () => {
              if (registrationsOpen) {
                navigate(eventPath('/', event.slug));
              } else {
                setSelectedEvent(event.slug);
                navigate('/entrar');
              }
            };

            return (
              <Col key={event.slug} xs={12} sm={6} lg={4}>
                <button
                  type="button"
                  className="event-card"
                  style={{ '--card-accent': color }}
                  onClick={handleClick}
                >
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
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default EventCatalog;
