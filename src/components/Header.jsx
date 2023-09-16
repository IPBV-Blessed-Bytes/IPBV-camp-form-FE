import PropTypes from 'prop-types';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const Header = ({ currentStep, goBackToStep, formSubmitted }) => {
  const headerSteps = ['Início', 'Dados Pessoais', 'Contato', 'Pacotes', 'Pagamento', 'Final'];

  const handleStepChange = (newStep) => {
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
  goBackToStep: PropTypes.number.isRequired,
  formSubmitted: PropTypes.bool,
};

export default Header;
