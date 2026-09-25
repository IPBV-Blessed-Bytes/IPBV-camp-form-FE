import { useEffect, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

import useAuth from '@/hooks/useAuth';
import { getPlatformMe } from '@/services/platform';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const OwnerLogin = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, logout, loading } = useAuth();
  const [creds, setCreds] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    document.title = 'Painel Interno';
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    setChecking(true);
    getPlatformMe()
      .then((data) => {
        if (data?.owner || data?.access) {
          navigate('/platform', { replace: true });
        } else {
          toast.error('Acesso restrito ao operador da plataforma.');
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [isLoggedIn, logout, navigate]);

  const submit = (e) => {
    e.preventDefault();
    login(creds.login, creds.password, { area: 'admin' });
    setCreds((prev) => ({ ...prev, password: '' }));
  };

  return (
    <div className="owner-login">
      <Container className="owner-login__card-wrap">
        <div className="owner-login__card">
          <span className="owner-login__mark">
            <Icons typeIcon="settings" iconSize={26} fill="#ffffff" />
          </span>
          <h1>Painel Interno - Sistema</h1>
          <p className="owner-login__lede">Acesso restrito ao operador da plataforma.</p>

          <Form onSubmit={submit} className="owner-login__form">
            <Form.Group>
              <Form.Label className="fw-bold">E-mail</Form.Label>
              <Form.Control
                type="email"
                value={creds.login}
                onChange={(e) => setCreds((p) => ({ ...p, login: e.target.value }))}
                autoComplete="username"
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label className="fw-bold">Senha</Form.Label>
              <div className="owner-login__password">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={creds.password}
                  onChange={(e) => setCreds((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="owner-login__password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={20} />
                </button>
              </div>
            </Form.Group>
            <SpinnerButton type="submit" variant="teal-blue" className="fw-bold w-100 mt-4" loading={loading || checking}>
              Entrar
            </SpinnerButton>
          </Form>
        </div>
      </Container>
      <Loading loading={loading || checking} />
    </div>
  );
};

export default OwnerLogin;
