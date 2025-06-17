import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../Style/style.scss';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Icons from './Icons';
import { Button, Modal } from 'react-bootstrap';
import Cart from './Cart';

const Header = ({ currentStep, goBackToStep, formSubmitted, showNavMenu, formValues }) => {
  const headerSteps = ['Início', 'Informações Pessoais', 'Contato', 'Pacote', 'Refeição Extra', 'Revisão', 'Pagamento'];
  const [showCartModal, setShowCartModal] = useState(false);
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

      <Button className="cart-btn" onClick={() => setShowCartModal(true)}>
        <Icons typeIcon="cart" iconSize={30} fill={'#0066cc'} />
      </Button>

      <Modal show={showCartModal} onHide={() => setShowCartModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Resumo do Carrinho</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-0'>
          <Cart formValues={formValues} />
        </Modal.Body>
      </Modal>
    </header>
  );
};

Header.propTypes = {
  currentStep: PropTypes.number.isRequired,
  goBackToStep: PropTypes.func.isRequired,
  formSubmitted: PropTypes.bool,
  showNavMenu: PropTypes.bool,
  formValues: PropTypes.object
};

export default Header;
