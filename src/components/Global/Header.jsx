import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Breadcrumb, Button } from 'react-bootstrap';

import { enumSteps } from '@/utils/constants';
import useBaseYear from '@/hooks/useBaseYear';
import { useFormState } from '@/contexts/FormStateContext';
import '../Style/style.scss';
import Icons from './Icons';

const HEADER_STEPS = ['Início', 'Informações Pessoais', 'Contato', 'Pacote', 'Revisão', 'Carrinho', 'Pagamento'];

const Header = ({ showNavMenu = false }) => {
  const baseYear = useBaseYear();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    backStepFlag,
    formSubmitted,
    formValues,
    goToStep,
    handlePreFill,
    hasFood,
    highestStepReached,
    steps,
  } = useFormState();

  const handleStepChange = (newStep) => {
    if (location.pathname === '/sucesso') {
      navigate('/');
      return;
    }

    if (formSubmitted) return;
    if (!backStepFlag) return;
    if (newStep === 4 && hasFood) return;
    if (newStep > highestStepReached) return;

    handlePreFill(false);
    goToStep(newStep);
  };

  const hasAnyUserName =
    Array.isArray(formValues) && formValues.some((user) => user?.personalInformation?.name?.trim());

  const showCartButton = location.pathname !== '/sucesso' && hasAnyUserName;

  return (
    <header className="form__header">
      <Container>
        <div className="form__header__left">
          <h2>
            <a className="header-title" href="/">
              ACAMPAMENTO IPBV {baseYear}
            </a>
          </h2>

          {showNavMenu && (
            <Breadcrumb className="mt-4">
              {HEADER_STEPS.map((step, index) => (
                <React.Fragment key={index}>
                  <Breadcrumb.Item
                    className={`${
                      index > steps ? 'form__header--future-step' : index < steps ? 'form__header--previous-step' : ''
                    } ${index === 4 && hasFood ? 'disabled-link' : ''}`}
                    active={steps === index}
                    onClick={() => handleStepChange(index)}
                  >
                    {step}
                  </Breadcrumb.Item>
                  {index < HEADER_STEPS.length - 1 && (
                    <>
                      <Icons
                        className="d-none d-lg-block"
                        typeIcon="simple-arrow"
                        iconSize={15}
                        fill={index < steps ? '#ffc107' : '#fff'}
                      />
                      <span className="d-lg-none">•</span>
                    </>
                  )}
                </React.Fragment>
              ))}
            </Breadcrumb>
          )}
        </div>

        <div className="form__header__right">
          {showCartButton && (
            <Button
              className="cart-btn"
              onClick={() => {
                goToStep(enumSteps.beforePayment);
                sessionStorage.setItem('enteredFromFinalReview', 'false');
              }}
            >
              <Icons typeIcon="cart" iconSize={30} fill={'#0066cc'} />
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
};

Header.propTypes = {
  showNavMenu: PropTypes.bool,
};

export default Header;
