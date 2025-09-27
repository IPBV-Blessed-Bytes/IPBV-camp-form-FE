import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ⬅️ useLocation importado
import PropTypes from 'prop-types';
import { enumSteps } from '@/utils/constants';
import '../Style/style.scss';
import { Container, Breadcrumb } from 'react-bootstrap';
import Icons from './Icons';
import { Button } from 'react-bootstrap';

const Header = ({
  backStepFlag,
  formSubmitted,
  formValues,
  goToStep,
  handlePreFill,
  hasFood,
  highestStepReached,
  showNavMenu,
  steps,
}) => {
  const headerSteps = [
    'Início',
    'Informações Pessoais',
    'Contato',
    'Pacote',
    // 'Refeição Extra',
    'Revisão',
    'Items',
    'Pagamento',
  ];

  const navigateTo = useNavigate();
  const location = useLocation();

  const handleStepChange = (newStep) => {
    if (location.pathname === '/sucesso') {
      navigateTo('/');
      return;
    }

    if (formSubmitted) return;
    if (!backStepFlag) return;
    if (newStep === 4 && hasFood) return;
    if (newStep > highestStepReached) return;

    if (newStep <= highestStepReached) {
      handlePreFill(false);
      goToStep(newStep);
    }
  };

  return (
    <header className="form__header">
      <Container>
        <div className="form__header__left">
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
                    className={`${
                      index > steps ? 'form__header--future-step' : index < steps ? 'form__header--previous-step' : ''
                    } ${index === 4 && hasFood ? 'disabled-link' : ''}`}
                    active={steps === index}
                    onClick={() => handleStepChange(index)}
                  >
                    {step}
                  </Breadcrumb.Item>
                  {index < headerSteps.length - 1 && (
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
          {location.pathname !== '/sucesso' &&
            Array.isArray(formValues) &&
            formValues.some((user) => user?.personalInformation?.name?.trim()) && (
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
  backStepFlag: PropTypes.bool,
  formSubmitted: PropTypes.bool,
  formValues: PropTypes.array,
  goToStep: PropTypes.func,
  handlePreFill: PropTypes.func,
  highestStepReached: PropTypes.number,
  showNavMenu: PropTypes.bool,
  steps: PropTypes.number,
  hasFood: PropTypes.bool,
};

export default Header;
