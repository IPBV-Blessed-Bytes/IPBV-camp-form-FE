import { PropTypes } from 'prop-types';
import '../Style/Footer.scss';
import logoFooter from '../../../public/Images/logo.png';

const Footer = ({ handleAdminClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="form__footer">
      <a className="form__footer__admin" onClick={handleAdminClick}>
        <img src={logoFooter} className="form__footer-logo" alt="logo" />
      </a>
      <div className="form__footer__credits">
        <p className="form__footer__powered">
          <a className="mail-to" href="mailto:alvinho.leal@live.com">
            Powered by Blessed Bytes Team
          </a>
          <span className="form__footer__sep"> • </span>
          <em>
            <b>1 Coríntios 15:58</b>
          </em>
        </p>
        <p className="form__footer__copyright">
          © {currentYear} Igreja Presbiteriana de Boa Viagem • Todos os Direitos Reservados
        </p>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  handleAdminClick: PropTypes.func,
};

export default Footer;
