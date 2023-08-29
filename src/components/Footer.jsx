import logoFooter from '../../public/Images/logo.png';

function Footer() {
  return (
    <footer className="d-flex align-items-center">
      <div className="d-flex flex-column p-3">
        <p className="mb-1">Powered by Blessed Bytes Team</p>
        <p className="bbp-copyright">© 2023 Igreja Presbiteriana de Boa Viagem. Inc. Todos os Direitos Reservados</p>
      </div>

      <img src={logoFooter} className="bbp-footer-logo" alt="logo" />
    </footer>
  );
}

export default Footer;
