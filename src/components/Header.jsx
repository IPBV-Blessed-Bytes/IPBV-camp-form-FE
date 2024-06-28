import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Icons from './Icons';

const Header = ({ currentStep, goBackToStep, formSubmitted, showNavMenu }) => {
  const headerSteps = ['Início', 'Informações Pessoais', 'Contato', 'Pacotes', 'Alimentação Extra', 'Revisão', 'Pagamento'];
  const navigateTo = useNavigate();

  const handleStepChange = (newStep) => {
    if (window.location.pathname === '/sucesso') {
      navigateTo('/');
      return;
    }

    if (formSubmitted) {
      return;
    }

    if (newStep <= currentStep) {
      goBackToStep(newStep);
    }
  };

  return (
    <header className="form__header">
      <h2>
        <a href="/">ACAMPAMENTO IPBV 2025</a>
      </h2>
      {showNavMenu && (
        <Breadcrumb className="mt-4">
          {headerSteps.map((step, index) => (
            <React.Fragment key={index}>
              <Breadcrumb.Item
                className={
                  index > currentStep
                    ? 'form__header--future-step'
                    : index < currentStep
                    ? 'form__header--previous-step'
                    : ''
                }
                active={currentStep === index}
                onClick={() => handleStepChange(index)}
              >
                {step}
              </Breadcrumb.Item>
              {index < headerSteps.length - 1 && (
                <Icons className="d-none d-lg-block" typeIcon="arrow-right" iconSize={25} fill={index < currentStep ? '#ffc107' : '#fff'} />
              )}
            </React.Fragment>
          ))}
        </Breadcrumb>
      )}
    </header>
  );
};

Header.propTypes = {
  currentStep: PropTypes.number.isRequired,
  goBackToStep: PropTypes.func.isRequired,
  formSubmitted: PropTypes.bool,
  showNavMenu: PropTypes.bool,
};

export default Header;
