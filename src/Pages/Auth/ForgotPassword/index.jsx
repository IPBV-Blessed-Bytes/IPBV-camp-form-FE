import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { forgotPassword } from '@/services/auth';
import Loading from '@/components/Global/Loading';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginPath = searchParams.get('origin') === 'customer' ? '/entrar' : '/admin';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Informe o e-mail cadastrado.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Se o e-mail estiver cadastrado, enviaremos um link de redefinição.');
    } catch (error) {
      toast.error('Não foi possível processar a solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: 440, width: '100%' }} className="p-3 shadow-sm">
        <Card.Body>
          <h4 className="mb-1">Esqueci minha senha</h4>
          <p className="text-secondary small mb-4">
            Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
          </p>

          {sent ? (
            <div>
              <p className="mb-4">
                Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes. Verifique também a
                caixa de spam.
              </p>
              <Button variant="primary" className="w-100" onClick={() => navigate(loginPath)}>
                Voltar ao login
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="forgotEmail">
                <Form.Label className="fw-bold small">E-mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100 mt-4 fw-bold">
                Enviar link
              </Button>
              <button type="button" className="btn btn-link w-100 mt-2" onClick={() => navigate(loginPath)}>
                ← Voltar ao login
              </button>
            </Form>
          )}
        </Card.Body>
        <Loading loading={loading} />
      </Card>
    </Container>
  );
};

export default ForgotPassword;
