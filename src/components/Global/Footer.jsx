import { PropTypes } from 'prop-types';
import '../Style/Footer.scss';
import logoFooter from '../../../public/Images/logo.png';
import Icons from '@/components/Global/Icons';

const Footer = ({ handleAdminClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="form__footer">
      <div className="form__footer__brand">
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
      </div>

      <a
        className="form__footer__contact"
        href="https://wa.me/5581999997767"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icons typeIcon="whatsapp" iconSize={20} fill="#fff" />
        <span>(81) 99999-7767</span>
      </a>
    </footer>
  );
};

Footer.propTypes = {
  handleAdminClick: PropTypes.func,
};

export default Footer;
