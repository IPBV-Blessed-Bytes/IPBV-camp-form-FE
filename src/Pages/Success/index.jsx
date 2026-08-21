import { Container, Button } from 'react-bootstrap';
import campLogo from '../../../public/Images/camp_logo.png';
import { useFormState } from '@/contexts/FormStateContext';
import FormStepLayout from '@/components/Global/FormStepLayout';
import './style.scss';

const Success = () => {
  const { initialStep, resetFormValues, resetFormSubmitted } = useFormState();

  const handleNewRegistration = () => {
    resetFormValues();
    initialStep();
    resetFormSubmitted();
    window.location.pathname = '/';
  };

  return (
    <FormStepLayout
      footer={
        <div className="d-flex justify-content-center w-100">
          <Button variant="warning" size="lg" onClick={handleNewRegistration} className="form-success__button">
            Novo Cadastro
          </Button>
        </div>
      }
    >
      <Container>
        <div className="success">
          <div className="success__badge">
            <svg className="success__check" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="success__check-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="success__check-mark" fill="none" d="M15 27 l7 7 l15 -16" />
            </svg>
          </div>

          <h2 className="success__title">Formulário enviado com sucesso!</h2>
          <p className="success__message">Obrigado por enviar suas informações.</p>

          <p className="success__contact">
            Qualquer dúvida entraremos em contato.
            <br />
            <strong>Nos vemos em Garanhuns!</strong>
          </p>

          <span className="success__church">Igreja Presbiteriana de Boa Viagem</span>

          <img src={campLogo} className="success__logo" alt="Logo do acampamento" />
        </div>
      </Container>
    </FormStepLayout>
  );
};

export default Success;
