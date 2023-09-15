import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

const FormSuccess = ({ formPayment, initialStep, customerName, resetForm, noPaymentRequired }) => {
  const handleNewRegistration = () => {
    resetForm();
    initialStep();
  };

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <div className="form__success text-center">
            <div className="form__success__title">
              <b>
                Formulário enviado com sucesso, <span className="text-uppercase">{customerName}</span>!
              </b>
            </div>
            <p className="form__success__message">Obrigado por enviar suas informações.</p>
            <p className="form__success__contact">
              {formPayment === 'online' || noPaymentRequired ? (
                <b>Qualquer dúvida entraremos em contato.</b>
              ) : (
                <b>
                  Como a opção de pagamento escolhida foi PRESENCIAL, favor entrar em contato <br />
                  com a secretaria em até 7 dias úteis para efetuar o pagamento.
                </b>
              )}
            </p>
            <small>
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
  customerName: PropTypes.string,
};

export default FormSuccess;
