import { useEffect } from 'react';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { formPaymentSchema } from '../../form/validations/schema';
import Loading from '../../components/Loading';

const ChooseFormPayment = ({ backStep, updateForm, initialValues, sendForm, spinnerLoading, status }) => {
  const { values, handleChange, errors, submitForm, setValues } = useFormik({
    initialValues: initialValues.formPayment,
    onSubmit: () => {
      sendForm();
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: formPaymentSchema,
  });

  useEffect(() => {
    if (initialValues.formPayment !== values.formPayment) {
      setValues({
        ...values,
        formPayment: '',
      });
    }
  }, [initialValues.formPayment, setValues, values.formPayment]);

  const selectChangeHandler = (e) => {
    updateForm(e.target.value);
    handleChange(e);
  };

  return (
    <Card className="form__container__general-height">
      <Card.Body className="choose-form-payment-custom-padding">
        <Loading loading={spinnerLoading} />
        <Container>
          <Card.Title>Pagamento</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Escolha sua forma de pagamento:</Form.Label>
              <Form.Select
                id="formPayment"
                name="formPayment"
                isInvalid={!!errors.formPayment}
                value={values.formPayment}
                onChange={selectChangeHandler}
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <option value="creditCard">Cartão de Crédito (Até 12x)</option>
                <option value="pix">PIX</option>
                <option value="ticket">Boleto</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.formPayment}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button variant="light" onClick={backStep} size="lg">
          Voltar
        </Button>
        <Button variant="warning" onClick={submitForm} size="lg" disabled={status === 'loading' || status === 'loaded'}>
          Avançar
        </Button>
      </div>
    </Card>
  );
};

ChooseFormPayment.propTypes = {
  backStep: PropTypes.func,
  updateForm: PropTypes.func,
  sendForm: PropTypes.func,
  spinnerLoading: PropTypes.func,
  initialValues: PropTypes.shape({
    formPayment: PropTypes.string,
  }),
};

export default ChooseFormPayment;
