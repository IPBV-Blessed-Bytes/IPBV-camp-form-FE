import { useState, useEffect, useRef } from 'react';
import { initialValues } from '@/utils/constants';
import { toast } from 'react-toastify';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';

export const useCampersTable = ({ filteredRows, rows }) => {
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllRows, setSelectAllRows] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const filteredRowsRef = useRef([]);

  console.log('filteredRows DENTRO:',filteredRows)

  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const currentDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  useEffect(() => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetcher.get('camper', {
        params: {
          size: 100000,
        },
      });
      if (Array.isArray(response.data.content)) {
        setData(response.data.content);
      } else {
        console.error('Data received is not an array:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (index) => {
    setEditRowIndex(index);
    setEditFormData(data[index]);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (index, row) => {
    handleDeleteSpecific();
    setEditRowIndex(index);
    setShowDeleteModal(true);
    setName(row.original.personalInformation.name);
  };

  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    const adjustedValue = value === '' ? '' : value;

    const booleanValue =
      name === 'extraMeals.someFood' ||
      name === 'contact.car' ||
      name === 'contact.needRide' ||
      name === 'contact.isWhatsApp'
        ? adjustedValue === 'true'
        : adjustedValue;

    const updateState = (setter) => {
      setter((prevData) => {
        if (keys.length === 2) {
          const [parentKey, childKey] = keys;
          const newState = {
            ...prevData,
            [parentKey]: {
              ...prevData[parentKey],
              [childKey]: booleanValue,
            },
          };
          return newState;
        } else {
          const newState = {
            ...prevData,
            [name]: booleanValue,
          };
          return newState;
        }
      });
    };

    if (formType === 'edit') {
      updateState(setEditFormData);
    } else if (formType === 'add') {
      updateState(setAddFormData);
    }
  };

  const sanitizeFields = (data, template) => {
    const result = {};
    for (const key in template) {
      if (template[key] && typeof template[key] === 'object' && !Array.isArray(template[key])) {
        result[key] = sanitizeFields(data[key] || {}, template[key]);
      } else if (Array.isArray(data[key])) {
        result[key] = data[key].join(', ');
      } else {
        result[key] = data[key] !== undefined && data[key] !== null ? data[key] : '';
      }
    }
    return result;
  };

  const handleSaveEdit = async (loggedUsername) => {
    setLoading(true);

    const sanitizedFormData = sanitizeFields(editFormData, initialValues);

    const updatedFormValues = {
      id: editFormData.id,
      observation: editFormData.observation,
      ...sanitizedFormData,
    };

    try {
      const response = await fetcher.put(`camper/${editFormData.id}`, updatedFormValues);
      if (response.status === 200) {
        toast.success('Inscrição alterada com sucesso');
        setFormSubmitted(true);
        const newData = data.map((item, index) => (index === editRowIndex ? editFormData : item));
        setData(newData);
        setShowEditModal(false);
        registerLog(`Editou a inscrição de ${updatedFormValues.personalInformation.name}`, loggedUsername);
      } else {
        toast.error('Erro ao editar a inscrição. Verifique os dados e tente novamente');
      }
    } catch (error) {
      setFormSubmitted(true);
      console.error('Error updating data:', error);
      toast.error('Ocorreu um erro ao tentar editar a inscrição. Tente novamente mais tarde');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (loggedUsername) => {
    setLoading(true);

    const sanitizedFormData = sanitizeFields(addFormData, initialValues);

    const updatedFormValues = {
      manualRegistration: true,
      observation: addFormData.observation ? addFormData.observation : '',
      ...sanitizedFormData,
      registrationDate: currentDate,
    };

    try {
      const response = await fetcher.post('camper', updatedFormValues);

      if (response.status === 200) {
        toast.success('Inscrição criada com sucesso');
        setFormSubmitted(true);
        fetchData();
        setShowAddModal(false);
        setAddFormData({});
        registerLog(`Adicionou manualmente inscrição de ${updatedFormValues.personalInformation.name}`, loggedUsername);
      } else {
        toast.error('Erro ao criar a inscrição. Verifique os dados e tente novamente');
      }
    } catch (error) {
      setFormSubmitted(true);
      console.error('Error adding data:', error);
      toast.error('Ocorreu um erro ao tentar criar a inscrição. Tente novamente mais tarde');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (index, name) => {
    setSelectedRows((prevSelectedRows) => {
      const isAlreadySelected = prevSelectedRows.some((row) => row.index === index);
      if (isAlreadySelected) {
        return prevSelectedRows.filter((row) => row.index !== index);
      } else {
        return [...prevSelectedRows, { index, name }];
      }
    });
  };

  const handleDeleteWithCheckbox = () => {
    setShowDeleteModal(true);
    setModalType('delete-all');
  };

  const handleDeleteSpecific = () => {
    setShowDeleteModal(true);
    setModalType('delete-specific');
  };

  const handleConfirmDeleteAll = async (loggedUsername) => {
    setLoading(true);

    try {
      const idsToDelete = selectedRows.map((row) => data[row.index].id);
      const namesToDelete = selectedRows.map((row) => row.name);
      await Promise.all(idsToDelete.map((id) => fetcher.delete(`camper/${id}`)));
      const newData = data.filter((_, index) => !selectedRows.some((row) => row.index === index));
      setData(newData);
      setSelectedRows([]);
      setShowDeleteModal(false);

      const deletedNames = namesToDelete.join(', ');
      registerLog(`Deletou inscrições de {${deletedNames}}`, loggedUsername);

      toast.success('Inscrições deletadas com sucesso');
    } catch (error) {
      console.error('Error deleting selected data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteSpecific = async (loggedUsername) => {
    setLoading(true);

    try {
      const itemToDelete = data[editRowIndex];
      await fetcher.delete(`camper/${itemToDelete.id}`);
      const newData = data.filter((_, index) => index !== editRowIndex);
      setData(newData);
      setEditRowIndex(null);
      setShowDeleteModal(false);
      registerLog(`Deletou inscrição de ${itemToDelete.personalInformation.name}`, loggedUsername);
      toast.success('Inscrição deletada com sucesso');
    } catch (error) {
      console.error('Error deleting specific data:', error);
    } finally {
      setLoading(false);
    }
  };

  const alphabeticalSort = (rowA, rowB, columnId) => {
    const a = rowA.values[columnId].toLowerCase();
    const b = rowB.values[columnId].toLowerCase();
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };

  const handleSelectAll = () => {
    const isFilterApplied = filteredRowsRef.current.length > 0;

    if (selectAllRows) {
      setSelectedRows([]);
    } else {
      const rowsToSelect = isFilterApplied ? filteredRowsRef.current : rows;

      const selectedRows = rowsToSelect.map((row) => ({
        index: row.index,
        name: row.original.personalInformation.name,
      }));
      setSelectedRows(selectedRows);
    }
    setSelectAllRows(!selectAllRows);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    filteredRowsRef.current = filteredRows;
  }, [filteredRows]);

  return {
    data,
    name,
    showEditModal,
    setShowEditModal,
    editRowIndex,
    editFormData,
    showAddModal,
    setShowAddModal,
    addFormData,
    selectedRows,
    selectAllRows,
    showDeleteModal,
    modalType,
    showFilters,
    showScrollButton,
    formSubmitted,
    setFormSubmitted,
    loading,
    filteredRowsRef,
    currentDate,
    handleFormChange,
    handleSaveEdit,
    handleAddSubmit,
    handleCheckboxChange,
    handleDeleteWithCheckbox,
    handleConfirmDeleteAll,
    handleConfirmDeleteSpecific,
    handleCloseDeleteModal,
    handleFilterClick,
    handleSelectAll,
    handleEditClick,
    handleDeleteClick,
    alphabeticalSort
  };
};
