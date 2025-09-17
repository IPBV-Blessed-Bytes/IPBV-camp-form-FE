import { Row, Col, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import Icons from '@/components/Global/Icons';
import scrollUp from '@/hooks/useScrollUp';

const AdminLoggedOut = ({
  handleKeyDown,
  handleLogin,
  handleShowPassword,
  loginData,
  navigateTo,
  setLoginData,
  showPassword,
}) => {
  scrollUp();

  return (
    <Row className="justify-content-center">
      <Row>
        <Col xs={12} className="text-end mb-4">
          <p className="d-none d-sm-block">Clique para voltar ao Formulário de inscrição:</p>
          <Button
            className="fw-bold"
            variant="secondary"
            onClick={() => {
              navigateTo('/');
            }}
          >
            Voltar pro Formulário
          </Button>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} md={6} className="d-flex justify-content-center">
          <Form className="login-admin-card">
            <h4 className="login-admin-card__title text-center fw-bold mb-5">ACESSO ADMINISTRAÇÃO</h4>

            <Form.Group className="input-login-wrapper mb-3" controlId="login">
              <Form.Label className="fw-bold form-label-admin">Nome de Usuário:</Form.Label>
              <Form.Control
                className="admin__user"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={loginData.login || ''}
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </Form.Group>

            <Form.Group className="input-login-wrapper mb-3" controlId="password">
              <Form.Label className="fw-bold form-label-admin">Senha:</Form.Label>
              <Form.Control
                autoComplete="off"
                className="admin__password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={loginData.password || ''}
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
    </Row>
  );
};

AdminLoggedOut.propTypes = {
  handleLogout: PropTypes.func,
  loginData: PropTypes.shape({
    login: PropTypes.string,
    password: PropTypes.string,
  }),
  handleKeyDown: PropTypes.func,
  showPassword: PropTypes.bool,
  handleShowPassword: PropTypes.func,
  handleLogin: PropTypes.func,
  navigateTo: PropTypes.func,
  setLoginData: PropTypes.func,
  loginPage: PropTypes.bool,
  setLoginPage: PropTypes.func,
};

export default AdminLoggedOut;
