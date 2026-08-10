import { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { unlockAccount } from '@/services/auth';
import Loading from '@/components/Global/Loading';

const Unlock = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isCustomer = searchParams.get('origin') === 'customer';
  const loginPath = isCustomer ? '/entrar' : '/admin';
  const forgotPath = isCustomer ? '/esqueci-senha?origin=customer' : '/esqueci-senha';

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleUnlock = async () => {
    if (!token) {
      setStatus('error');
      return;
    }
    setLoading(true);
    try {
      await unlockAccount(token);
      setStatus('ok');
      toast.success('Conta desbloqueada com sucesso.');
    } catch (error) {
      setStatus('error');
      toast.error('Link inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: 440, width: '100%' }} className="p-3 shadow-sm">
        <Card.Body>
          <h4 className="mb-4">Desbloquear conta</h4>

          {status === 'ok' ? (
            <div>
              <p className="text-success">Sua conta foi desbloqueada. Você já pode fazer login normalmente.</p>
              <Button variant="primary" className="w-100" onClick={() => navigate(loginPath)}>
                Ir para o login
              </Button>
            </div>
          ) : status === 'error' ? (
            <div>
              <p className="text-danger">Link inválido ou expirado.</p>
              <Button variant="primary" className="w-100" onClick={() => navigate(forgotPath)}>
                Solicitar novo link
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-4">
                Clique no botão abaixo para desbloquear sua conta usando o link enviado ao seu e-mail.
              </p>
              <Button variant="primary" className="w-100 fw-bold" onClick={handleUnlock} disabled={!token}>
                Desbloquear minha conta
              </Button>
              {!token && <p className="text-danger small mt-2">Link inválido: token ausente.</p>}
            </div>
          )}
        </Card.Body>
        <Loading loading={loading} />
      </Card>
    </Container>
  );
};

export default Unlock;
