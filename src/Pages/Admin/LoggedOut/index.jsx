import { Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import campLogo from '../../../../public/Images/camp_logo.png';
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
      <div className="login-content">
        <Form className="login-admin-card">
          <header className="login-admin-card__header">
            <img src={campLogo} alt="Logo do acampamento" className="login-admin-card__logo" />
            <h4 className="login-admin-card__title">Painel Administrativo</h4>
            <p className="login-admin-card__subtitle">Entre com suas credenciais para acessar</p>
          </header>

          <Form.Group className="input-login-wrapper" controlId="login">
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

          <Form.Group className="input-login-wrapper" controlId="password">
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
              <button
                type="button"
                className="password-toggle-btn"
                onClick={handleShowPassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} />
              </button>
            </div>
          </Form.Group>

          <Button className="w-100 btn-login-submit fw-bold" onClick={handleLogin}>
            Acessar Painel
          </Button>

          <button type="button" className="btn-back-link" onClick={() => navigateTo('/')}>
            ← Voltar ao site público
          </button>
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
