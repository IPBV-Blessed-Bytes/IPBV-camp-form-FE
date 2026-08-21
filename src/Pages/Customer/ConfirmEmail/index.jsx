import { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { confirmEmail } from '@/services/auth';
import AuthShell from '@/components/Global/AuthShell';

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
    <AuthShell title="Confirmação de e-mail" icon="checked">
      {status === 'loading' && (
        <div className="d-flex align-items-center justify-content-center gap-2 text-secondary">
          <Spinner animation="border" size="sm" /> Confirmando seu e-mail...
        </div>
      )}

      {status === 'ok' && (
        <div className="text-center">
          <p className="text-success">Seu e-mail foi confirmado com sucesso! Sua conta está ativa.</p>
          <Button variant="primary" className="w-100 mt-2" onClick={() => navigate('/entrar')}>
            Entrar na minha conta
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <p className="text-danger">Link inválido ou expirado.</p>
          <Button variant="primary" className="w-100 mt-2" onClick={() => navigate('/criar-conta')}>
            Voltar ao cadastro
          </Button>
        </div>
      )}
    </AuthShell>
  );
};

export default ConfirmEmail;
