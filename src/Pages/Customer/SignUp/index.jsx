import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { eventPath } from '@/config/eventScope';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerGuest, resendConfirmation } from '@/services/auth';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Informe seu e-mail.');
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
      await registerGuest({ email, password });
      setRegistered(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendConfirmation(email);
      toast.success('E-mail de confirmação reenviado.');
    } catch (error) {
      toast.error('Não foi possível reenviar. Tente novamente.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: 440, width: '100%' }} className="p-3 shadow-sm">
        <Card.Body>
          {registered ? (
            <div>
              <h4 className="mb-3">Confirme seu e-mail</h4>
              <p>
                Enviamos um link de confirmação para <strong><em>{email}</em></strong>. Clique no link para ativar sua conta e
                poder concluir sua inscrição. Esse e-mail pode aparecer na caixa de spam.
              </p>
              <Button variant="link" className="px-0" onClick={handleResend}>
                Reenviar e-mail de confirmação
              </Button>
              <Button variant="primary" className="w-100 mt-3" onClick={() => navigate('/entrar')}>
                Ir para o login
              </Button>
              <button type="button" className="btn btn-link w-100 mt-2" onClick={() => navigate(eventPath('/'))}>
                ← Voltar ao formulário
              </button>
            </div>
          ) : (
            <>
              <h4 className="mb-1">Criar conta</h4>
              <p className="text-secondary small mb-4">Crie sua conta para fazer sua inscrição no acampamento.</p>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="signupEmail">
                  <Form.Label className="fw-bold small">E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                  />
                </Form.Group>
                <Form.Group controlId="signupPassword" className="mt-3">
                  <Form.Label className="fw-bold small">Senha</Form.Label>
                  <div className="signup-password-wrapper">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      className="signup-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="signup-password-toggle"
                    >
                      <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={22} />
                    </button>
                  </div>
                </Form.Group>
                <Form.Group controlId="signupConfirm" className="mt-3">
                  <Form.Label className="fw-bold small">Confirmar senha</Form.Label>
                  <div className="signup-password-wrapper">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      size="lg"
                      className="signup-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="signup-password-toggle"
                    >
                      <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={22} />
                    </button>
                  </div>
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100 mt-4 fw-bold">
                  Criar conta
                </Button>
                <button type="button" className="btn btn-link w-100 mt-2" onClick={() => navigate('/entrar')}>
                  Já tem conta? Entrar
                </button>
                <button type="button" className="btn btn-link w-100" onClick={() => navigate(eventPath('/'))}>
                  ← Voltar ao formulário
                </button>
              </Form>
            </>
          )}
        </Card.Body>
        <Loading loading={loading} />
      </Card>
    </Container>
  );
};

export default SignUp;
