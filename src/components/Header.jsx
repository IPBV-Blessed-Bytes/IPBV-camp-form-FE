import PropTypes from 'prop-types';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const Header = ({ currentStep, goBackToStep }) => {
  const headerSteps = ['Início', 'Dados Pessoais', 'Contato', 'Pacotes', 'Pagamento', 'Final'];

  const handleStepChange = (newStep) => {
    if (newStep <= currentStep) {
      goBackToStep(newStep);
    }
  };

  return (
    <header className="bbp-header">
      <h2>ACAMPAMENTO IPBV 2024</h2>
      <Breadcrumb className="mt-4">
        {headerSteps.map((step, index) => (
          <Breadcrumb.Item key={index} active={currentStep === index} onClick={() => handleStepChange(index)}>
            {step}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </header>
  );
};

Header.propTypes = {
  currentStep: PropTypes.number.isRequired,
  maxStep: PropTypes.number.isRequired,
  nextStep: PropTypes.func.isRequired,
  backStep: PropTypes.func.isRequired,
};

export default Header;
