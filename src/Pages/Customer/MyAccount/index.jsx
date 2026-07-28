import { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAuth from '@/hooks/useAuth';
import { getMyRegistrations } from '@/services/me';

const STATUS = {
  CONFIRMED: { label: 'Confirmada', bg: 'success' },
  PENDING_PAYMENT: { label: 'Aguardando pagamento', bg: 'warning' },
};

const MyAccount = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/entrar');
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        setRegistrations(await getMyRegistrations());
      } catch (error) {
        toast.error('Não foi possível carregar suas inscrições.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, navigate]);

  return (
    <Container style={{ maxWidth: 900 }} className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Minha conta</h4>
          <span className="text-secondary small">{user}</span>
        </div>
        <Button variant="outline-secondary" onClick={logout}>
          Sair
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Minhas inscrições</Card.Title>

          {loading ? (
            <div className="d-flex align-items-center gap-2 text-secondary">
              <Spinner animation="border" size="sm" /> Carregando...
            </div>
          ) : registrations.length === 0 ? (
            <div>
              <p className="text-secondary">Você ainda não tem inscrições.</p>
              <Button variant="primary" onClick={() => navigate('/')}>
                Fazer inscrição
              </Button>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Campista</th>
                  <th>CPF</th>
                  <th>Hospedagem</th>
                  <th>Transporte</th>
                  <th>Alimentação</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => {
                  const status = STATUS[r.status] || { label: r.status, bg: 'secondary' };
                  return (
                    <tr key={`${r.status}-${r.id}`}>
                      <td>{r.name || <span className="text-secondary">—</span>}</td>
                      <td>{r.cpf}</td>
                      <td>{r.accomodation}</td>
                      <td>{r.transportation}</td>
                      <td>{r.food}</td>
                      <td>{r.totalPrice ? `R$ ${r.totalPrice}` : '—'}</td>
                      <td>
                        <Badge bg={status.bg}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyAccount;
