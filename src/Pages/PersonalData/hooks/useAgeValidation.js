import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { cpf } from 'cpf-cnpj-validator';

import calculateAge from '@/Pages/Packages/utils/calculateAge';
import { isUnderage } from '../utils/fieldHelpers';

const useAgeValidation = (formik, { onAgeConfirmed } = {}) => {
  const { values, setFieldValue } = formik;

  const [showModal, setShowModal] = useState(false);
  const [currentAge, setCurrentAge] = useState(null);
  const [showLegalGuardianFields, setShowLegalGuardianFields] = useState(false);
  const [hasValidatedAge, setHasValidatedAge] = useState(false);

  useEffect(() => {
    if (!values.birthday) {
      setShowLegalGuardianFields(false);
      return;
    }

    const age = calculateAge(values.birthday);
    setCurrentAge(age);
    setShowLegalGuardianFields(isUnderage(age));
  }, [values.birthday]);

  const handleAgeValidation = (birthday) => {
    if (hasValidatedAge || !birthday) return;

    const age = calculateAge(birthday);
    if (age !== null) {
      setCurrentAge(age);
      setShowModal(true);
      setHasValidatedAge(true);
    }
  };

  const handleDateChange = (date) => {
    setFieldValue('birthday', date);
    setHasValidatedAge(false);
    handleAgeValidation(date);
  };

  const handleConfirmAge = async () => {
    setShowModal(false);

    if (isUnderage(currentAge)) {
      toast.warn(
        `Como a idade informada na data do acampamento é de ${currentAge} anos, sendo inferior a 18 anos, é necessário informar os dados de um responsável legal que estará presente no acampamento.`,
      );
      setShowLegalGuardianFields(true);
    } else {
      setShowLegalGuardianFields(false);
    }

    if (cpf.isValid(values.cpf) && onAgeConfirmed) {
      try {
        await onAgeConfirmed();
      } catch (error) {
        console.error('Erro ao executar callback após confirmação de idade', error);
      }
    }
  };

  const handleCancelAge = () => {
    setFieldValue('birthday', '');
    toast.info(
      'Como você não confirmou sua idade na data do acampamento, o campo foi resetado para que possa preenchê-lo corretamente.',
    );
    setShowModal(false);
    setShowLegalGuardianFields(false);
  };

  return {
    showModal,
    currentAge,
    showLegalGuardianFields,
    handleDateChange,
    handleConfirmAge,
    handleCancelAge,
    handleAgeValidation,
  };
};

export default useAgeValidation;
