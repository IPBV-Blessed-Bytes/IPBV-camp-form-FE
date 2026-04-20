import { useEffect } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { FormikProvider, useFormik } from 'formik';
import { toast } from 'react-toastify';
import { cpf } from 'cpf-cnpj-validator';

import { personalInformationSchema } from '@/form/validations/schema';
import { checkCoupon } from '@/services/coupons';
import { useFormState } from '@/contexts/FormStateContext';

import AgeConfirmationModal from './components/AgeConfirmationModal';
import PrefillModal from './components/PrefillModal';
import IdentificationRow from './components/IdentificationRow';
import NameAndRgRow from './components/NameAndRgRow';
import RgShipperRow from './components/RgShipperRow';
import GenderAndGuardianRow from './components/GenderAndGuardianRow';
import useAgeValidation from './hooks/useAgeValidation';
import usePreviousYearPrefill from './hooks/usePreviousYearPrefill';
import { restoreScrollWhenMobile } from './utils/fieldHelpers';

import { FORM_STORAGE_KEYS, getTempData } from '@/utils/formStorage';
import './style.scss';

const PersonalData = () => {
  const {
    backStep,
    currentFormIndex,
    formValues,
    handleDiscountChange,
    nextStep,
    setBackStepFlag,
    updateFormValues,
  } = useFormState();

  const initialValues = formValues[currentFormIndex]?.personalInformation || {};
  const updateForm = updateFormValues('personalInformation');

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: personalInformationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      if (!cpf.isValid(values.cpf)) {
        toast.error('CPF inválido! Por favor, insira um CPF válido.');
        return;
      }

      if (values.cpf === values.legalGuardianCpf) {
        toast.error('CPF do acampante não pode ser igual ao CPF do responsável legal');
        return;
      }

      const cpfAlreadyExists = formValues?.some((user, index) => {
        if (index === currentFormIndex) return false;
        return user?.personalInformation?.cpf === values.cpf;
      });

      if (cpfAlreadyExists) {
        toast.error('Este CPF já foi adicionado ao carrinho');
        return;
      }

      try {
        const data = await checkCoupon({ cpf: values.cpf, birthday: values.birthday });
        handleDiscountChange?.(data.discount, currentFormIndex);

        nextStep();
        updateForm(values);
      } catch (error) {
        console.error('Erro ao verificar o CPF:', error);
        toast.error('Erro ao verificar o CPF. Por favor, tente novamente.');
      }
    },
  });

  const { values, submitForm } = formik;

  const prefill = usePreviousYearPrefill(formik, { updateForm });
  const ageValidation = useAgeValidation(formik, { onAgeConfirmed: prefill.maybeOpenPrefillModal });

  useEffect(() => {
    sessionStorage.removeItem(FORM_STORAGE_KEYS.previousUserData);
    const tempData = getTempData();

    if (Object.keys(tempData).length > 0) {
      const merged = { ...formik.values, ...tempData.personalInformation };
      formik.setValues(merged);
      updateForm(merged);
    }
    setBackStepFlag(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (values.cpf && values.cpf.length === 11 && !cpf.isValid(values.cpf)) {
      toast.error('CPF inválido. Verifique o número e tente novamente.');
    }
  }, [values.cpf]);

  const handleDateBlur = () => ageValidation.handleAgeValidation(values.birthday);

  return (
    <FormikProvider value={formik}>
      <Card className="form__container__general-height">
        <Card.Body>
          <Container>
            <Card.Title>Informações Pessoais</Card.Title>
            <Card.Text>
              Informe seus dados pessoais, pois eles são essenciais para a administração de sua inscrição.
            </Card.Text>
            <Form>
              <IdentificationRow onDateChange={ageValidation.handleDateChange} onDateBlur={handleDateBlur} />
              <NameAndRgRow onPersistName={updateForm} />
              <RgShipperRow />
              <GenderAndGuardianRow
                showLegalGuardianFields={ageValidation.showLegalGuardianFields}
                onPersistGuardianName={updateForm}
              />
            </Form>
          </Container>
        </Card.Body>

        <div className="form__container__buttons">
          <Button
            variant="light"
            onClick={() => {
              backStep();
              updateForm(values);
            }}
            size="lg"
          >
            Voltar
          </Button>

          <Button variant="warning" onClick={submitForm} size="lg">
            Avançar
          </Button>
        </div>
      </Card>

      <AgeConfirmationModal
        showModal={ageValidation.showModal}
        currentAge={ageValidation.currentAge}
        handleCancelAge={ageValidation.handleCancelAge}
        handleConfirmAge={ageValidation.handleConfirmAge}
        restoreScrollWhenMobile={restoreScrollWhenMobile}
      />

      <PrefillModal
        show={prefill.showPrefillModal}
        onClose={prefill.closePrefillModal}
        onConfirm={prefill.handlePrefillConfirm}
        onReject={prefill.handlePrefillReject}
      />
    </FormikProvider>
  );
};

export default PersonalData;
