import { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import fetcher from '@/fetchers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import Icons from '@/components/Global/Icons';
import RoutesValidations from '@/Routes/RoutesValidations';

const CloseForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    login: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      const response = await fetcher.post('auth/login', {
        login: loginData.login,
        password: loginData.password,
      });

      if (response.status === 200) {
        setIsLoggedIn(true);
        setLoginData({ login: '', password: '' });
        toast.success('Usuário logado com sucesso!');
      } else {
        toast.error('Credenciais Inválidas. Tente novamente!');
      }
    } catch (error) {
      console.error(error.message);
      toast.error('Credenciais Inválidas. Tente novamente.');
    }
  };

  const handleKeyDown = (e) => e.key === 'Enter' && handleLogin();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {!isLoggedIn ? (
        <div className="closed-admin">
          <Row className="justify-content-center">
            <Col xs={12} md={6}>
              <Form className="p-4">
                <h4 className="text-center fw-bold my-5">IPBV</h4>

                <Form.Group className="input-login-wrapper mb-3" controlId="login">
                  <Form.Label className="fw-bold">Nome de Usuário:</Form.Label>
                  <Form.Control
                    className="admin__user"
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    value={loginData.login}
                    onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                    onKeyDown={handleKeyDown}
                  />
                </Form.Group>

                <Form.Group className="input-login-wrapper mb-3" controlId="password">
                  <Form.Label className="fw-bold">Senha:</Form.Label>
                  <Form.Control
                    autoComplete="off"
                    className="admin__password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    onKeyDown={handleKeyDown}
                  />
                  <Icons
                    className="login-icon"
                    typeIcon={showPassword ? 'visible-password' : 'hidden-password'}
                    onClick={handleShowPassword}
                  />
                </Form.Group>

                <div className="input-login-btn-wrapper d-flex justify-content-end">
                  <Button className="fw-bold" variant="primary" onClick={handleLogin}>
                    Entrar
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </div>
      ) : (
        <RoutesValidations formContextCloseForm="form-on" />
      )}
    </>
  );
};

export default CloseForm;
