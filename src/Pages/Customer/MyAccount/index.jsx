import { useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAuth from '@/hooks/useAuth';

const MyAccount = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/entrar');
    }
  }, [isLoggedIn, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: 480, width: '100%' }} className="p-3 shadow-sm">
        <Card.Body>
          <h4 className="mb-3">Minha conta</h4>
          <p>
            Olá, <strong>{user || 'usuário'}</strong>. Sua área de cliente está em construção — em breve você poderá
            acompanhar o status do seu pagamento e suas inscrições aqui.
          </p>
          <Button variant="outline-secondary" onClick={logout}>
            Sair
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyAccount;
