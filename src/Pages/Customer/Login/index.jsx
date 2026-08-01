import { useState, useEffect } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAuth from '@/hooks/useAuth';
import Loading from '@/components/Global/Loading';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/minha-conta');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: 440, width: '100%' }} className="p-3 shadow-sm">
        <Card.Body>
          <h4 className="mb-1">Entrar</h4>
          <p className="text-secondary small mb-4">Acesse sua conta para acompanhar sua inscrição.</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="customerEmail">
              <Form.Label className="fw-bold small">E-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
              />
            </Form.Group>
            <Form.Group controlId="customerPassword" className="mt-3">
              <Form.Label className="fw-bold small">Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100 mt-4 fw-bold">
              Entrar
            </Button>
            <button type="button" className="btn btn-link w-100 mt-2" onClick={() => navigate('/criar-conta')}>
              Não tem conta? Criar conta
            </button>
            <button type="button" className="btn btn-link w-100" onClick={() => navigate('/esqueci-senha')}>
              Esqueci minha senha
            </button>
            <button type="button" className="btn btn-link w-100" onClick={() => navigate('/')}>
              ← Voltar ao formulário
            </button>
          </Form>
        </Card.Body>
        <Loading loading={loading} />
      </Card>
    </Container>
  );
};

export default CustomerLogin;
