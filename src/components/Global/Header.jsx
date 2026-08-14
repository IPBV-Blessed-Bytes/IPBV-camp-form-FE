import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Button } from 'react-bootstrap';

import { enumSteps } from '@/utils/constants';
import useAuth from '@/hooks/useAuth';
import useBaseYear from '@/hooks/useBaseYear';
import { useFormState } from '@/contexts/FormStateContext';
import { useEventBranding } from '@/contexts/EventBrandingContext';
import { eventPath, stripEventPrefix } from '@/config/eventScope';
import '../Style/Header.scss';
import '../Style/Cart.scss';
import Icons from './Icons';
import FormStepper from './FormStepper';

const HEADER_STEPS = ['Início', 'Dados', 'Contato', 'Pacote', 'Revisão', 'Carrinho', 'Pagamento'];

const Header = ({ showNavMenu = false, stepperSteps, stepperCurrent = 0, stepperMax = 0, onStepperSelect }) => {
  const baseYear = useBaseYear();
  const { name: eventName, year: eventYear } = useEventBranding();
  const headerTitle = eventName || 'ACAMPAMENTO IPBV';
  const headerYear = eventYear || baseYear;
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();
  const displayName = typeof user === 'string' ? user.split('@')[0] : '';
  const formState = useFormState({ optional: true });
  const {
    backStepFlag,
    formSubmitted,
    formValues,
    goToStep,
    handlePreFill,
    hasFood,
    highestStepReached,
    steps,
  } = formState ?? {};

  const handleStepChange = (newStep) => {
    if (stripEventPrefix(location.pathname) === '/sucesso') {
      navigate(eventPath('/'));
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

  const showCartButton = stripEventPrefix(location.pathname) !== '/sucesso' && hasAnyUserName;

  return (
    <header className="form__header">
      <Container>
        <div className="form__header__left">
          <h2 className="header-title-wrapper">
            <a className="header-title" href={eventPath('/')}>
              {headerTitle} {headerYear}
            </a>
          </h2>

          {(showNavMenu || stepperSteps) && (
            <FormStepper
              steps={stepperSteps || HEADER_STEPS}
              current={stepperSteps ? stepperCurrent : steps}
              maxReached={stepperSteps ? stepperMax : highestStepReached}
              lockedIndexes={stepperSteps ? [] : hasFood ? [4] : []}
              onSelect={stepperSteps ? onStepperSelect : handleStepChange}
            />
          )}
        </div>

        <div className="form__header__right">
          {isLoggedIn ? (
            <button type="button" className="header-login-link" onClick={() => navigate('/minha-conta')}>
              Bem-vindo, {displayName}. <br/><span>Entrar na Minha conta</span>
            </button>
          ) : (
            <button type="button" className="header-login-link" onClick={() => navigate('/entrar')}>
              Já tem cadastro? <span>Faça seu login</span>
            </button>
          )}
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
  stepperSteps: PropTypes.arrayOf(PropTypes.string),
  stepperCurrent: PropTypes.number,
  stepperMax: PropTypes.number,
  onStepperSelect: PropTypes.func,
};

export default Header;
