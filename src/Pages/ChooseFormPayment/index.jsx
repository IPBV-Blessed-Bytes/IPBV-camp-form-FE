import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import { formPaymentSchema } from '../../form/validations/schema';

const ChooseFormPayment = ({ backStep, updateForm, initialValues, sendForm, spinnerLoading }) => {
  const navigateTo = useNavigate();
  const { values, handleChange, errors, submitForm, setValues } = useFormik({
    initialValues: initialValues.formPayment,
    onSubmit: () => {
      sendForm();

      if (values.formPayment === 'inPerson') {
        navigateTo('/sucesso');
      }
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
      <Card.Body>
        {spinnerLoading && (
          <div className="overlay">
            <div className="spinner-container">
              <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
              <span>Carregando dados</span>
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
                <option value="online">ONLINE (prioritariamente)</option>
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
        <Button variant="success" onClick={submitForm} size="lg">
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
