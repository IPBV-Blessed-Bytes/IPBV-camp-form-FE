import logoFooter from '../../public/Images/logo.png';

const Footer = () => {
  return (
    <footer className="d-flex align-items-center justify-content-between">
      <div className="form__footer d-flex flex-column p-3">
        <p className="form__footer__powered mb-2">Powered by Blessed Bytes Team</p>
        <p className="form__footer__copyright">
          © 2023 Igreja Presbiteriana de Boa Viagem. Todos os Direitos Reservados
        </p>
      </div>

      <img src={logoFooter} className="form__footer-logo" alt="logo" />
    </footer>
  );
};

export default Footer;
