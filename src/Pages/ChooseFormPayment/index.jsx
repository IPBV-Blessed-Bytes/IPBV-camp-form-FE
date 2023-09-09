import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { formPaymentSchema } from '../../form/validations/schema';

function ChooseFormPayment({ nextStep, skipTwoSteps, backStep, updateForm, initialValues }) {
  const { values, handleChange, errors, submitForm } = useFormik({
    initialValues,
    onSubmit: () => {
      if (values.formPayment === 'online') {
        nextStep();
      } else {
        skipTwoSteps();
      }
      updateForm(values);
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: formPaymentSchema,
  });

  return (
    <Card className="bbp-general-height">
      <Card.Body>
        <Container>
          <Card.Title>Pagamento</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Escolha sua forma de pagamento</Form.Label>
              <Form.Select
                id="formPayment"
                name="formPayment"
                isInvalid={!!errors.formPayment}
                value={values.formPayment}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <option value="online">Online (preferencial)</option>
                <option value="inPerson">Presencialmente (secretaria da igreja)</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.formPayment}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Container>
      </Card.Body>

      <div className="form-footer-container">
        <Button variant="light" onClick={backStep} size="lg">
          Voltar
        </Button>
        <Button variant="warning" onClick={submitForm} size="lg">
          Avançar
        </Button>
      </div>
    </Card>
  );
}

ChooseFormPayment.propTypes = {
  nextStep: PropTypes.func,
  skipTwoSteps: PropTypes.func,
  backStep: PropTypes.func,
  updateForm: PropTypes.func,
  initialValues: PropTypes.shape({
    formPayment: PropTypes.string,
  }),
};

export default ChooseFormPayment;
