import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Container, Card, Form, Button, Modal } from 'react-bootstrap';
import { formPaymentSchema } from '@/form/validations/schema';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';

const ChooseFormPayment = ({ backStep, initialValues, loading, sendForm, setBackStepFlag, status, updateForm }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      formPayment: initialValues.formPayment || '',
    },
    validationSchema: formPaymentSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      sendForm(values);
    },
  });

  const { values, errors, handleChange, setValues, handleSubmit } = formik;

  const handleManualSubmit = async () => {
    try {
      await formPaymentSchema.validate(values, { abortEarly: false });
      setShowConfirm(true);
    } catch (validationError) {
      const formattedErrors = {};
      validationError.inner.forEach((error) => {
        if (error.path) {
          formattedErrors[error.path] = error.message;
        }
      });
      formik.setErrors(formattedErrors);
      formik.setTouched({ formPayment: true });
    }
  };

  const handleConfirmAdvance = () => {
    setShowConfirm(false);
    handleSubmit();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialValues.formPayment !== values.formPayment) {
      setValues({ formPayment: '' });
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setBackStepFlag(true);
  }, []);

  return (
    <>
      <Card className="form__container__general-height">
        <Card.Body className="choose-form-payment-custom-padding">
          <Container>
            <Card.Title>Pagamento</Card.Title>
            <Card.Text>
              Escolha a forma de pagamento desejada. <b>Atenção:</b> após selecionar a forma de pagamento, você será
              redirecionado para a tela de finalização, e não será possível voltar para alterar essa opção.
              Certifique-se de sua escolha antes de prosseguir. <b>Importante:</b>{' '}
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

      <Modal className="custom-modal" show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Avançar para Pagamento</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Ao continuar, <b>seu carrinho será apagado</b> e não será possível alterar os dados já preenchidos ou a
            forma de pagamento.
          </p>
          <p>
            Caso prefira, você poderá <b>refazer a inscrição do zero</b> posteriormente.
          </p>
          <p>Deseja realmente prosseguir?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirm(false)}>
            Voltar
          </Button>
          <Button variant="danger" className="btn-cancel" onClick={handleConfirmAdvance}>
            Avançar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

ChooseFormPayment.propTypes = {
  backStep: PropTypes.func,
  formValues: PropTypes.array.isRequired,
  initialValues: PropTypes.shape({
    formPayment: PropTypes.string,
  }),
  loading: PropTypes.bool,
  sendForm: PropTypes.func,
  setBackStepFlag: PropTypes.func,
  status: PropTypes.string,
  updateForm: PropTypes.func,
};

export default ChooseFormPayment;
