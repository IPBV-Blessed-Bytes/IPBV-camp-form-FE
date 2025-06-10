import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Row, Button, Form, Col } from 'react-bootstrap';
import { useTable, useFilters, useSortBy } from 'react-table';
import { initialValues } from '@/utils/constants';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import * as XLSX from 'xlsx';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import ColumnFilter from '@/components/Admin/CampersTable/ColumnFilter';
import CoreTable from '@/components/Admin/CampersTable/CoreTable';
import EditAndAddCamperModal from '@/components/Admin/CampersTable/EditAndAddCamperModal';
import ColumnFilterWithSelect from '@/components/Admin/CampersTable/ColumnFilterWithSelect';
import ColumnFilterWithTwoValues from '@/components/Admin/CampersTable/ColumnFilterWithTwoValues';

const AdminCampers = ({ loggedUsername, userRole }) => {
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllRows, setSelectAllRows] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const filteredRowsRef = useRef([]);
  const adminTableEditDeletePermissions = permissions(userRole, 'edit-delete-admin-table');
  const adminTableCreateRegistration = permissions(userRole, 'create-registration-admin-table');
  const adminTableDeleteRegistrationsAndSelectRows = permissions(userRole, 'delete-registrations-admin-table');

  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const currentDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  scrollUp();

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
      name === 'crew' ||
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

  const handleSaveEdit = async () => {
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

  const handleAddSubmit = async () => {
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

  const handleConfirmDeleteAll = async () => {
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

  const handleConfirmDeleteSpecific = async () => {
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
  const columns = useMemo(() => {
    return [
      {
        Header: () => (
          <>
            {adminTableDeleteRegistrationsAndSelectRows ? (
              <div className="d-flex justify-content-between w-100">
                <span className="d-flex">
                  <Form.Check
                    className="table-checkbox"
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredRows.length > 0
                        ? selectedRows.length === filteredRows.length
                        : selectedRows.length === rows.length
                    }
                  />
                  &nbsp;
                  {selectedRows.length === 1
                    ? selectedRows.length + ' selecionado'
                    : selectedRows.length > 1
                    ? selectedRows.length + ' selecionados'
                    : 'Selecionar Todos'}
                </span>
              </div>
            ) : (
              'Editar Acampantes'
            )}
          </>
        ),
        accessor: 'selection',
        Filter: '',
        filter: '',
        sortType: 'alphanumeric',
        Cell: ({ row }) => (
          <>
            {adminTableEditDeletePermissions ? (
              <div className="d-flex gap-5">
                {adminTableDeleteRegistrationsAndSelectRows && (
                  <Form.Check
                    className="table-checkbox"
                    type="checkbox"
                    onChange={() => handleCheckboxChange(row.index, row.original.personalInformation.name)}
                    checked={selectedRows.some((selectedRow) => selectedRow.index === row.index)}
                  />
                )}
                <div>
                  <Button variant="outline-success" onClick={() => handleEditClick(row.index)}>
                    <Icons typeIcon="edit" iconSize={24} />
                  </Button>{' '}
                  {adminTableDeleteRegistrationsAndSelectRows && (
                    <Button variant="outline-danger" onClick={() => handleDeleteClick(row.index, row)}>
                      <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              '-'
            )}
          </>
        ),
      },
      {
        Header: 'Ordem:',
        accessor: (_, i) => i + 1,
        disableFilters: true,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Pacote:',
        accessor: (row) =>
          `${row.package.title} ${
            row.package.accomodationName === 'Colegio XV de Novembro'
              ? '[COLÉGIO]'
              : row.package.accomodationName === 'Seminario Sao Jose'
              ? '[SEMINÁRIO]'
              : ''
          } ${
            row.package.transportation === 'Com Ônibus' || row.package.transportation === 'Com Onibus'
              ? 'COM ÔNIBUS'
              : row.package.transportation === 'Sem Ônibus' || row.package.transportation === 'Sem Onibus'
              ? 'SEM ÔNIBUS'
              : ''
          } ${
            row.package.food === 'Café da manhã, almoço e jantar' ||
            row.package.food === 'Café da manhã| almoço e jantar' ||
            row.package.food === 'Cafe da manha, almoco e jantar' ||
            row.package.food === 'Cafe da manha| almoco e jantar' ||
            row.package.food === 'Cafe da manha  almoco e jantar' ||
            row.package.food === 'Almoço e jantar' ||
            row.package.food === 'Almoco e jantar'
              ? 'COM ALIMENTAÇÃO'
              : row.package.food === ''
              ? ''
              : 'SEM ALIMENTAÇÃO'
          }`,
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Nome:',
        accessor: 'personalInformation.name',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: alphabeticalSort,
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Forma de Pagamento:',
        accessor: 'formPayment.formPayment',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'creditCard', label: 'Cartão de Crédito' },
              { value: 'pix', label: 'PIX' },
              { value: 'boleto', label: 'Boleto Bancário' },
              { value: 'nonPaid', label: 'Não Pagante' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) =>
          value === 'creditCard'
            ? 'Cartão de Crédito'
            : value === 'pix'
            ? 'PIX'
            : value === 'boleto'
            ? 'Boleto Bancário'
            : 'Não pagante',
      },
      {
        Header: 'Igreja:',
        accessor: 'contact.church',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Boa Viagem', label: 'Boa Viagem' },
              { value: 'Outra', label: 'Outra' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Data de Nascimento:',
        accessor: 'personalInformation.birthday',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'CPF:',
        accessor: 'personalInformation.cpf',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'RG:',
        accessor: 'personalInformation.rg',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Órgão Emissor:',
        accessor: (row) =>
          `${row.personalInformation.rgShipper} -
          ${row.personalInformation.rgShipperState}`,
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Tem Vaga de Carona:',
        accessor: (row) => ({
          car: row.contact.car,
          numberVacancies: row.contact.numberVacancies,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithRide',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const carText = value.car ? 'Sim' : !value.car ? 'Não' : '-';
          const numberVacanciesText = value.numberVacancies ? value.numberVacancies : '-';
          return `${carText} ${
            numberVacanciesText !== '-' && numberVacanciesText !== '' && numberVacanciesText !== '0'
              ? `| Vagas: ${numberVacanciesText}`
              : ''
          }`;
        },
      },
      {
        Header: 'Precisa de Carona:',
        accessor: 'contact.needRide',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: true, label: 'Sim' },
              { value: false, label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: 'Observação da Carona:',
        accessor: 'contact.rideObservation',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Data de Inscrição:',
        accessor: 'registrationDate',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Categoria:',
        accessor: (row) => row.personalInformation.gender?.replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Homem', label: 'Adulto Masculino' },
              { value: 'Mulher', label: 'Adulto Feminino' },
              { value: 'Crianca', label: 'Criança (até 10 anos)' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/c/g, 'ç') || '-',
      },
      {
        Header: 'Celular:',
        accessor: (row) => ({
          cellPhone: row.contact.cellPhone,
          isWhatsApp: row.contact.isWhatsApp,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCellphone',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const cellPhoneText = value.cellPhone ? value.cellPhone : '-';
          const isWhatsAppText = value.isWhatsApp ? 'Sim' : !value.isWhatsApp ? 'Não' : '-';
          return `${cellPhoneText} ${cellPhoneText !== '-' ? `| Wpp: ${isWhatsAppText}` : ''}`;
        },
      },
      {
        Header: 'Email:',
        accessor: 'contact.email',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Preço:',
        accessor: 'totalPrice',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Alergia:',
        accessor: 'contact.allergy',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Agregados:',
        accessor: 'contact.aggregate',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Acomodação:',
        accessor: (row) =>
          row.package.accomodationName
            ?.replace(/á|ã|à|â/g, 'a')
            .replace(/é|ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó|ô/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Colegio XV de Novembro', label: 'Colégio XV de Novembro' },
              { value: 'Seminario Sao Jose', label: 'Seminário São José' },
              { value: 'Outra Acomodacao Externa', label: 'Outra Acomodação Externa' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Sub Acomodação:',
        accessor: (row) =>
          row.package.subAccomodation
            ?.replace(/á|ã|à|â/g, 'a')
            .replace(/é|ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó|ô/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Colegio Individual', label: 'Colégio Individual' },
              { value: 'Colegio Familia', label: 'Colégio Família' },
              { value: 'Colegio Camping', label: 'Colégio Camping' },
              { value: 'Seminario', label: 'Seminário' },
              { value: 'Outra', label: 'Outra' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Transporte:',
        accessor: 'package.transportation',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Com Ônibus', label: 'Com Ônibus' },
              { value: 'Sem Ônibus', label: 'Sem Ônibus' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
        filter: (rows, id, filterValue) => {
          return rows.filter((row) => {
            const normalizedValue = row.values[id]?.toLowerCase().replace('onibus', 'ônibus');
            return normalizedValue === filterValue.toLowerCase();
          });
        },
      },
      {
        Header: 'Alimentação:',
        accessor: (row) =>
          row.package.food
            ?.replace(/á|ã|à|â/g, 'a')
            .replace(/é|ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó|ô/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Almoco e jantar', label: 'Com Alimentação' },
              { value: 'Sem Alimentacao', label: 'Sem Alimentação' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Refeição Extra:',
        accessor: (row) => ({
          someFood: row.extraMeals.someFood,
          extraMeals: Array.isArray(row.extraMeals.extraMeals)
            ? row.extraMeals.extraMeals
            : [row.extraMeals.extraMeals],
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithExtraMeals',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const someFoodText = value.someFood ? 'Sim' : !value.someFood ? 'Não' : '-';
          const extraMealsText =
            !value.extraMeals || (Array.isArray(value.extraMeals) && value.extraMeals.every((item) => item === ''))
              ? '-'
              : Array.isArray(value.extraMeals)
              ? value.extraMeals.filter(Boolean).join(', ')
              : '-';

          return `${someFoodText} ${extraMealsText !== '-' ? `| Dias: ${extraMealsText}` : ''}`;
        },
      },
      {
        Header: 'Nome do Resp. Legal:',
        accessor: 'personalInformation.legalGuardianName',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: alphabeticalSort,
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'CPF do Resp. Legal:',
        accessor: 'personalInformation.legalGuardianCpf',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Celular do Resp. Legal:',
        accessor: 'personalInformation.legalGuardianCellPhone',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Desconto:',
        accessor: (row) => ({
          discountCoupon: row.package.discountCoupon,
          discountValue: row.package.discountValue,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCoupon',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const hasDiscount = value.discountCoupon ? 'Sim' : !value.discountCoupon ? 'Não' : '-';
          const discountValueText = value.discountValue !== '0' ? value.discountValue : '-';
          return `${hasDiscount} ${
            discountValueText !== '-' && discountValueText !== '' ? `| Valor: ${discountValueText}` : ''
          }`;
        },
      },
      {
        Header: 'Chave do Pedido:',
        accessor: 'orderId',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const orderUrl = `https://dash.pagar.me/merch_Al154387U9uZDPV2/acc_5d3nayjiPBsdGnA0/orders/${value}`;

          return value ? (
            <a href={orderUrl} className="order-url" target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        Header: 'Check-in:',
        accessor: (row) => ({
          checkin: row.checkin,
          checkinTime: row.checkinTime,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCheckin',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const checkinText = value.checkin ? 'Sim' : 'Não';
          const checkinTimeText = value.checkinTime ? value.checkinTime : '-';

          const checkinTimeTextSplited = checkinTimeText !== '-' ? checkinTimeText.split(' ') : null;
          const checkinTimeTextPt1 = checkinTimeTextSplited ? checkinTimeTextSplited[0] : '-';
          const checkinTimeTextPt2 = checkinTimeTextSplited ? checkinTimeTextSplited[1] : '-';

          return `${checkinText} ${
            checkinText !== 'Não' && checkinTimeText !== '-'
              ? `| Em ${checkinTimeTextPt1} às ${checkinTimeTextPt2}`
              : ''
          }`;
        },
      },
      {
        Header: 'Equipe:',
        accessor: 'crew',
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCrew',
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: 'Inscrição Manual:',
        accessor: 'manualRegistration',
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithManualRegistration',
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: `${adminTableDeleteRegistrationsAndSelectRows ? 'Editar / Deletar' : 'Editar Acampantes'}`,
        Cell: ({ row }) => (
          <>
            {adminTableEditDeletePermissions ? (
              <div>
                <Button variant="outline-success" onClick={() => handleEditClick(row.index)}>
                  <Icons typeIcon="edit" iconSize={24} />
                </Button>{' '}
                {adminTableDeleteRegistrationsAndSelectRows && (
                  <Button variant="outline-danger" onClick={() => handleDeleteClick(row.index, row)}>
                    <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                  </Button>
                )}
              </div>
            ) : (
              '-'
            )}
          </>
        ),
        disableFilters: true,
      },
    ];
  }, [data, selectedRows]);

  const selectWithRide = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const checkinData = row.values[id];
      return filterValue === undefined || checkinData.car === filterValue;
    });
  };

  const selectWithCellphone = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const checkinData = row.values[id];
      return filterValue === undefined || checkinData.isWhatsApp === filterValue;
    });
  };

  const selectWithExtraMeals = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const checkinData = row.values[id];
      return filterValue === undefined || checkinData.someFood === filterValue;
    });
  };

  const selectWithCoupon = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const checkinData = row.values[id];
      return filterValue === undefined || checkinData.discountCoupon === filterValue;
    });
  };

  const selectWithCheckin = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const checkinData = row.values[id];
      return filterValue === undefined || checkinData.checkin === filterValue;
    });
  };

  const selectWithManualRegistration = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const checkinData = row.values[id];
      return filterValue === undefined || checkinData === filterValue;
    });
  };

  const selectWithCrew = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const checkinData = row.values[id];
      return filterValue === undefined || checkinData.crew === filterValue;
    });
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: {
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
      },

      initialState: {
        sortBy: JSON.parse(sessionStorage.getItem('sortBy')) || [],
      },
      filterTypes: {
        selectWithRide,
        selectWithCellphone,
        selectWithExtraMeals,
        selectWithCoupon,
        selectWithCheckin,
        selectWithManualRegistration,
        selectWithCrew,
      },
    },
    useFilters,
    useSortBy,
  );

  useEffect(() => {
    filteredRowsRef.current = filteredRows;
  }, [filteredRows]);

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

  const generateExcel = () => {
    const fieldMapping = {
      'package.title': 'Pacote',
      'personalInformation.name': 'Nome',
      'formPayment.formPayment': 'Forma de Pagamento',
      'contact.church': 'Igreja',
      'personalInformation.birthday': 'Data de Nascimento',
      'personalInformation.cpf': 'CPF',
      'personalInformation.rg': 'RG',
      'personalInformation.rgShipper': 'Orgão Emissor',
      'personalInformation.rgShipperState': 'Estado Emissor',
      'contact.car': 'Tem Vaga de Carona',
      'contact.needRide': 'Precisa de Carona',
      'contact.numberVacancies': 'Vagas de Carona',
      'contact.rideObservation': 'Observação da Carona',
      registrationDate: 'Data de Inscrição',
      'personalInformation.gender': 'Categoria',
      'contact.cellPhone': 'Celular',
      'contact.isWhatsApp': 'WhatsApp',
      'contact.email': 'Email',
      totalPrice: 'Valor final',
      'contact.hasAllergy': 'Tem Alergia',
      'contact.allergy': 'Alergia',
      'contact.hasAggregate': 'Tem Agregados',
      'contact.aggregate': 'Agregados',
      'package.accomodationName': 'Acomodação',
      'package.accomodation.id': 'ID da Acomodação',
      'package.subAccomodation': 'Sub Acomodação',
      'package.transportation': 'Transporte',
      'package.food': 'Alimentação',
      'package.price': 'Valor do pacote',
      'extraMeals.someFood': 'Tem Refeição Extra',
      'extraMeals.extraMeals': 'Refeições Extra',
      'extraMeals.totalPrice': 'Valor Refeição Extra',
      'personalInformation.legalGuardianName': 'Nome do Responsável Legal',
      'personalInformation.legalGuardianCpf': 'CPF do Responsável Legal',
      'personalInformation.legalGuardianCellPhone': 'Celular do Responsável Legal',
      observation: 'Observação',
      crew: 'Equipe',
      manualRegistration: 'Inscrição Manual',
      'package.discountCoupon': 'Cupom de Desconto',
      'package.discountValue': 'Valor do Desconto',
      orderId: 'Chave do Pedido',
      checkin: 'Checkin',
      checkinTime: 'Hora do Checkin',
    };

    const orderedFields = [
      'Pacote',
      'Nome',
      'Forma de Pagamento',
      'Igreja',
      'Data de Nascimento',
      'CPF',
      'RG',
      'Orgão Emissor',
      'Estado Emissor',
      'Tem Vaga de Carona',
      'Precisa de Carona',
      'Vagas de Carona',
      'Observação da Carona',
      'Data de Inscrição',
      'Categoria',
      'Celular',
      'WhatsApp',
      'Email',
      'Valor final',
      'Tem Alergia',
      'Alergia',
      'Tem Agregados',
      'Agregados',
      'Acomodação',
      'ID da Acomodação',
      'Sub Acomodação',
      'Transporte',
      'Alimentação',
      'Valor do pacote',
      'Tem Refeição Extra',
      'Refeições Extra',
      'Valor Refeição Extra',
      'Nome do Responsável Legal',
      'CPF do Responsável Legal',
      'Celular do Responsável Legal',
      'Observação',
      'Equipe',
      'Inscrição Manual',
      'Cupom de Desconto',
      'Valor do Desconto',
      'Chave do Pedido',
      'Checkin',
      'Hora do Checkin',
    ];

    const flattenObject = (obj, parent = '', res = {}) => {
      for (let key in obj) {
        let propName = parent ? `${parent}.${key}` : key;

        if (Array.isArray(obj[key])) {
          res[fieldMapping[propName] || propName] = obj[key].join(' | ');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          flattenObject(obj[key], propName, res);
        } else {
          let value = obj[key];
          if (typeof value === 'boolean') {
            value = value ? 'Sim' : 'Não';
          }
          res[fieldMapping[propName] || propName] = value;
        }
      }
      return res;
    };

    const isFilterApplied = filteredRowsRef.current.length > 0;

    const dataToExport = (isFilterApplied ? filteredRowsRef.current.map((row) => row.original) : data).map((row) => {
      const newRow = { ...row };
      delete newRow.id;
      return flattenObject(newRow);
    });

    const orderedData = dataToExport.map((row) => {
      const orderedRow = {};
      orderedFields.forEach((field) => {
        orderedRow[field] = row[field] || '';
      });
      return orderedRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(orderedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscrições');
    XLSX.writeFile(workbook, 'planilha_inscricoes.xlsx');
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const storeSortByInSession = useCallback(() => {
    sessionStorage.setItem('sortBy', JSON.stringify(sortBy));
  }, [sortBy]);

  useEffect(() => {
    window.addEventListener('beforeunload', storeSortByInSession);
    return () => {
      window.removeEventListener('beforeunload', storeSortByInSession);
    };
  }, [storeSortByInSession]);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Inscritos" sessionTypeIcon="person" iconSize={70} fill={'#204691'} />

      <Row className="table-tools">
        <Col xl={9}>
          <div className="table-tools__left-buttons d-flex mb-3 gap-3">
            <Button
              variant="light"
              onClick={handleFilterClick}
              className="filter-btn text-light d-flex align-items-center"
              size="lg"
            >
              <Icons typeIcon="filter" iconSize={30} fill="#fff" />
              <span className="table-tools__button-name">&nbsp; {showFilters ? 'Ocultar Filtros' : 'Filtrar'}</span>
            </Button>
            <Button variant="success" onClick={generateExcel} className="d-flex align-items-center" size="lg">
              <Icons typeIcon="excel" iconSize={30} fill="#fff" />{' '}
              <span className="table-tools__button-name">&nbsp;Baixar Excel</span>
            </Button>
            {selectedRows.length > 0 && (
              <>
                {adminTableDeleteRegistrationsAndSelectRows && (
                  <Button
                    variant="danger"
                    onClick={handleDeleteWithCheckbox}
                    className="d-flex align-items-center"
                    size="lg"
                  >
                    <Icons typeIcon="delete" iconSize={30} fill="#fff" />{' '}
                    <span className="table-tools__button-name">
                      &nbsp;{selectedRows.length === 1 ? 'Deletar' : 'Deletar Selecionados'}
                    </span>
                  </Button>
                )}
              </>
            )}
            {adminTableCreateRegistration && (
              <Button
                onClick={() => {
                  setShowAddModal(true);
                  setFormSubmitted(false);
                }}
                className="d-flex align-items-center d-lg-none"
                size="lg"
              >
                <Icons typeIcon="add-person" iconSize={30} fill="#fff" />{' '}
                <span className="table-tools__button-name">&nbsp;Nova Inscrição</span>
              </Button>
            )}
          </div>
        </Col>
        {adminTableCreateRegistration && (
          <Col xl={3}>
            <div className="table-tools__right-buttons mb-3">
              <Button
                onClick={() => {
                  setShowAddModal(true);
                  setFormSubmitted(false);
                }}
                className="d-flex align-items-center d-none d-lg-flex"
                size="lg"
              >
                <Icons typeIcon="add-person" iconSize={30} fill="#fff" />{' '}
                <span className="table-tools__button-name">&nbsp;Nova Inscrição</span>
              </Button>
            </div>
          </Col>
        )}
      </Row>

      <Row>
        <CoreTable
          getTableProps={getTableProps}
          getTableBodyProps={getTableBodyProps}
          headerGroups={headerGroups}
          rows={rows}
          prepareRow={prepareRow}
          showFilters={showFilters}
          selectedRows={selectedRows}
        />
      </Row>

      <EditAndAddCamperModal
        name={name}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showDeleteModal={showDeleteModal}
        modalType={modalType}
        formSubmitted={formSubmitted}
        editFormData={editFormData}
        currentDate={currentDate}
        handleSaveEdit={handleSaveEdit}
        addFormData={addFormData}
        handleFormChange={handleFormChange}
        handleAddSubmit={handleAddSubmit}
        handleCloseDeleteModal={handleCloseDeleteModal}
        handleConfirmDeleteAll={handleConfirmDeleteAll}
        handleConfirmDeleteSpecific={handleConfirmDeleteSpecific}
      />

      {showScrollButton && <Icons className="scroll-to-top" typeIcon="arrow-top" onClick={scrollToTop} iconSize={30} />}
      <Loading loading={loading} />
    </Container>
  );
};

AdminCampers.propTypes = {
  row: PropTypes.shape({
    index: PropTypes.string,
    original: PropTypes.string,
  }),
  column: PropTypes.shape({
    index: PropTypes.string,
    filteredRows: PropTypes.array,
  }),
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
  value: PropTypes.string,
};

export default AdminCampers;
