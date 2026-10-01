import { useContext } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/Global/Icons';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';

export const StoreNav = ({ onLanding }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoggedIn, displayName } = useContext(AuthContext);
  const firstName = (displayName || '').trim().split(' ')[0];
  return (
    <header className="storefront__nav">
      <Container className="storefront__nav-inner">
        <button type="button" className="storefront__brand storefront__brand--btn" onClick={() => navigate('/')}>
          <span className="storefront__brand-mark">
            <Icons typeIcon="tent" iconSize={36} fill="#ffffff" />
          </span>
          {t('site.nav.brand')}
        </button>
        <nav className="storefront__nav-links">
          {onLanding && <a href="#planos" className='storefront__nav-link-plans'>{t('site.nav.prices')}</a>}
          <button type="button" className="storefront__nav-link-btn" onClick={() => navigate('/ajuda')}>
            {t('site.nav.help')}
          </button>
          {isLoggedIn ? (
            <div className="storefront__nav-account">
              {firstName && <span className="storefront__nav-hi">{t('site.nav.hi', { name: firstName })}</span>}
              <button type="button" className="storefront__nav-login" onClick={() => navigate('/admin')}>
                {t('site.nav.myPanel')}
              </button>
            </div>
          ) : (
            <button type="button" className="storefront__nav-login" onClick={() => navigate('/admin')}>
              {t('site.nav.login')}
            </button>
          )}
        </nav>
      </Container>
    </header>
  );
};

StoreNav.propTypes = {
  onLanding: PropTypes.bool,
};

export const StoreFooter = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="storefront__footer">
      <Container className="storefront__footer-inner">
        <button
          type="button"
          className="storefront__footer-mark"
          onClick={() => navigate('/painel-interno')}
          aria-label={t('site.footer.panelTitle')}
          title={t('site.footer.panelTitle')}
        >
          <Icons typeIcon="tent" iconSize={26} fill="#ffffff" />
        </button>

        <div className="storefront__footer-credits">
          <p className="storefront__footer-powered">
            <a
              href="https://wa.me/5581993727854?text=Ol%C3%A1!%20Queria%20informa%C3%A7%C3%B5es%20acerca%20do%20sistema%20de%20inscri%C3%A7%C3%B5es%20feito%20pelo%20Blessed%20Bytes%20Team."
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('site.footer.poweredBy')}
            </a>
            <span className="storefront__footer-sep"> • </span>
            <em>
              <b>{t('site.footer.verse')}</b>
            </em>
          </p>
          <p className="storefront__footer-copyright">{t('site.footer.copyright', { year: currentYear })}</p>
        </div>
      </Container>
    </footer>
  );
};
