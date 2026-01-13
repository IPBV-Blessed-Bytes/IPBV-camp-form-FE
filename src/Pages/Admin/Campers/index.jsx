import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Row, Button, Form } from 'react-bootstrap';
import { useTable, useFilters, useSortBy } from 'react-table';
import { initialValues } from '@/utils/constants';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import * as XLSX from 'xlsx';
import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import Tools from '@/components/Admin/Header/Tools';
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

  useEffect(() => {
    fetchData();
  }, []);

  scrollUp();

  const fetchData = async () => {
    try {
      const response = await fetcher.get('camper', {
        params: {
          size: MAX_SIZE_CAMPERS,
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

    const normalizeText = (str) =>
      str
        ?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '')
        .trim();

    const accomodationMap = {
      'host-college-collective': 'Colégio Quarto Coletivo',
      'host-college-family': 'Colégio Quarto Família',
      'host-college-camping': 'Colégio Camping',
      'host-seminario': 'Seminário',
      'host-external': 'Externo',
    };

    const transportationMap = {
      'bus-yes': 'Com Ônibus',
      'bus-no': 'Sem Ônibus',
    };

    const foodMap = {
      'food-complete': 'Alimentação Completa (Café da manhã, Almoço e Jantar)',
      'no-food': 'Sem Alimentação',
    };

    const reverseAccomodationMap = Object.fromEntries(
      Object.entries(accomodationMap).map(([k, v]) => [normalizeText(v), k]),
    );
    const reverseTransportationMap = Object.fromEntries(
      Object.entries(transportationMap).map(([k, v]) => [normalizeText(v), k]),
    );
    const reverseFoodMap = Object.fromEntries(Object.entries(foodMap).map(([k, v]) => [normalizeText(v), k]));

    const booleanValue = ['crew', 'pastoralFamily', 'contact.car', 'contact.needRide', 'contact.isWhatsApp'].includes(
      name,
    )
      ? adjustedValue === 'true'
      : adjustedValue;

    const updateState = (setter) => {
      setter((prevData) => {
        let newState = { ...prevData };

        if (keys.length === 3) {
          const [grandParentKey, parentKey, childKey] = keys;
          newState = {
            ...prevData,
            [grandParentKey]: {
              ...prevData[grandParentKey],
              [parentKey]: {
                ...prevData[grandParentKey]?.[parentKey],
                [childKey]: booleanValue,
              },
            },
          };
          const mirrorField = `${parentKey}Name`;
          if (Object.prototype.hasOwnProperty.call(prevData[grandParentKey] || {}, mirrorField)) {
            newState[grandParentKey][mirrorField] = booleanValue;
          }
        } else if (keys.length === 2) {
          const [parentKey, childKey] = keys;
          newState[parentKey] = {
            ...prevData[parentKey],
            [childKey]: booleanValue,
          };
        } else {
          newState[name] = booleanValue;
        }

        const updatePackage = (field, map, reverseMap) => {
          const normalized = normalizeText(value);
          const isReadable = Object.values(map).some((v) => normalizeText(v) === normalized);

          const readable = isReadable ? value : map[value] || value;
          const idValue = isReadable ? reverseMap[normalized] : value;

          newState.package = {
            ...newState.package,
            [field]: {
              ...newState.package[field],
              id: idValue,
            },
            [`${field}Name`]: readable,
          };
        };

        if (name.startsWith('package.accomodation'))
          updatePackage('accomodation', accomodationMap, reverseAccomodationMap);

        if (name.startsWith('package.transportation'))
          updatePackage('transportation', transportationMap, reverseTransportationMap);

        if (name.startsWith('package.food')) updatePackage('food', foodMap, reverseFoodMap);

        return newState;
      });
    };

    const setter = formType === 'edit' ? setEditFormData : setAddFormData;
    updateState(setter);
  };

  const sanitizeFields = (data) => {
    return {
      id: data.id || 0,
      totalPrice: data.totalPrice || '',
      personalInformation: {
        name: data.personalInformation?.name || '',
        birthday: data.personalInformation?.birthday || '',
        cpf: data.personalInformation?.cpf || '',
        rg: data.personalInformation?.rg || '',
        rgShipper: data.personalInformation?.rgShipper || '',
        rgShipperState: data.personalInformation?.rgShipperState || '',
        gender: data.personalInformation?.gender || '',
        legalGuardianCellPhone: data.personalInformation?.legalGuardianCellPhone || '',
        legalGuardianCpf: data.personalInformation?.legalGuardianCpf || '',
        legalGuardianName: data.personalInformation?.legalGuardianName || '',
      },
      contact: {
        cellPhone: data.contact?.cellPhone || '',
        email: data.contact?.email || '',
        isWhatsApp: data.contact?.isWhatsApp === true || data.contact?.isWhatsApp === 'true',
        church: data.contact?.church || '',
        car: data.contact?.car === true || data.contact?.car === 'true',
        numberVacancies: data.contact?.numberVacancies || '',
        needRide: data.contact?.needRide === true || data.contact?.needRide === 'true',
        rideObservation: data.contact?.rideObservation || '',
        allergy: data.contact?.allergy || '',
        aggregate: data.contact?.aggregate || '',
      },
      extraMeals: {
        someFood: data.extraMeals?.someFood === true || data.extraMeals?.someFood === 'true',
        extraMeals: Array.isArray(data.extraMeals?.extraMeals)
          ? data.extraMeals.extraMeals.join(', ')
          : data.extraMeals?.extraMeals || '',
      },
      formPayment: {
        formPayment: typeof data.formPayment === 'object' ? data.formPayment.formPayment || '' : data.formPayment || '',
      },
      observation: data.observation || '',
      package: {
        accomodation: {
          id: data.package?.accomodation?.id || '',
          name: data.package?.accomodation?.name || '',
          price: data.package?.accomodation?.price || '',
        },
        transportation: {
          id: data.package?.transportation?.id || '',
          name: data.package?.transportation?.name || '',
          price: data.package?.transportation?.price || '',
        },
        food: {
          id: data.package?.food?.id || '',
          name: data.package?.food?.name || '',
          price: data.package?.food?.price || '',
        },
        price: data.package?.price || '',
        finalPrice: data.package?.finalPrice || '',
      },
    };
  };

  const handleSaveEdit = async () => {
    setLoading(true);

    const sanitizedFormData = sanitizeFields(editFormData);

    const updatedFormValues = {
      ...sanitizedFormData,
      id: editFormData.id,
      observation: editFormData.observation || '',
      pastoralFamily: !!editFormData.pastoralFamily,
      crew: !!editFormData.crew,
      package: {
        ...sanitizedFormData.package,
        accomodationName: editFormData.package?.accomodationName || '',
        transportationName: editFormData.package?.transportationName || '',
        foodName: editFormData.package?.foodName || '',
        discountCoupon: sanitizedFormData.package?.discountCoupon ?? false,
        discountValue: sanitizedFormData.package?.discountValue ?? '',
      },
    };

    try {
      const response = await fetcher.put(`camper/${editFormData.id}`, updatedFormValues);
      if (response.status === 200) {
        toast.success('Inscrição alterada com sucesso');
        setFormSubmitted(true);
        const newData = data.map((item, index) => (index === editRowIndex ? { ...editFormData } : item));
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
      observation: addFormData.observation || '',
      pastoralFamily: !!addFormData.pastoralFamily,
      crew: !!addFormData.crew,
      ...sanitizedFormData,
      package: {
        ...sanitizedFormData.package,
        accomodationName: addFormData.package?.accomodationName || '',
        transportationName: addFormData.package?.transportationName || '',
        foodName: addFormData.package?.foodName || '',
        discountCoupon: false,
        discountValue: '',
      },
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
          `${
            row.package.accomodationName === 'Colégio Quarto Coletivo' ||
            row.package.accomodationName === 'Colegio Quarto Coletivo' ||
            row.package.accomodationName === 'Colégio Quarto Família' ||
            row.package.accomodationName === 'Colegio Quarto Familia' ||
            row.package.accomodationName === 'Colégio Camping' ||
            row.package.accomodationName === 'Colegio Camping'
              ? '[COLÉGIO]'
              : row.package.accomodationName === 'Seminário' || row.package.accomodationName === 'Seminario'
              ? '[SEMINÁRIO]'
              : row.package.accomodationName === 'Externo'
              ? '[EXTERNO]'
              : ''
          } ${
            row.package.transportationName === 'Com Ônibus' || row.package.transportationName === 'Com Onibus'
              ? 'COM ÔNIBUS'
              : row.package.transportationName === 'Sem Ônibus' || row.package.transportationName === 'Sem Onibus'
              ? 'SEM ÔNIBUS'
              : ''
          } ${
            row.package.foodName === 'Alimentação Completa (Café da manhã, Almoço e Jantar)' ||
            row.package.foodName === 'Alimentacao Completa (Cafe da manha, Almoco e Jantar)' ||
            row.package.foodName === 'Alimentação Completa (Café da manhã| Almoço e Jantar)' ||
            row.package.foodName === 'Alimentacao Completa (Cafe da manha| Almoco e Jantar)' ||
            row.package.foodName === 'Alimentacao Completa (Cafe da manha  Almoco e Jantar)' ||
            row.package.foodName === 'Alimentação Completa' ||
            row.package.foodName === 'Alimentacao Completa'
              ? 'COM ALIMENTAÇÃO COMPLETA'
              : row.package.foodName === 'Alimentação Parcial (Almoço e Jantar)' ||
                row.package.foodName === 'Alimentacao Parcial (Almoco e Jantar)'
              ? 'COM ALIMENTAÇÃO PARCIAL'
              : row.package.foodName === '' ||
                row.package.foodName === 'Sem Alimentação' ||
                row.package.foodName === 'Sem Alimentacao'
              ? 'SEM ALIMENTAÇÃO'
              : ''
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
        accessor: (row) => {
          if (row.totalPrice === '0') {
            return 'nonPaid';
          }

          return row.formPayment?.formPayment || 'nonPaid';
        },
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
        Cell: ({ value }) => {
          switch (value) {
            case 'creditCard':
              return 'Cartão de Crédito';
            case 'pix':
              return 'PIX';
            case 'ticket':
              return 'Boleto Bancário';
            case 'boleto':
              return 'Boleto Bancário';
            default:
              return 'Não Pagante';
          }
        },
      },
      {
        Header: 'Hospedagem:',
        accessor: (row) =>
          row.package.accomodationName === 'Colégio Quarto Coletivo' ||
          row.package.accomodationName === 'Colegio Quarto Coletivo'
            ? 'Colégio Quarto Coletivo'
            : row.package.accomodationName === 'Colégio Quarto Família' ||
              row.package.accomodationName === 'Colegio Quarto Familia'
            ? 'Colégio Quarto Família'
            : row.package.accomodationName === 'Colégio Camping' || row.package.accomodationName === 'Colegio Camping'
            ? 'Colégio Camping'
            : row.package.accomodationName === 'Seminário' || row.package.accomodationName === 'Seminario'
            ? 'Seminário'
            : row.package.accomodationName === 'Externo'
            ? 'Externo'
            : '',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Colégio Quarto Coletivo', label: 'Colégio Quarto Coletivo' },
              { value: 'Colégio Quarto Família', label: 'Colégio Quarto Família' },
              { value: 'Colégio Camping', label: 'Colégio Camping' },
              { value: 'Seminário', label: 'Seminário São José' },
              { value: 'Externo', label: 'Outra Hospedagem Externa' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Transporte:',
        accessor: (row) =>
          row.package.transportationName === 'Com Ônibus' || row.package.transportationName === 'Com Onibus'
            ? 'Com Ônibus'
            : row.package.transportationName === 'Sem Ônibus' || row.package.transportationName === 'Sem Onibus'
            ? 'Sem Ônibus'
            : '',
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
        accessor: 'package.foodName',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              {
                value: 'Alimentacao Completa',
                label: 'Alimentação Completa',
              },
              {
                value: 'Sem Alimentacao',
                label: 'Sem Alimentação',
              },
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
        Header: 'Desconto:',
        accessor: (row) => ({
          appliedDiscount: row.appliedDiscount,
          discountCoupon: row.package.discountCoupon,
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
        filter: 'selectWithDiscount',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const hasDiscount = value.discountCoupon ? 'Sim' : !value.discountCoupon ? 'Não' : '-';
          const discountValueText =
            value.appliedDiscount !== '0' && value.appliedDiscount !== null ? value.appliedDiscount : '-';
          return `${hasDiscount} ${
            discountValueText !== '-' && discountValueText !== '' ? `| Valor: ${discountValueText}` : ''
          }`;
        },
      },
      {
        Header: 'Motivo do Desconto:',
        accessor: 'discountReason',
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
        Header: 'Categoria:',
        accessor: (row) =>
          row.personalInformation.gender
            ?.replace(/ç/g, 'c')
            .replace(/^Homem$/i, 'Homem')
            .replace(/^Mulher$/i, 'Mulher')
            .replace(/^Crianca$/i, 'Crianca') || '-',
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
        Cell: ({ value }) =>
          value === 'Boa Viagem'
            ? 'Boa Viagem'
            : value === 'IPBV'
            ? 'Boa Viagem'
            : value === 'Outra'
            ? 'Outra'
            : 'Não pagante',
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
        Header: 'Lote:',
        accessor: 'package.lot',
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
        Cell: ({ value }) => value || '-',
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
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Observação Acampante:',
        accessor: 'finalObservation',
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
        Header: 'Cor do Time:',
        accessor: 'teamColor',
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
        Header: 'Família Pastoral:',
        accessor: 'pastoralFamily',
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
        filter: 'selectWithPastoralFamily',
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
        Header: 'Permissão Uso Dados:',
        accessor: 'authorization',
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
        filter: 'selectWithConfirmationUserData',
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: 'Observação Adm:',
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
      const filterData = row.values[id];
      return filterValue === undefined || filterData.car === filterValue;
    });
  };

  const selectWithCellphone = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const filterData = row.values[id];
      return filterValue === undefined || filterData.isWhatsApp === filterValue;
    });
  };

  const selectWithDiscount = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const filterData = row.values[id];
      return filterValue === undefined || filterData.discountCoupon === filterValue;
    });
  };

  const selectWithCheckin = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const filterData = row.values[id];
      return filterValue === undefined || filterData.checkin === filterValue;
    });
  };

  const selectWithManualRegistration = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const filterData = row.values[id];
      return filterValue === undefined || filterData === filterValue;
    });
  };

  const selectWithCrew = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const filterData = row.values[id];
      return filterValue === undefined || filterData === filterValue;
    });
  };

  const selectWithPastoralFamily = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const filterData = row.values[id];
      return filterValue === undefined || filterData === filterValue;
    });
  };

  const selectWithConfirmationUserData = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const filterData = row.values[id];
      return filterValue === undefined || filterData === filterValue;
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
        selectWithDiscount,
        selectWithCheckin,
        selectWithManualRegistration,
        selectWithCrew,
        selectWithPastoralFamily,
        selectWithConfirmationUserData,
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
      'personalInformation.name': 'Nome',
      'formPayment.formPayment': 'Forma de Pagamento',
      'package.accomodationName': 'Hospedagem',
      'package.transportationName': 'Transporte',
      'package.foodName': 'Alimentação',
      'personalInformation.cpf': 'CPF',
      'personalInformation.rg': 'RG',
      'personalInformation.rgShipper': 'Orgão Emissor',
      'personalInformation.rgShipperState': 'Estado Emissor',
      'package.price': 'Valor do pacote',
      appliedDiscount: 'Valor do Desconto',
      discountReason: 'Motivo do Desconto',
      totalPrice: 'Valor final',
      'personalInformation.birthday': 'Data de Nascimento',
      'personalInformation.gender': 'Categoria',
      'contact.church': 'Igreja',
      'contact.cellPhone': 'Celular',
      'contact.isWhatsApp': 'WhatsApp',
      'contact.email': 'Email',
      'contact.car': 'Tem Vaga de Carona',
      'contact.needRide': 'Precisa de Carona',
      'contact.numberVacancies': 'Vagas de Carona',
      'contact.rideObservation': 'Observação da Carona',
      registrationDate: 'Data de Inscrição',
      'package.lot': 'Lote',
      'contact.hasAllergy': 'Tem Alergia',
      'contact.allergy': 'Alergia',
      'contact.hasAggregate': 'Tem Agregados',
      'contact.aggregate': 'Agregados',
      'personalInformation.legalGuardianName': 'Nome do Responsável Legal',
      'personalInformation.legalGuardianCpf': 'CPF do Responsável Legal',
      'personalInformation.legalGuardianCellPhone': 'Celular do Responsável Legal',
      finalObservation: 'Observação Acampante',
      checkin: 'Checkin',
      checkinTime: 'Hora do Checkin',
      crew: 'Equipe',
      pastoralFamily: 'Família Pastoral',
      manualRegistration: 'Inscrição Manual',
      observation: 'Observação Adm',
      orderId: 'Chave do Pedido',
    };

    const orderedFields = [
      'Nome',
      'Forma de Pagamento',
      'Hospedagem',
      'Transporte',
      'Alimentação',
      'CPF',
      'RG',
      'Orgão Emissor',
      'Estado Emissor',
      'Valor do pacote',
      'Valor do Desconto',
      'Motivo do Desconto',
      'Valor final',
      'Data de Nascimento',
      'Categoria',
      'Igreja',
      'Celular',
      'WhatsApp',
      'Email',
      'Tem Vaga de Carona',
      'Precisa de Carona',
      'Vagas de Carona',
      'Observação da Carona',
      'Data de Inscrição',
      'Lote',
      'Tem Alergia',
      'Alergia',
      'Tem Agregados',
      'Agregados',
      'Nome do Responsável Legal',
      'CPF do Responsável Legal',
      'Celular do Responsável Legal',
      'Observação Acampante',
      'Checkin',
      'Hora do Checkin',
      'Equipe',
      'Família Pastoral',
      'Inscrição Manual',
      'Observação Adm',
      'Chave do Pedido',
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

    const numericFields = ['Valor do pacote', 'Valor do Desconto', 'Valor final'];

    const orderedData = dataToExport.map((row) => {
      const orderedRow = {};
      orderedFields.forEach((field) => {
        let value = row[field] || '';

        if (numericFields.includes(field)) {
          const num = Number(String(value).replace('R$', '').replace('.', '').replace(',', '.').trim());

          value = isNaN(num) ? '' : num;
        }

        orderedRow[field] = value;
      });

      return orderedRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(orderedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscrições');
    XLSX.writeFile(workbook, 'inscricoes.xlsx');
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

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 mb-3 mb-lg-0 d-flex flex-column align-items-center',
      cols: { xs: 6, lg: 3 },
      fill: '#007185',
      iconSize: 40,
      id: 'filters',
      name: `${showFilters ? 'Ocultar Filtros' : 'Filtrar'}`,
      onClick: handleFilterClick,
      typeButton: 'outline-teal-blue',
      typeIcon: 'filter',
    },
    {
      buttonClassName: 'w-100 h-100 py-3 mb-3 mb-lg-0 btn-bw-3 d-flex flex-column align-items-center',
      cols: { xs: 6, lg: 3 },
      fill: '#007185',
      iconSize: 40,
      id: 'campers-excel',
      name: 'Baixar Relatório',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center',
      cols: { xs: 6, lg: 3 },
      fill: '#dc3545',
      iconSize: 40,
      id: 'room-excel',
      name: 'Deletar',
      onClick: handleDeleteWithCheckbox,
      typeButton: 'outline-danger',
      typeIcon: 'delete',
      condition: selectedRows.length > 0 && adminTableDeleteRegistrationsAndSelectRows,
    },
    {
      buttonClassName: 'w-100 h-100 py-3 btn-bw-3 d-flex flex-column align-items-center',
      cols: { xs: 6, lg: 3 },
      fill: '#fff',
      iconSize: 40,
      id: 'add-camper',
      name: 'Nova Inscrição',
      onClick: () => {
        setShowAddModal(true);
        setFormSubmitted(false);
      },
      typeButton: 'teal-blue',
      typeIcon: 'add-person',
      condition: adminTableCreateRegistration,
    },
  ];

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Inscritos" sessionTypeIcon="person" iconSize={70} fill={'#007185'} />

      <Tools buttons={toolsButtons} />

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
