import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Container, Card, Button } from 'react-bootstrap';
import { formPaymentSchema } from '@/form/validations/schema';
import { toast } from 'react-toastify';
import { useFormState } from '@/contexts/FormStateContext';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';
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

const formatBRL = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatPct = (percent) => `${Number(percent).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
const DEFAULT_CARD_PCT = [4.79, 7.31, 8.57, 9.83, 11.09, 12.35, 13.61, 14.87, 16.13, 17.39, 18.65, 19.91];
const toNum = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

const ChooseFormPayment = () => {
  const { backStep, currentFormValues, sendForm, setBackStepFlag, status, updateFormValues } = useFormState();
  const initialValues = currentFormValues;
  const updateForm = updateFormValues('formPayment');

  const [showConfirm, setShowConfirm] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [eventDate, setEventDate] = useState('');
  const [boletoMax, setBoletoMax] = useState('');
  const [minDaysBeforeEvent, setMinDaysBeforeEvent] = useState(20);
  const [fees, setFees] = useState({});

  useEffect(() => {
    Promise.all([
      initBaseDate(),
      getPublicSetting('boleto_max_installments'),
      getPublicSetting('boleto_min_days_before_event'),
      getPublicSetting('payment_fees'),
    ])
      .then(([baseDate, maxValue, minDaysValue, feesValue]) => {
        setEventDate(baseDate || '');
        setBoletoMax(maxValue || '');
        const parsed = Number(minDaysValue);
        if (Number.isFinite(parsed) && parsed > 0) setMinDaysBeforeEvent(parsed);
        try {
          setFees(feesValue ? JSON.parse(feesValue) : {});
        } catch {
          setFees({});
        }
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

  const boletoFeeCents = Math.round((toNum(fees.boletoFixed, 3.49) + toNum(fees.transactionFixed, 0.99)) * 100);
  const pixPercent = toNum(fees.pixPercent, 1.19);
  const pixFixedCents = Math.round(toNum(fees.transactionFixed, 0.99) * 100);
  const cardPct =
    Array.isArray(fees.cardInstallmentPercent) && fees.cardInstallmentPercent.length
      ? fees.cardInstallmentPercent
      : DEFAULT_CARD_PCT;
  const cardMinPct = toNum(cardPct[0], 4.79);
  const cardMaxPct = toNum(cardPct[cardPct.length - 1], 19.91);

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

            {values.formPayment === 'creditCard' && (
              <p className="payment-boleto-fee small mt-3 mb-0">
                <b>Atenção:</b> no cartão há <b>juros que aumentam conforme o número de parcelas</b> (de{' '}
                {formatPct(cardMinPct)} em 1x até {formatPct(cardMaxPct)} em 12x), já incluídos no valor final.
              </p>
            )}

            {values.formPayment === 'pix' && (
              <p className="payment-boleto-fee small mt-3 mb-0">
                <b>Atenção:</b> no PIX há uma taxa de{' '}
                <b>
                  {formatPct(pixPercent)} + {formatBRL(pixFixedCents)}
                </b>
                , já incluída no valor final.
              </p>
            )}

            {values.formPayment === 'ticket' && (
              <p className="payment-boleto-fee small mt-3 mb-0">
                <b>Atenção:</b> cada boleto gerado possui uma taxa da administradora financeira no valor de <b>{formatBRL(boletoFeeCents)}</b>, já incluídos no valor do boleto.
                {installments >= 2 && (
                  <>
                    {' '}Com {installments} boletos, a taxa total fica em <b>{formatBRL(boletoFeeCents * installments)}</b>.
                  </>
                )}
              </p>
            )}

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
                {installments >= 2 && (
                  <p className="payment-installments-warning small mt-2 mb-0">
                    Se o vencimento da <b>última parcela</b> ficar a <b>menos de {minDaysBeforeEvent} dias</b> do início do acampamento,
                    ele é <b>antecipado automaticamente</b> para garantir que o pagamento seja compensado a tempo.
                  </p>
                )}
              </div>
            )}

            {errors.formPayment && <div className="text-danger small mt-2">{errors.formPayment}</div>}
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
            <SpinnerButton
              variant="danger"
              className="btn-cancel"
              onClick={handleConfirmAdvance}
              loading={status === 'loading' || status === 'loaded'}
            >
              Avançar
            </SpinnerButton>
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
