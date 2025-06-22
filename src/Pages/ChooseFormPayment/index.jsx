import { useEffect } from 'react';
import { useFormik } from 'formik';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { formPaymentSchema } from '@/form/validations/schema';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import Loading from '@/components/Global/Loading';
import fetcher from '@/fetchers';
import { BASE_URL } from '@/config';

const ChooseFormPayment = ({ backStep, updateForm, initialValues, sendForm, loading, status, savedUsers }) => {
  const { values, handleChange, errors, submitForm, setValues } = useFormik({
    initialValues: initialValues.formPayment,
    onSubmit: async () => {
      try {
        const couponsResponse = await fetcher.get(`${BASE_URL}/coupon`);
        const coupons = couponsResponse.data.coupons;
        const allCampers = (savedUsers?.length && savedUsers) || [];

        for (const camper of allCampers) {
          const cpf = camper?.personalInformation?.cpf;
          const matchingCoupon = coupons.find((coupon) => coupon.cpf === cpf);

          if (matchingCoupon && !matchingCoupon.user) {
            await fetcher.put(`${BASE_URL}/coupon/${matchingCoupon.id}`, {
              ...matchingCoupon,
              user: initialValues?.personalInformation.name,
            });
          }
        }

        sendForm();
      } catch (error) {
        toast.error('Erro ao finalizar validação do cupom. Tente novamente.');
        console.error('Erro na validação final do cupom:', error);
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
  }, [initialValues.formPayment, setValues, values, values.formPayment]);

  useEffect(() => {
    toast.info(
      'Importante: não é necessário enviar comprovante de pagamento! Todo o processo é digital e registrado automaticamente em nossa base de dados',
    );
  }, []);

  const selectChangeHandler = (e) => {
    updateForm(e.target.value);
    handleChange(e);
  };

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
          </Form>

          <Loading loading={loading} />
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
  loading: PropTypes.bool,
  status: PropTypes.string,
  savedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      personalInformation: PropTypes.shape({
        cpf: PropTypes.string,
      }),
    }),
  ),
  initialValues: PropTypes.shape({
    formPayment: PropTypes.string,
    personalInformation: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
};

export default ChooseFormPayment;
