import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const Header = ({ currentStep, goBackToStep, formSubmitted, showNavMenu }) => {
  const headerSteps = ['Início', 'Dados Pessoais', 'Contato', 'Pacotes', 'Revisão', 'Pagamento'];
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
        <a href="/">ACAMPAMENTO IPBV 2024</a>
      </h2>
      {showNavMenu && (
        <Breadcrumb className="mt-4">
          {headerSteps.map((step, index) => (
            <Breadcrumb.Item key={index} active={currentStep === index} onClick={() => handleStepChange(index)}>
              {step}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
    </header>
  );
};

Header.propTypes = {
  currentStep: PropTypes.number.isRequired,
  goBackToStep: PropTypes.number.isRequired,
  formSubmitted: PropTypes.bool,
};

export default Header;
