import PropTypes from 'prop-types';
import { Container, Card, Button } from 'react-bootstrap';
import campLogo from '../../../public/Images/camp_logo.png';
import './style.scss'

const Success = ({ initialStep, resetForm, resetFormSubmitted }) => {
  const pathnamePagarme = window.location.search;

  const handleNewRegistration = () => {
    resetForm();
    initialStep();
    resetFormSubmitted();
    window.location.pathname = '/';
  };

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <div className="form__success text-center">
            <div className="form__success__title">
              <b>Formulário enviado com sucesso!</b>
            </div>
            <p className="form__success__message">Obrigado por enviar suas informações.</p>
            <p className="form__success__contact">
              <b>Qualquer dúvida entraremos em contato.</b>
              <br />
              <b>Nos vemos em Garanhuns!!!</b>
            </p>
            <small className={`${pathnamePagarme ? 'mt-5' : ''}`}>
              <em>Igreja Presbiteriana de Boa Viagem</em>
            </small>
            <img src={campLogo} className="form__success__logo" alt="logo" />
          </div>
        </Container>
      </Card.Body>

      <div className="form__container__buttons text-center justify-content-center">
        <Button variant="warning" size="lg" onClick={handleNewRegistration} className="form-success__button">
          Novo Cadastro
        </Button>
      </div>
    </Card>
  );
};

Success.propTypes = {
  formPayment: PropTypes.string,
  initialStep: PropTypes.func,
  resetForm: PropTypes.func,
  resetFormSubmitted: PropTypes.func,
  noPaymentRequired: PropTypes.bool,
};

export default Success;
