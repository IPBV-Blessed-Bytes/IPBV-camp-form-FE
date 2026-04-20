import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import { listCampers, createCamper, updateCamper, deleteCamper, deleteCampers } from '@/services/campers';
import { registerLog } from '@/services/logs';

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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const fetchData = async () => {
    try {
      const response = await listCampers({ size: MAX_SIZE_CAMPERS });
      if (Array.isArray(response.content)) {
        setData(response.content);
      } else {
        console.error('Data received is not an array:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveEdit = async ({ editFormData, editRowIndex }) => {
    setLoading(true);
    const payload = buildEditPayload(editFormData);

    try {
      await updateCamper(editFormData.id, payload);
      toast.success('Inscrição alterada com sucesso');
      setFormSubmitted(true);
      setData((prev) => prev.map((item, index) => (index === editRowIndex ? { ...editFormData } : item)));
      registerLog(`Editou a inscrição de ${payload.personalInformation.name}`, loggedUsername);
      return true;
    } catch (error) {
      setFormSubmitted(true);
      console.error('Error updating data:', error);
      toast.error('Ocorreu um erro ao tentar editar a inscrição. Tente novamente mais tarde');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addCamper = async ({ addFormData, currentDate }) => {
    setLoading(true);
    const payload = buildAddPayload(addFormData, currentDate);

    try {
      await createCamper(payload);
      toast.success('Inscrição criada com sucesso');
      setFormSubmitted(true);
      fetchData();
      registerLog(`Adicionou manualmente inscrição de ${payload.personalInformation.name}`, loggedUsername);
      return true;
    } catch (error) {
      setFormSubmitted(true);
      console.error('Error adding data:', error);
      toast.error('Ocorreu um erro ao tentar criar a inscrição. Tente novamente mais tarde');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSelected = async ({ selectedRows }) => {
    setLoading(true);
    try {
      const idsToDelete = selectedRows.map((row) => data[row.index].id);
      const namesToDelete = selectedRows.map((row) => row.name);
      await deleteCampers(idsToDelete);
      setData((prev) => prev.filter((_, index) => !selectedRows.some((row) => row.index === index)));
      registerLog(`Deletou inscrições de {${namesToDelete.join(', ')}}`, loggedUsername);
      toast.success('Inscrições deletadas com sucesso');
    } catch (error) {
      console.error('Error deleting selected data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOne = async ({ editRowIndex }) => {
    setLoading(true);
    try {
      const itemToDelete = data[editRowIndex];
      await deleteCamper(itemToDelete.id);
      setData((prev) => prev.filter((_, index) => index !== editRowIndex));
      registerLog(`Deletou inscrição de ${itemToDelete.personalInformation.name}`, loggedUsername);
      toast.success('Inscrição deletada com sucesso');
    } catch (error) {
      console.error('Error deleting specific data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    setData,
    loading,
    setLoading,
    formSubmitted,
    setFormSubmitted,
    fetchData,
    saveEdit,
    addCamper,
    deleteSelected,
    deleteOne,
  };
};

export default useCampersData;
