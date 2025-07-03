import { useEffect } from 'react';
import { useFormik } from 'formik';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { formPaymentSchema } from '@/form/validations/schema';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import Loading from '@/components/Global/Loading';

const ChooseFormPayment = ({
  backStep,
  updateForm,
  initialValues,
  sendForm,
  loading,
  status,
  formValues,
  setBackStepFlag
}) => {
  const formik = useFormik({
    initialValues: {
      formPayment: initialValues.formPayment || '',
      mainPayer: '',
    },
    validationSchema: formPaymentSchema,
    validateOnBlur: false,
    validateOnChange: false,
    context: { shouldValidatePayer: formValues.length > 1 },
    onSubmit: (values) => {
      sendForm(values);
    },
  });

  const { values, errors, handleChange, setValues, handleSubmit } = formik;

  const handleManualSubmit = async () => {
    try {
      await formPaymentSchema.validate(values, {
        context: { shouldValidatePayer: formValues.length > 1 },
        abortEarly: false,
      });
      handleSubmit();
    } catch (validationError) {
      const formattedErrors = {};
      validationError.inner.forEach((error) => {
        if (error.path) {
          formattedErrors[error.path] = error.message;
        }
      });
      formik.setErrors(formattedErrors);
      formik.setTouched({
        formPayment: true,
        mainPayer: true,
      });
    }
  };

  useEffect(() => {
    if (initialValues.formPayment !== values.formPayment) {
      setValues({
        ...values,
        formPayment: '',
      });
    }
  }, [initialValues.formPayment]);

  useEffect(() => {
    toast.info(
      'Importante: não é necessário enviar comprovante de pagamento! Todo o processo é digital e registrado automaticamente em nossa base de dados',
    );
  }, []);

  const selectChangeHandler = (e) => {
    updateForm(e.target.value);
    handleChange(e);
  };

  useEffect(() => {
    setBackStepFlag(true);
  }, []);

  return (
    <Card className="form__container__general-height">
      <Card.Body className="choose-form-payment-custom-padding">
        <Container>
          <Card.Title>Pagamento</Card.Title>
          <Card.Text>
            Escolha a forma de pagamento desejada. <b>Atenção:</b> após selecionar a forma de pagamento, você será
            redirecionado para a tela de finalização, e não será possível voltar para alterar essa opção. Certifique-se
            de sua escolha antes de prosseguir. <b>Importante:</b>{' '}
            <em>não é necessário enviar comprovante de pagamento!</em> Todo o processo é digital e registrado
            automaticamente em nossa base de dados.
          </Card.Text>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>Escolha sua forma de pagamento:</b>
              </Form.Label>
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

            {formValues.length > 1 && (
              <Form.Group className="mb-3 info-text-wrapper">
                <Form.Label>
                  <b>Escolha o responsável pelo pagamento:</b>
                </Form.Label>
                <Form.Select
                  id="mainPayer"
                  name="mainPayer"
                  isInvalid={!!errors.mainPayer}
                  value={values.mainPayer}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Selecione uma opção
                  </option>
                  {formValues.map((form, index) => (
                    <option key={index} value={index}>
                      {form.personalInformation?.name || `Usuário ${index + 1}`}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.mainPayer}</Form.Control.Feedback>
                <Card.Text className="mt-2 mb-0">
                  <em>Informe-nos quem será o responsável pelo pagamento, entre todos que você cadastrou.</em>
                </Card.Text>
              </Form.Group>
            )}
          </Form>

          <Loading loading={loading} />
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button variant="light" onClick={backStep} size="lg">
          Voltar
        </Button>
        <Button
          variant="warning"
          onClick={handleManualSubmit}
          size="lg"
          disabled={status === 'loading' || status === 'loaded'}
        >
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
  loading: PropTypes.bool,
  status: PropTypes.string,
  initialValues: PropTypes.shape({
    formPayment: PropTypes.string,
    personalInformation: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
  formValues: PropTypes.array.isRequired,
};

export default ChooseFormPayment;
