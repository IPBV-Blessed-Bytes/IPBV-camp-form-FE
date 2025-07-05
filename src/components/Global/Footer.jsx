import { PropTypes } from 'prop-types';
import '../Style/style.scss';
import logoFooter from '../../../public/Images/logo.png';

const Footer = ({ handleAdminClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="d-flex align-items-center justify-content-between">
      <div className="form__footer d-flex flex-column p-3">
        <p className="form__footer__powered mb-2">
          <a className="mail-to" href={`mailto:alvinho.leal@live.com`}>
            Powered by Blessed Bytes Team{' '}
          </a>
          <span>•</span>{' '}
          <em>
            <b>1 Coríntios 15:58</b>
          </em>
        </p>
        <p className="form__footer__copyright">
          © {currentYear} Igreja Presbiteriana de Boa Viagem • Todos os Direitos Reservados
        </p>
      </div>

      <a onClick={handleAdminClick}>
        <img src={logoFooter} className="form__footer-logo" alt="logo" />
      </a>
    </footer>
  );
};

Footer.propTypes = {
  handleAdminClick: PropTypes.func.isRequired,
};

export default Footer;
