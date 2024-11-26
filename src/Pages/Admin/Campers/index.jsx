import { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Button, Form, Col } from 'react-bootstrap';
import { useTable, useFilters, useSortBy } from 'react-table';
import { initialValues } from '@/Pages/Routes/constants';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss'
import * as XLSX from 'xlsx';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/adminHeader';
import TableColumnFilter from '@/components/Admin/TableColumnFilter';
import TableIndeed from '@/components/Admin/TableIndeed';
import TableModal from '@/components/Admin/TableModal';
import TableColumnSelectFilter from '@/components/Admin/TableColumnSelectFilter';
import TableColumnFilterWithTwoValues from '@/components/Admin/TableColumnFilterWithTwoValues';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminTableAdvancedOptionsPermissions = permissions(userRole, 'advanced-options-admin-table');

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
            {adminTableAdvancedOptionsPermissions ? (
              <div className="d-flex justify-content-between w-100">
                <span className="d-flex">
                  <Form.Check
                    className="table-checkbox"
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectAllRows || selectedRows.length === rows.length}
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
              '-'
            )}
          </>
        ),
        accessor: 'selection',
        Filter: '',
        filter: '',
        sortType: 'alphanumeric',
        Cell: ({ row }) => (
          <>
            {adminTableAdvancedOptionsPermissions ? (
              <Form.Check
                className="table-checkbox"
                type="checkbox"
                onChange={() => handleCheckboxChange(row.index, row.original.personalInformation.name)}
                checked={selectedRows.some((selectedRow) => selectedRow.index === row.index)}
              />
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
            row.package.transportation === 'Com Ônibus' || row.package.transportation === 'Com Onibus'
              ? 'COM ÔNIBUS'
              : row.package.transportation === 'Sem Ônibus' || row.package.transportation === 'Sem Onibus'
              ? 'SEM ÔNIBUS'
              : ''
          } ${
            row.package.food === 'Café da manhã, almoço e jantar' ||
            row.package.food === 'Cafe da manha, almoco e jantar' ||
            row.package.food === 'Almoço e jantar' ||
            row.package.food === 'Almoco e jantar'
              ? 'COM ALIMENTAÇÃO'
              : row.package.food === ''
              ? ''
              : 'SEM ALIMENTAÇÃO'
          }`,
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Nome:',
        accessor: 'personalInformation.name',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: alphabeticalSort,
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Forma de Pagamento:',
        accessor: 'formPayment.formPayment',
        Filter: ({ column }) => (
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: 'creditCard', label: 'Cartão de Crédito' },
              { value: 'pix', label: 'PIX' },
              { value: 'boleto', label: 'Boleto Bancário' },
              { value: 'nonPaid' || 'nonPaidChild', label: 'Não pagante' },
            ]}
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
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: 'Boa Viagem', label: 'Boa Viagem' },
              { value: 'Outra', label: 'Outra' },
            ]}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Data de Nascimento:',
        accessor: 'personalInformation.birthday',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'CPF:',
        accessor: 'personalInformation.cpf',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'RG:',
        accessor: 'personalInformation.rg',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Órgão Emissor:',
        accessor: (row) =>
          `${row.personalInformation.rgShipper} -
          ${row.personalInformation.rgShipperState}`,
        Filter: ({ column }) => <TableColumnFilter column={column} />,
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
          <TableColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
          />
        ),
        filter: 'selectWithRide',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const carText = value.car ? 'Sim' : !value.car ? 'Não' : '-';
          const numberVacanciesText = value.numberVacancies ? value.numberVacancies : '-';
          return `${carText} ${numberVacanciesText !== '-' ? `| Vagas: ${numberVacanciesText}` : ''}`;
        },
      },
      {
        Header: 'Precisa de Carona:',
        accessor: 'contact.needRide',
        Filter: ({ column }) => (
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: true, label: 'Sim' },
              { value: false, label: 'Não' },
            ]}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: 'Observação da Carona:',
        accessor: 'contact.rideObservation',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Data de Inscrição:',
        accessor: 'registrationDate',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Categoria:',
        accessor: 'personalInformation.gender',
        Filter: ({ column }) => (
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: 'Homem', label: 'Adulto Masculino' },
              { value: 'Mulher', label: 'Adulto Feminimo' },
              { value: 'Crianca', label: 'Criança (até 10 anos)' },
            ]}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Celular:',
        accessor: (row) => ({
          cellPhone: row.contact.cellPhone,
          isWhatsApp: row.contact.isWhatsApp,
        }),
        Filter: ({ column }) => (
          <TableColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
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
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Preço:',
        accessor: 'totalPrice',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Alergia:',
        accessor: 'contact.allergy',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Agregados:',
        accessor: 'contact.aggregate',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Acomodação:',
        accessor: 'package.accomodationName',
        Filter: ({ column }) => (
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: 'Colegio XV de Novembro', label: 'Colégio XV de Novembro' },
              { value: 'Seminario Sao Jose', label: 'Seminário São José' },
              { value: 'Outra Acomodacao Externa', label: 'Outra Acomodação Externa' },
            ]}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Sub Acomodação:',
        accessor: 'package.subAccomodation',
        Filter: ({ column }) => (
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: 'Colegio Individual', label: 'Colégio Individual' },
              { value: 'Colegio Familia', label: 'Colégio Família' },
              { value: 'Colegio Camping', label: 'Colégio Camping' },
              { value: 'Seminario', label: 'Seminário' },
              { value: 'Outra', label: 'Outra' },
            ]}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Transporte:',
        accessor: 'package.transportation',
        Filter: ({ column }) => (
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: 'Com Onibus', label: 'Com Ônibus' },
              { value: 'Sem Onibus', label: 'Sem Ônibus' },
            ]}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Alimentação:',
        accessor: 'package.food',
        Filter: ({ column }) => (
          <TableColumnSelectFilter
            column={column}
            options={[
              { value: 'Almoco e jantar', label: 'Com Alimentação' },
              { value: 'Sem Alimentacao', label: 'Sem Alimentação' },
            ]}
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
          <TableColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
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
        Header: 'Observação:',
        accessor: 'observation',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Cupom:',
        accessor: (row) => ({
          discountCoupon: row.package.discountCoupon,
          discountValue: row.package.discountValue,
        }),
        Filter: ({ column }) => (
          <TableColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
          />
        ),
        filter: 'selectWithCoupon',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const hasDiscount = value.discountCoupon ? 'Sim' : !value.discountCoupon ? 'Não' : '-';
          const discountValueText = value.discountValue !== '0' ? value.discountValue : '-';
          return `${hasDiscount} ${discountValueText !== '-' ? `| Valor: ${discountValueText}` : ''}`;
        },
      },
      {
        Header: 'Chave do Pedido:',
        accessor: 'orderId',
        Filter: ({ column }) => <TableColumnFilter column={column} />,
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
          <TableColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
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
        Header: 'Inscrição Manual:',
        accessor: 'manualRegistration',
        Filter: ({ column }) => (
          <TableColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
          />
        ),
        filter: 'selectWithManualRegistration',
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: `${adminTableAdvancedOptionsPermissions ? 'Editar / Deletar' : '-'}`,
        Cell: ({ row }) => (
          <>
            {adminTableAdvancedOptionsPermissions ? (
              <div>
                <Button variant="outline-success" onClick={() => handleEditClick(row.index)}>
                  <Icons typeIcon="edit" iconSize={24} />
                </Button>{' '}
                <Button variant="outline-danger" onClick={() => handleDeleteClick(row.index, row)}>
                  <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                </Button>
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
      defaultColumn: { Filter: ({ column }) => <TableColumnFilter column={column} /> },
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
      },
    },
    useFilters,
    useSortBy,
  );

  const handleSelectAll = () => {
    if (selectAllRows) {
      setSelectedRows([]);
    } else {
      const allRows = rows.map((row, index) => ({
        index,
        name: row.original.personalInformation.name,
      }));
      setSelectedRows(allRows);
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
      totalPrice: 'Preço',
      'contact.hasAllergy': 'Tem Alergia',
      'contact.allergy': 'Alergia',
      'contact.hasAggregate': 'Tem Agregados',
      'contact.aggregate': 'Agregados',
      'package.accomodationName': 'Acomodação',
      'package.accomodation.id': 'ID da Acomodação',
      'package.subAccomodation': 'Sub Acomodação',
      'package.transportation': 'Transporte',
      'package.food': 'Alimentação',
      'package.price': 'Preço do pacote',
      'extraMeals.someFood': 'Tem Refeição Extra',
      'extraMeals.extraMeals': 'Refeições Extra',
      'extraMeals.totalPrice': 'Preço Refeição Extra',
      observation: 'Observação',
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
      'Preço',
      'Tem Alergia',
      'Alergia',
      'Tem Agregados',
      'Agregados',
      'Acomodação',
      'ID da Acomodação',
      'Sub Acomodação',
      'Transporte',
      'Alimentação',
      'Preço do pacote',
      'Tem Refeição Extra',
      'Refeições Extra',
      'Preço Refeição Extra',
      'Observação',
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

        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
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

    const filteredData = data.map((row) => {
      const newRow = { ...row };
      delete newRow.id;
      return flattenObject(newRow);
    });

    const orderedData = filteredData.map((row) => {
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
                {adminTableAdvancedOptionsPermissions && (
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
            {adminTableAdvancedOptionsPermissions && (
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
        {adminTableAdvancedOptionsPermissions && (
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
        <TableIndeed
          getTableProps={getTableProps}
          getTableBodyProps={getTableBodyProps}
          headerGroups={headerGroups}
          rows={rows}
          prepareRow={prepareRow}
          showFilters={showFilters}
          selectedRows={selectedRows}
        />
      </Row>

      <TableModal
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
  }),
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
  value: PropTypes.string,
};

export default AdminCampers;