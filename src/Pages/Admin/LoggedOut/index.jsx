import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import Icons from '@/components/Global/Icons';
import GoogleSignInButton from '@/components/Global/GoogleSignInButton';
import LanguageSwitcher from '@/components/Global/LanguageSwitcher';
import scrollUp from '@/hooks/useScrollUp';

const AdminLoggedOut = ({
  handleKeyDown,
  handleLogin,
  handleShowPassword,
  loginData,
  navigateTo,
  onGoogleCredential,
  setLoginData,
  showPassword,
}) => {
  const { t } = useTranslation();
  scrollUp();

  return (
    <div className="admin-login-container">
      <div className="login-content">
        <Form className="login-admin-card">
          <div className="d-flex justify-content-end mb-2">
            <LanguageSwitcher />
          </div>
          <header className="login-admin-card__header">
            <svg
              className="login-admin-card__logo"
              viewBox="0 0 100 92"
              fill="none"
              role="img"
              aria-label="Logo"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 46 L50 8 L92 46"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 46 V84 H80 V46"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M50 50 V80 M37 62 H63" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            </svg>
            <h4 className="login-admin-card__title">{t('login.title')}</h4>
            <p className="login-admin-card__subtitle">{t('login.subtitle')}</p>
          </header>

          <Form.Group className="input-login-wrapper" controlId="login">
            <Form.Label className="fw-bold small">{t('login.username')}</Form.Label>
            <Form.Control
              className="admin__input"
              type="text"
              placeholder={t('login.usernamePlaceholder')}
              value={loginData.login || ''}
              onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </Form.Group>

          <Form.Group className="input-login-wrapper" controlId="password">
            <Form.Label className="fw-bold small">{t('login.password')}</Form.Label>
            <div className="password-field-container">
              <Form.Control
                autoComplete="off"
                className="admin__input admin__password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder')}
                value={loginData.password || ''}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={handleShowPassword}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              >
                <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} />
              </button>
            </div>
          </Form.Group>

          <Button className="w-100 btn-login-submit fw-bold" onClick={handleLogin}>
            {t('login.access')}
          </Button>

          {onGoogleCredential && (
            <>
              <div className="d-flex align-items-center gap-2 my-3 text-secondary small">
                <div className="flex-grow-1 border-top" />
                <span>ou</span>
                <div className="flex-grow-1 border-top" />
              </div>
              <GoogleSignInButton onCredential={onGoogleCredential} />
            </>
          )}

          <button type="button" className="btn-back-link" onClick={() => navigateTo('/esqueci-senha')}>
            Esqueci minha senha
          </button>

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
  onGoogleCredential: PropTypes.func,
  setLoginData: PropTypes.func,
  loginPage: PropTypes.bool,
  setLoginPage: PropTypes.func,
};

export default AdminLoggedOut;
