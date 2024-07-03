import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Icons from '../../../components/Icons';
import PropTypes from 'prop-types';

const AdminLoggedOut = ({
  handleLogout,
  loginData,
  handleKeyDown,
  showPassword,
  handleShowPassword,
  handleLogin,
  navigateTo,
  setLoginData,
}) => (
  <Row className="justify-content-center">
    <Row>
      <Col xs={12} className="text-end mb-4">
        <p className="d-none d-sm-block">Clique para voltar ao Formulário de inscrição:</p>
        <Button
          className="fw-bold"
          variant="danger"
          onClick={() => {
            handleLogout();
            navigateTo('/');
          }}
        >
          Voltar para Formulário
        </Button>
      </Col>
    </Row>
    <Row className="justify-content-center">
      <Col xs={12} md={6} className="d-flex justify-content-center">
        <Form className="login-admin-card">
          <h4 className="text-center fw-bold mb-5">LOGIN ADMIN</h4>

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
            <Button className="fw-bold" variant="primary" onClick={handleLogin}>
              Entrar
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  </Row>
);

AdminLoggedOut.propTypes = {
  handleLogout: PropTypes.func,
  loginData: PropTypes.shape({
    username: PropTypes.string,
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
