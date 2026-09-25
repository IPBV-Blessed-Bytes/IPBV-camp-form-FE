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

export const StoreFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="storefront__footer">
      <Container className="storefront__footer-inner">
        <span className="storefront__brand storefront__brand--footer">
          <span className="storefront__brand-mark">
            <Icons typeIcon="tent" iconSize={18} fill="#ffffff" />
          </span>
          Plataforma de Inscrições
        </span>

        <div className="storefront__footer-credits">
          <p className="storefront__footer-powered">
            <a
              href="https://wa.me/5581993727854?text=Ol%C3%A1!%20Queria%20informa%C3%A7%C3%B5es%20acerca%20do%20sistema%20de%20inscri%C3%A7%C3%B5es%20feito%20pelo%20Blessed%20Bytes%20Team."
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by Blessed Bytes Team
            </a>
            <span className="storefront__footer-sep"> • </span>
            <em>
              <b>1 Coríntios 15:58</b>
            </em>
          </p>
          <p className="storefront__footer-copyright">
            © {currentYear} Plataforma de Inscrições • Todos os direitos reservados
          </p>
        </div>
      </Container>
    </footer>
  );
};
