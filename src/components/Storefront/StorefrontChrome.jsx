import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/Global/Icons';

export const StoreNav = ({ onLanding }) => {
  const navigate = useNavigate();
  return (
    <header className="storefront__nav">
      <Container className="storefront__nav-inner">
        <button type="button" className="storefront__brand storefront__brand--btn" onClick={() => navigate('/')}>
          <span className="storefront__brand-mark">
            <Icons typeIcon="tent" iconSize={20} fill="#ffffff" />
          </span>
          Plataforma de Inscrições
        </button>
        <nav className="storefront__nav-links">
          {onLanding && <a href="#planos">Preços</a>}
          <button type="button" className="storefront__nav-login" onClick={() => navigate('/admin')}>
            Entrar
          </button>
        </nav>
      </Container>
    </header>
  );
};

StoreNav.propTypes = {
  onLanding: PropTypes.bool,
};

export const StoreFooter = () => (
  <footer className="storefront__footer">
    <Container className="storefront__footer-inner">
      <span className="storefront__brand storefront__brand--footer">
        <span className="storefront__brand-mark">
          <Icons typeIcon="tent" iconSize={18} fill="#ffffff" />
        </span>
        Plataforma de Inscrições
      </span>
      <span className="storefront__footer-note">Inscrições, pagamentos e gestão para eventos da sua igreja.</span>
    </Container>
  </footer>
);
