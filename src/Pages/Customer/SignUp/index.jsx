import { useState, useEffect, useCallback } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerGuest, resendConfirmation } from '@/services/auth';
import { getApiErrorMessage } from '@/fetchers/helpers';
import useAuth from '@/hooks/useAuth';
import { FORM_STORAGE_KEYS } from '@/utils/formStorage';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import AuthShell from '@/components/Global/AuthShell';
import GoogleSignInButton from '@/components/Global/GoogleSignInButton';

const SignUp = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

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

  const handleGoogleCredential = useCallback((credential) => loginWithGoogle(credential), [loginWithGoogle]);

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
    <AuthShell
      title={registered ? 'Confirme seu e-mail' : 'Criar conta'}
      subtitle={registered ? null : 'Crie sua conta para fazer sua inscrição no acampamento.'}
    >
      {registered ? (
        <div>
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
              <button type="button" className="btn btn-link w-100 mt-2" onClick={() => navigate('/')}>
                ← Voltar ao formulário
              </button>
            </div>
      ) : (
        <>
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
                <Button type="submit" variant="teal-blue" className="w-100 mt-4 fw-bold">
                  Criar conta
                </Button>
                <div className="d-flex align-items-center gap-2 my-3 text-secondary small">
                  <div className="flex-grow-1 border-top" />
                  <span>ou</span>
                  <div className="flex-grow-1 border-top" />
                </div>
                <GoogleSignInButton onCredential={handleGoogleCredential} />
                <Button type="button" className="w-100 mt-3 btn-alter-link" onClick={() => navigate('/entrar')}>
                  Já tem conta? Entrar
                </Button>
                <Button type="Button" className="w-100 btn-alter-link" onClick={() => navigate('/')}>
                  ← Voltar ao formulário
                </Button>
              </Form>
        </>
      )}
      <Loading loading={loading} />
    </AuthShell>
  );
};

export default SignUp;
