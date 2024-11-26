import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Icons from '@/components/GlobalComponents/Icons';
import FormRoutes from '../Routes';

const CloseForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      const response = await axios.get('https://ipbv-camp-form-be-production-2b7d.up.railway.app/credentials');
      const credentialsData = response.data;

      const user = credentialsData.find((u) => u.login === loginData.username && u.password === loginData.password);

      if (user) {
        setIsLoggedIn(true);
        toast.success('Usuário logado com sucesso!');
      } else {
        toast.error('Credenciais Inválidas. Tente novamente!');
      }
    } catch (error) {
      console.error(error.message);
      toast.error('Erro ao buscar credenciais. Tente novamente mais tarde.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

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

                <Form.Group className="input-login-wrapper mb-3" controlId="username">
                  <Form.Label className="fw-bold">Nome de Usuário:</Form.Label>
                  <Form.Control
                    className="admin__user"
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    onKeyDown={handleKeyDown}
                  />
                </Form.Group>

                <Form.Group className="input-login-wrapper mb-3" controlId="password">
                  <Form.Label className="fw-bold">Senha:</Form.Label>
                  <Form.Control
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
                  <Button variant="primary" onClick={handleLogin}>
                    Entrar
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </div>
      ) : (
        <>
          <FormRoutes />
        </>
      )}
    </>
  );
};

export default CloseForm;
