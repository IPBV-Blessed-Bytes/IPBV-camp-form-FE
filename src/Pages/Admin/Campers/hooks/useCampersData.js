import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { createCamper, updateCamper, deleteCamper, deleteCampers } from '@/services/campers';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { useCampersList, CAMPERS_QUERY_KEY } from '@/hooks/useCampersList';

import { sanitizeFields } from '../utils/sanitizeFields';

const buildEditPayload = (formData) => {
  const sanitized = sanitizeFields(formData);
  return {
    ...sanitized,
    id: formData.id,
    observation: formData.observation || '',
    pastoralFamily: !!formData.pastoralFamily,
    crew: formData.crew || '',
    package: {
      ...sanitized.package,
      accomodationName: formData.package?.accomodationName || '',
      transportationName: formData.package?.transportationName || '',
      foodName: formData.package?.foodName || '',
      discountCoupon: sanitized.package?.discountCoupon ?? false,
      discountValue: sanitized.package?.discountValue ?? '',
    },
  };
};

const buildAddPayload = (formData, currentDate) => {
  const sanitized = sanitizeFields(formData);
  return {
    manualRegistration: true,
    observation: formData.observation || '',
    pastoralFamily: !!formData.pastoralFamily,
    crew: formData.crew || '',
    ...sanitized,
    package: {
      ...sanitized.package,
      accomodationName: formData.package?.accomodationName || '',
      transportationName: formData.package?.transportationName || '',
      foodName: formData.package?.foodName || '',
      discountCoupon: false,
      discountValue: '',
    },
    registrationDate: currentDate,
  };
};

const useCampersData = ({ loggedUsername }) => {
  const queryClient = useQueryClient();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { campers: data, isLoading, refetch } = useCampersList();

  const setCampersCache = (updater) => queryClient.setQueryData(CAMPERS_QUERY_KEY, (prev = []) => updater(prev));

  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => updateCamper(id, payload) });
  const createMutation = useMutation({ mutationFn: (payload) => createCamper(payload) });
  const deleteOneMutation = useMutation({ mutationFn: (id) => deleteCamper(id) });
  const deleteManyMutation = useMutation({ mutationFn: (ids) => deleteCampers(ids) });

  const loading =
    isLoading ||
    updateMutation.isPending ||
    createMutation.isPending ||
    deleteOneMutation.isPending ||
    deleteManyMutation.isPending;

  const saveEdit = async ({ editFormData, editRowIndex }) => {
    const payload = buildEditPayload(editFormData);

    try {
      await updateMutation.mutateAsync({ id: editFormData.id, payload });
      toast.success('Inscrição alterada com sucesso');
      setFormSubmitted(true);
      setCampersCache((prev) => prev.map((item, index) => (index === editRowIndex ? { ...editFormData } : item)));
      registerLog(`Editou a inscrição de ${payload.personalInformation.name}`, loggedUsername);
      return true;
    } catch (error) {
      setFormSubmitted(true);
      console.error('Error updating data:', error);
      const status = error?.response?.status;
      const apiMessage = getApiErrorMessage(error);
      if (status === 409) {
        toast.error(apiMessage || 'CPF já cadastrado para outro acampante');
      } else if (status === 404) {
        toast.error(apiMessage || 'Acampante não encontrado');
      } else {
        toast.error('Ocorreu um erro ao tentar editar a inscrição. Tente novamente mais tarde');
      }
      return false;
    }
  };

  const addCamper = async ({ addFormData, currentDate }) => {
    const payload = buildAddPayload(addFormData, currentDate);

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Inscrição criada com sucesso');
      setFormSubmitted(true);
      queryClient.invalidateQueries({ queryKey: CAMPERS_QUERY_KEY });
      registerLog(`Adicionou manualmente inscrição de ${payload.personalInformation.name}`, loggedUsername);
      return true;
    } catch (error) {
      setFormSubmitted(true);
      console.error('Error adding data:', error);
      const status = error?.response?.status;
      const apiMessage = getApiErrorMessage(error);
      if (status === 409) {
        toast.error(apiMessage || 'CPF já cadastrado para outro acampante');
      } else {
        toast.error('Ocorreu um erro ao tentar criar a inscrição. Tente novamente mais tarde');
      }
      return false;
    }
  };

  const deleteSelected = async ({ selectedRows }) => {
    try {
      const idsToDelete = selectedRows.map((row) => data[row.index].id);
      const namesToDelete = selectedRows.map((row) => row.name);
      await deleteManyMutation.mutateAsync(idsToDelete);
      setCampersCache((prev) => prev.filter((_, index) => !selectedRows.some((row) => row.index === index)));
      registerLog(`Deletou inscrições de {${namesToDelete.join(', ')}}`, loggedUsername);
      toast.success('Inscrições deletadas com sucesso');
    } catch (error) {
      console.error('Error deleting selected data:', error);
    }
  };

  const deleteOne = async ({ editRowIndex }) => {
    try {
      const itemToDelete = data[editRowIndex];
      await deleteOneMutation.mutateAsync(itemToDelete.id);
      setCampersCache((prev) => prev.filter((_, index) => index !== editRowIndex));
      registerLog(`Deletou inscrição de ${itemToDelete.personalInformation.name}`, loggedUsername);
      toast.success('Inscrição deletada com sucesso');
    } catch (error) {
      console.error('Error deleting specific data:', error);
    }
  };

  return {
    data,
    loading,
    formSubmitted,
    setFormSubmitted,
    fetchData: refetch,
    saveEdit,
    addCamper,
    deleteSelected,
    deleteOne,
  };
};

export default useCampersData;
