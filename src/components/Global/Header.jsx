import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { enumSteps } from '@/utils/constants';
import '../Style/style.scss';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Icons from './Icons';
import { Button } from 'react-bootstrap';

const Header = ({
  currentStep,
  goToStep,
  formSubmitted,
  showNavMenu,
  handlePreFill,
  highestStepReached,
  backStepFlag,
}) => {
  const headerSteps = [
    'Início',
    'Informações Pessoais',
    'Contato',
    'Pacote',
    'Refeição Extra',
    'Revisão',
    'Items',
    'Pagamento',
  ];

  const navigateTo = useNavigate();

  const handleStepChange = (newStep) => {
    if (window.location.pathname === '/sucesso') {
      navigateTo('/');
      return;
    }

    if (formSubmitted) return;

    if (!backStepFlag) return;

    if (newStep > highestStepReached) return;

    if (newStep <= highestStepReached) {
      handlePreFill(false);
      goToStep(newStep);
    }
  };

  return (
    <header className="form__header">
      <h2>
        <a className="header-title" href="/">
          ACAMPAMENTO IPBV 2026
        </a>
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
                <Icons
                  className="d-none d-lg-block"
                  typeIcon="arrow-right"
                  iconSize={25}
                  fill={index < currentStep ? '#ffc107' : '#fff'}
                />
              )}
            </React.Fragment>
          ))}
        </Breadcrumb>
      )}

      <Button
        className="cart-btn"
        onClick={() => {
          goToStep(enumSteps.beforePayment);
        }}
      >
        <Icons typeIcon="cart" iconSize={30} fill={'#0066cc'} />
      </Button>
    </header>
  );
};

Header.propTypes = {
  currentStep: PropTypes.number.isRequired,
  goToStep: PropTypes.func.isRequired,
  formSubmitted: PropTypes.bool,
  showNavMenu: PropTypes.bool,
};

export default Header;
