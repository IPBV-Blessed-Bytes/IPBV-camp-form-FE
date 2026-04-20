import { useState } from 'react';
import { toast } from 'react-toastify';
import { cpf } from 'cpf-cnpj-validator';

import { deleteUserPreviousYear, getUserPreviousYear } from '@/services/campers';
import { useFormState } from '@/contexts/FormStateContext';
import { FORM_STORAGE_KEYS } from '@/utils/formStorage';
import { formatDate } from '../utils/fieldHelpers';

const usePreviousYearPrefill = (formik, { updateForm }) => {
  const { preFill, setPreFill } = useFormState();
  const { values, setValues } = formik;

  const [showPrefillModal, setShowPrefillModal] = useState(false);
  const [previousUserData, setPreviousUserData] = useState(null);

  const fetchPreviousData = async () => {
    if (!cpf.isValid(values.cpf) || preFill !== true) return null;

    try {
      const fullUserData = await getUserPreviousYear({
        cpf: values.cpf,
        birthday: formatDate(values.birthday),
      });

      const filtered = {
        personalInformation: fullUserData.personalInformation,
        contact: fullUserData.contact,
      };

      setPreviousUserData(filtered);
      return filtered;
    } catch (error) {
      console.error('Erro ao buscar dados do ano anterior:', error);
      return null;
    }
  };

  const maybeOpenPrefillModal = async () => {
    const fetched = await fetchPreviousData();
    if (fetched) {
      setShowPrefillModal(true);
      setPreFill(true);
    }
  };

  const handlePrefillConfirm = () => {
    if (previousUserData) {
      const { name, rg, rgShipper, rgShipperState, gender } = previousUserData.personalInformation;
      const contactData = previousUserData.contact;

      setValues((prev) => ({
        ...prev,
        name,
        rg,
        rgShipper,
        rgShipperState,
        gender,
      }));

      updateForm({
        ...values,
        name,
        rg,
        rgShipper,
        rgShipperState,
        gender,
        ...contactData,
      });

      sessionStorage.setItem(FORM_STORAGE_KEYS.previousUserData, JSON.stringify(previousUserData));
    }
    setShowPrefillModal(false);
  };

  const handlePrefillReject = async () => {
    if (!previousUserData) {
      toast.error('Não foi possível encontrar o usuário para exclusão.');
      return;
    }

    try {
      await deleteUserPreviousYear(previousUserData.personalInformation.cpf);

      toast.success('Usuário removido da base de dados com sucesso.');
      setPreviousUserData(null);
      sessionStorage.removeItem(FORM_STORAGE_KEYS.previousUserData);
      setShowPrefillModal(false);
    } catch (error) {
      console.error('Erro ao excluir usuário anterior:', error);
      toast.error('Erro ao excluir usuário da base de dados.');
    }
  };

  const closePrefillModal = () => setShowPrefillModal(false);

  return {
    showPrefillModal,
    maybeOpenPrefillModal,
    handlePrefillConfirm,
    handlePrefillReject,
    closePrefillModal,
  };
};

export default usePreviousYearPrefill;
