import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { listEvents } from '@/services/events';
import { eventPath } from '@/config/eventScope';
import Loading from '@/components/Global/Loading';
import './style.scss';

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
    <Container className="event-catalog">
      <Row className="justify-content-center">
        <Col lg={9} className="text-center event-catalog__header">
          <h1>Eventos</h1>
          <p>Escolha um evento para iniciar sua inscrição.</p>
        </Col>
      </Row>

      {error && <p className="text-center event-catalog__empty">Não foi possível carregar os eventos.</p>}

      {!error && events.length === 0 && (
        <p className="text-center event-catalog__empty">Nenhum evento disponível no momento.</p>
      )}

      <Row className="justify-content-center">
        {events.map((event) => (
          <Col key={event.slug} md={6} lg={4} className="mb-4">
            <Card className="event-catalog__card h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="event-catalog__card-title">{event.name}</Card.Title>
                <Button
                  variant="teal-blue"
                  className="mt-auto"
                  onClick={() => navigate(eventPath('/', event.slug))}
                >
                  Fazer inscrição
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default EventCatalog;
