import { Form, Button } from 'react-bootstrap';
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
    <div className="admin-login-container">
      <div className="back-button-wrapper">
        <Button className="btn-back-home" variant="outline-secondary" onClick={() => navigateTo('/')}>
          <span className="me-2">←</span>
          Voltar ao site
        </Button>
      </div>

      <div className="login-content">
        <Form className="login-admin-card">
          <header className="text-center mb-5">
            <h4 className="login-admin-card__title fw-bold">ADMINISTRAÇÃO</h4>
            <p className="text-muted small">Entre com suas credenciais para acessar o painel</p>
          </header>

          <Form.Group className="input-login-wrapper mb-4" controlId="login">
            <Form.Label className="fw-bold small">Nome de Usuário</Form.Label>
            <Form.Control
              className="admin__input"
              type="text"
              placeholder="Seu usuário"
              value={loginData.login || ''}
              onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </Form.Group>

          <Form.Group className="input-login-wrapper mb-4" controlId="password">
            <Form.Label className="fw-bold small">Senha</Form.Label>
            <div className="password-field-container">
              <Form.Control
                autoComplete="off"
                className="admin__input admin__password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={loginData.password || ''}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                onKeyDown={handleKeyDown}
              />
              <Icons
                className="login-icon"
                typeIcon={showPassword ? 'visible-password' : 'hidden-password'}
                onClick={handleShowPassword}
              />
            </div>
          </Form.Group>

          <Button className="w-100 btn-login-submit py-2 fw-bold" onClick={handleLogin}>
            Acessar Painel
          </Button>
        </Form>
      </div>
    </div>
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
