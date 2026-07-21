import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { resetPassword } from '@/services/auth';
import Loading from '@/components/Global/Loading';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Link inválido: token ausente.');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      toast.success('Senha redefinida com sucesso. Faça login com a nova senha.');
      navigate('/admin');
    } catch (error) {
      toast.error('Link inválido ou expirado. Solicite um novo em "Esqueci minha senha".');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: 440, width: '100%' }} className="p-3 shadow-sm">
        <Card.Body>
          <h4 className="mb-4">Redefinir senha</h4>

          {!token ? (
            <div>
              <p className="text-danger">Link inválido: token ausente.</p>
              <Button variant="primary" className="w-100" onClick={() => navigate('/esqueci-senha')}>
                Solicitar novo link
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="newPassword">
                <Form.Label className="fw-bold small">Nova senha</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="lg"
                />
              </Form.Group>
              <Form.Group controlId="confirmPassword" className="mt-3">
                <Form.Label className="fw-bold small">Confirmar nova senha</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  size="lg"
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100 mt-4 fw-bold">
                Redefinir senha
              </Button>
            </Form>
          )}
        </Card.Body>
        <Loading loading={loading} />
      </Card>
    </Container>
  );
};

export default ResetPassword;
