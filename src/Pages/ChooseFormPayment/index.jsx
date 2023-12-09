import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import { formPaymentSchema } from '../../form/validations/schema';

const ChooseFormPayment = ({ backStep, updateForm, initialValues, sendForm, spinnerLoading}) => {
  const { values, handleChange, errors, submitForm } = useFormik({
    initialValues: initialValues.formPayment,
    onSubmit: () => {
      sendForm();
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: formPaymentSchema,
  });

  const selectChangeHandler = (e) => {
    updateForm(e.target.value);
    handleChange(e);
  };

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        {spinnerLoading && (
          <div className="overlay">
            <div className="spinner-container">
              <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
            </div>
          </div>
        )}
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
                <option value="online">ONLINE (preferencial)</option>
                <option value="inPerson">PRESENCIAL (secretaria da igreja)</option>
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
        <Button variant="warning" onClick={submitForm} size="lg">
          Avançar
        </Button>
      </div>
    </Card>
  );
};

ChooseFormPayment.propTypes = {
  nextStep: PropTypes.func,
  skipTwoSteps: PropTypes.func,
  backStep: PropTypes.func,
  updateForm: PropTypes.func,
  sendForm: PropTypes.func,
  initialValues: PropTypes.shape({
    formPayment: PropTypes.string,
  }),
};

export default ChooseFormPayment;
