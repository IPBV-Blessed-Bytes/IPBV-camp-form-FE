import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Container, Card, Button } from 'react-bootstrap';
import { formPaymentSchema } from '@/form/validations/schema';
import { toast } from 'react-toastify';
import { useFormState } from '@/contexts/FormStateContext';
import './style.scss';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import FormStepLayout from '@/components/Global/FormStepLayout';
import Icons from '@/components/Global/Icons';
import { getPublicSetting } from '@/services/settings';
import { getMaxBoletoInstallments } from '@/utils/boletoInstallments';
import { initBaseDate } from '@/Pages/Packages/utils/calculateAge';

const PAYMENT_OPTIONS = [
  { key: 'creditCard', label: 'Cartão de Crédito', description: 'Parcele em até 12x', icon: 'credit-card' },
  { key: 'pix', label: 'PIX', description: 'Aprovação na hora', icon: 'cash' },
  { key: 'ticket', label: 'Boleto', description: 'Vencimento em 3 dias', icon: 'barcode' },
];

const ChooseFormPayment = () => {
  const { backStep, currentFormValues, loading, sendForm, setBackStepFlag, status, updateFormValues } = useFormState();
  const initialValues = currentFormValues;
  const updateForm = updateFormValues('formPayment');

  const [showConfirm, setShowConfirm] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [eventDate, setEventDate] = useState('');
  const [boletoMax, setBoletoMax] = useState('');

  useEffect(() => {
    Promise.all([initBaseDate(), getPublicSetting('boleto_max_installments')])
      .then(([baseDate, maxValue]) => {
        setEventDate(baseDate || '');
        setBoletoMax(maxValue || '');
      })
      .catch(() => {});
  }, []);

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

  const { values, errors, setValues } = formik;

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
    sendForm({ formPayment: values.formPayment, boletoInstallments: installments });
  };

  useEffect(() => {
    if (initialValues.formPayment !== values.formPayment) {
      setValues({ formPayment: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.formPayment]);

  useEffect(() => {
    toast.info(
      'Importante: não é necessário enviar comprovante de pagamento! Todo o processo é digital e registrado automaticamente em nossa base de dados',
    );
  }, []);

  const handleSelectPayment = (key) => {
    updateForm(key);
    setValues({ formPayment: key });
    setInstallments(1);
    formik.setErrors({});
  };

  const boletoConfigured = Boolean(eventDate);
  const maxInstallments = boletoConfigured ? getMaxBoletoInstallments(eventDate, boletoMax) : 1;
  const boletoAvailable = boletoConfigured ? maxInstallments >= 1 : true;
  const visibleOptions = PAYMENT_OPTIONS.filter((option) => option.key !== 'ticket' || boletoAvailable);
  const showInstallments = values.formPayment === 'ticket' && maxInstallments >= 2;

  useEffect(() => {
    setBackStepFlag(true);
  }, [setBackStepFlag]);

  return (
    <>
      <FormStepLayout
        title="Pagamento"
        onBack={backStep}
        onNext={handleManualSubmit}
        nextDisabled={status === 'loading' || status === 'loaded'}
      >
        <Container>
            <Card.Text>
              Escolha a forma de pagamento desejada. <b>Atenção:</b> após selecionar a forma de pagamento, você será
              redirecionado para a tela de finalização, e não será possível voltar para alterar essa opção.
              Certifique-se de sua escolha antes de prosseguir. <b>Importante:</b>{' '}
              <em>não é necessário enviar comprovante de pagamento!</em> Todo o processo é digital e registrado
              automaticamente em nossa base de dados.
            </Card.Text>

            <p className="payment-heading">
              <b>Escolha sua forma de pagamento:</b>
            </p>
            <div className="payment-grid">
              {visibleOptions.map((option) => {
                const active = values.formPayment === option.key;
                const description =
                  option.key === 'ticket' && maxInstallments >= 2
                    ? `Parcele em até ${maxInstallments}x (boletos mensais)`
                    : option.description;
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`payment-card ${active ? 'is-active' : ''}`}
                    onClick={() => handleSelectPayment(option.key)}
                  >
                    <span className="payment-card__icon">
                      <Icons typeIcon={option.icon} iconSize={26} fill={active ? '#fff' : '#007185'} />
                    </span>
                    <span className="payment-card__title">{option.label}</span>
                    <span className="payment-card__desc">{description}</span>
                    {active && <span className="payment-card__badge">Selecionado</span>}
                  </button>
                );
              })}
            </div>

            {showInstallments && (
              <div className="payment-installments-block mt-3">
                <p className="mb-2">
                  <b>Em quantas parcelas (boletos mensais)?</b>
                </p>
                <div className="payment-installments">
                  {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`installment-chip ${installments === n ? 'is-active' : ''}`}
                      onClick={() => setInstallments(n)}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
                <p className="text-secondary small mt-3 mb-0">
                  Serão gerados {installments} {installments === 1 ? 'boleto' : 'boletos mensais'}. O 1º confirma sua
                  vaga; os demais mantêm a inscrição em dia.
                </p>
              </div>
            )}

            {errors.formPayment && <div className="text-danger small mt-2">{errors.formPayment}</div>}

            <Loading loading={loading} />
          </Container>
      </FormStepLayout>

      <CustomModal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        variant="cancel"
        title="Avançar para Pagamento"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowConfirm(false)}>
              Voltar
            </Button>
            <Button variant="danger" className="btn-cancel" onClick={handleConfirmAdvance}>
              Avançar
            </Button>
          </>
        }
      >
        <p>
          Ao continuar, <b>seu carrinho será apagado</b> e não será possível alterar os dados já preenchidos ou a
          forma de pagamento.
        </p>
        <p>
          Caso prefira, você poderá <b>refazer a inscrição do zero</b> posteriormente.
        </p>
        <p>Deseja realmente prosseguir?</p>
      </CustomModal>
    </>
  );
};

export default ChooseFormPayment;
