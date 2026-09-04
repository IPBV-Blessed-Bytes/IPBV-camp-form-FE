import { useEffect, useMemo, useState } from 'react';
import { Container, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyEventRegistrations } from '@/services/me';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import Icons from '@/components/Global/Icons';
import CheckinQrModal from '@/components/Global/CheckinQrModal';

const PAYMENT = {
  paid: { label: 'Pago', bg: 'success' },
  pending: { label: 'Aguardando pagamento', bg: 'warning' },
  refunded: { label: 'Reembolsado', bg: 'secondary' },
};

const MyEventRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrOrder, setQrOrder] = useState(null);

  useEffect(() => {
    getMyEventRegistrations()
      .then(setRegistrations)
      .catch(() => toast.error('Erro ao carregar suas inscrições.'))
      .finally(() => setLoading(false));
  }, []);

  const orders = useMemo(() => {
    const groups = new Map();
    registrations.forEach((registration) => {
      const key = registration.orderNumber || `no-order-${registration.id}`;
      if (!groups.has(key)) {
        groups.set(key, {
          orderNumber: registration.orderNumber,
          eventName: registration.eventName,
          eventSlug: registration.eventSlug,
          people: [],
        });
      }
      groups.get(key).people.push(registration);
    });
    return Array.from(groups.values());
  }, [registrations]);

  return (
    <div className="components-container">
      <Header />
      <Container className="my-5" style={{ maxWidth: 820 }}>
        <h2 className="mb-4">Minhas inscrições</h2>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-secondary">Você ainda não tem inscrições.</p>
        ) : (
          orders.map((order) => {
            const paidGroup = order.people.some((p) => p.checkin || p.paymentStatus === 'paid');
            return (
              <Card key={order.orderNumber} className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      {order.eventName && <h5 className="mb-1">{order.eventName}</h5>}
                      <span className="text-secondary small">Pedido {order.orderNumber || '—'}</span>
                    </div>
                    {order.orderNumber && paidGroup && (
                      <Button variant="outline-teal-blue" size="sm" onClick={() => setQrOrder(order)}>
                        <Icons typeIcon="camera" iconSize={16} fill="#007185" /> QR de check-in
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 d-flex flex-column gap-2">
                    {order.people.map((person) => {
                      const payment = PAYMENT[person.paymentStatus] || { label: person.paymentStatus, bg: 'light' };
                      return (
                        <div
                          key={person.id}
                          className="d-flex justify-content-between align-items-center border rounded p-2 gap-2 flex-wrap"
                        >
                          <span className="fw-bold">{person.name || person.cpf || `#${person.id}`}</span>
                          <span className="d-flex gap-2">
                            <Badge bg={payment.bg} text={payment.bg === 'warning' ? 'dark' : undefined}>
                              {payment.label}
                            </Badge>
                            {person.checkin ? (
                              <Badge bg="success">Check-in feito</Badge>
                            ) : (
                              <Badge bg="secondary">Sem check-in</Badge>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            );
          })
        )}

        <Button variant="link" onClick={() => navigate('/minha-conta')}>
          ← Voltar
        </Button>
      </Container>
      <Footer handleAdminClick={() => navigate('/admin')} />

      <CheckinQrModal
        show={Boolean(qrOrder)}
        onHide={() => setQrOrder(null)}
        orderNumber={qrOrder?.orderNumber}
        count={qrOrder?.people?.length}
      />
    </div>
  );
};

export default MyEventRegistrations;
