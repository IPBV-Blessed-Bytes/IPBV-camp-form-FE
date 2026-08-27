import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import useAuth from '@/hooks/useAuth';
import { FORM_STORAGE_KEYS } from '@/utils/formStorage';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import AuthShell from '@/components/Global/AuthShell';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const resume = sessionStorage.getItem(FORM_STORAGE_KEYS.resumeCheckout);
      if (resume !== null) {
        sessionStorage.removeItem(FORM_STORAGE_KEYS.resumeCheckout);
        navigate('/');
      } else {
        navigate('/minha-conta');
      }
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta para acompanhar sua inscrição.">
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
              <div className="login-password-wrapper">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="lg"
                  className="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="login-password-toggle"
                >
                  <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={22} />
                </button>
              </div>
            </Form.Group>
            <Button type="submit" variant="teal-blue" className="w-100 mt-4 fw-bold">
              Entrar
            </Button>
            <button type="button" className="w-100 mt-2 btn-alter-link" onClick={() => navigate('/criar-conta')}>
              Não tem conta? Criar conta
            </button>
            <button type="button" className="w-100 btn-alter-link" onClick={() => navigate('/esqueci-senha?origin=customer')}>
              Esqueci minha senha
            </button>
            <button type="button" className="w-100 btn-alter-link" onClick={() => navigate('/')}>
              ← Voltar ao formulário
            </button>
      </Form>
      <Loading loading={loading} />
    </AuthShell>
  );
};

export default CustomerLogin;
