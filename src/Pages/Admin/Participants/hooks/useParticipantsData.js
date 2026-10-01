import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import { createParticipant, updateParticipant, deleteParticipant, deleteParticipants, bulkImportParticipants } from '@/services/participants';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { useParticipantsList, CAMPERS_QUERY_KEY } from '@/hooks/useParticipantsList';

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

const useParticipantsData = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { campers: data, isLoading, refetch } = useParticipantsList();

  const setCampersCache = (updater) => queryClient.setQueryData(CAMPERS_QUERY_KEY, (prev = []) => updater(prev));

  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => updateParticipant(id, payload) });
  const createMutation = useMutation({ mutationFn: (payload) => createParticipant(payload) });
  const deleteOneMutation = useMutation({ mutationFn: (id) => deleteParticipant(id) });
  const deleteManyMutation = useMutation({ mutationFn: (ids) => deleteParticipants(ids) });
  const importMutation = useMutation({ mutationFn: (payload) => bulkImportParticipants(payload) });

  const loading = isLoading || importMutation.isPending;
  const savingEdit = updateMutation.isPending;
  const savingAdd = createMutation.isPending;
  const deleting = deleteOneMutation.isPending || deleteManyMutation.isPending;

  const saveEdit = async ({ editFormData, editRowIndex }) => {
    const payload = buildEditPayload(editFormData);

    try {
      await updateMutation.mutateAsync({ id: editFormData.id, payload });
      toast.success(t('admin.participants.toastEditSuccess'));
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
        toast.error(apiMessage || t('admin.participants.toastCpfConflict'));
      } else if (status === 404) {
        toast.error(apiMessage || t('admin.participants.toastNotFound'));
      } else {
        toast.error(t('admin.participants.toastEditError'));
      }
      return false;
    }
  };

  const addCamper = async ({ addFormData, currentDate }) => {
    const payload = buildAddPayload(addFormData, currentDate);

    try {
      await createMutation.mutateAsync(payload);
      toast.success(t('admin.participants.toastAddSuccess'));
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
        toast.error(apiMessage || t('admin.participants.toastCpfConflict'));
      } else {
        toast.error(t('admin.participants.toastAddError'));
      }
      return false;
    }
  };

  const importCampers = async ({ rows, updateExisting }) => {
    try {
      const result = await importMutation.mutateAsync({ rows, updateExisting });
      setFormSubmitted(true);
      queryClient.invalidateQueries({ queryKey: CAMPERS_QUERY_KEY });
      registerLog(
        `Importou planilha de inscrições (${result?.created || 0} criadas, ${result?.updated || 0} atualizadas)`,
        loggedUsername,
      );
      return result;
    } catch (error) {
      console.error('Error importing campers:', error);
      toast.error(getApiErrorMessage(error) || t('admin.participants.toastImportError'));
      return null;
    }
  };

  const deleteSelected = async ({ selectedRows }) => {
    try {
      const idsToDelete = selectedRows.map((row) => data[row.index].id);
      const namesToDelete = selectedRows.map((row) => row.name);
      await deleteManyMutation.mutateAsync(idsToDelete);
      setCampersCache((prev) => prev.filter((_, index) => !selectedRows.some((row) => row.index === index)));
      registerLog(`Deletou inscrições de {${namesToDelete.join(', ')}}`, loggedUsername);
      toast.success(t('admin.participants.toastDeleteManySuccess'));
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
      toast.success(t('admin.participants.toastDeleteOneSuccess'));
    } catch (error) {
      console.error('Error deleting specific data:', error);
    }
  };

  return {
    data,
    loading,
    savingEdit,
    savingAdd,
    deleting,
    formSubmitted,
    setFormSubmitted,
    fetchData: refetch,
    saveEdit,
    addCamper,
    importCampers,
    deleteSelected,
    deleteOne,
  };
};

export default useParticipantsData;
