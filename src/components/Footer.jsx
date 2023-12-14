// Footer.js
import React from 'react';
import { PropTypes } from 'prop-types';
import { useNavigate } from 'react-router-dom';
import logoFooter from '../../public/Images/logo.png';

const Footer = ({ onAdminClick }) => {
  const navigateTo = useNavigate();

  const handleAdminClick = () => {
    onAdminClick();
  };

  return (
    <footer className="d-flex align-items-center justify-content-between">
      <div className="form__footer d-flex flex-column p-3">
        <p className="form__footer__powered mb-2">Powered by Blessed Bytes Team</p>
        <p className="form__footer__copyright">
          © 2023 Igreja Presbiteriana de Boa Viagem. Todos os Direitos Reservados
        </p>
      </div>

      <a onClick={handleAdminClick}>
        <img src={logoFooter} className="form__footer-logo" alt="logo" />
      </a>
    </footer>
  );
};

Footer.propTypes = {
  onAdminClick: PropTypes.func.isRequired,
};

export default Footer;
