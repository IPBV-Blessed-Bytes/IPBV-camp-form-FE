import { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { confirmEmail } from '@/services/auth';
import Loading from '@/components/Global/Loading';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    confirmEmail(token)
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: 440, width: '100%' }} className="p-3 shadow-sm">
        <Card.Body>
          <h4 className="mb-4">Confirmação de e-mail</h4>

          {status === 'loading' && (
            <>
              <p className="text-secondary mb-0">Confirmando seu e-mail...</p>
              <Loading loading />
            </>
          )}

          {status === 'ok' && (
            <div>
              <p className="text-success">Seu e-mail foi confirmado com sucesso! Sua conta está ativa.</p>
              <Button variant="primary" className="w-100" onClick={() => navigate('/entrar')}>
                Entrar na minha conta
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <p className="text-danger">Link inválido ou expirado.</p>
              <Button variant="primary" className="w-100" onClick={() => navigate('/criar-conta')}>
                Voltar ao cadastro
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ConfirmEmail;
