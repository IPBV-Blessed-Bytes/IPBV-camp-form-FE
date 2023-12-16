import PropTypes from 'prop-types';
import { Container, Card, Button } from 'react-bootstrap';

const FormSuccess = ({ initialStep, resetForm, resetFormSubmitted }) => {
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
              {pathnamePagarme ? (
                <b>Qualquer dúvida entraremos em contato.</b>
              ) : (
                <b>
                  Caso a opção de pagamento escolhida tenha sido PRESENCIAL, favor entrar em contato com a secretaria em
                  até 7 dias úteis para efetuar o pagamento. Qualquer impedimento, favor contactar a administração.
                </b>
              )}
            </p>
            <small className="mt-5">
              <em>Igreja Presbiteriana de Boa Viagem</em>
            </small>
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

FormSuccess.propTypes = {
  formPayment: PropTypes.string,
  initialStep: PropTypes.func,
  resetForm: PropTypes.func,
  resetFormSubmitted: PropTypes.func,
  noPaymentRequired: PropTypes.bool,
};

export default FormSuccess;
