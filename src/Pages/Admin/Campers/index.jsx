import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { useTable, useFilters, useSortBy } from 'react-table';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';

import { permissionsSections } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import Tools from '@/components/Admin/Header/Tools';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import CoreTable from '@/components/Admin/CampersTable/CoreTable';
import EditAndAddCamperModal from '@/components/Admin/CampersTable/EditAndAddCamperModal';

import useCampersData from './hooks/useCampersData';
import { buildCampersColumns, makeDefaultFilter } from './utils/buildColumns';
import { filterTypes } from './utils/tableFilters';
import { exportCampersToExcel } from './utils/exportExcel';
import { handleCamperFormChange } from './utils/handleFormChange';
import './style.scss';

const SORT_BY_KEY = 'sortBy';

const formatCurrentDate = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(
    now.getMinutes(),
  )}:${pad(now.getSeconds())}`;
};

const AdminCampers = ({ loggedUsername, userRole }) => {
  scrollUp();

  const {
    data,
    loading,
    formSubmitted,
    setFormSubmitted,
    saveEdit,
    addCamper,
    deleteSelected,
    deleteOne,
  } = useCampersData({ loggedUsername });

  const {
    adminTableEditDeletePermissions,
    adminTableCreateRegistrationPermissions,
    adminTableDeleteRegistrationsAndSelectRowsPermissions,
  } = permissionsSections(userRole);

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

  const filteredRowsRef = useRef([]);
  useEffect(() => {
    filteredRowsRef.current = filteredRows;
  }, [filteredRows]);

  const currentDate = formatCurrentDate();

  const handleEditClick = (index) => {
    setEditRowIndex(index);
    setEditFormData(data[index]);
    setShowEditModal(true);
  };

  const handleDeleteClick = (index, row) => {
    setModalType('delete-specific');
    setEditRowIndex(index);
    setShowDeleteModal(true);
    setName(row.original.personalInformation.name);
  };

  const handleCheckboxChange = (index, rowName) => {
    setSelectedRows((prev) => {
      const isSelected = prev.some((row) => row.index === index);
      return isSelected ? prev.filter((row) => row.index !== index) : [...prev, { index, name: rowName }];
    });
  };

  const handleDeleteWithCheckbox = () => {
    setShowDeleteModal(true);
    setModalType('delete-all');
  };

  const handleFormChange = (event, formType) => {
    const setter = formType === 'edit' ? setEditFormData : setAddFormData;
    handleCamperFormChange(event, setter);
  };

  const handleSaveEdit = async () => {
    const saveOrEditSuccess = await saveEdit({ editFormData, editRowIndex });
    if (saveOrEditSuccess) setShowEditModal(false);
  };

  const handleAddSubmit = async () => {
    const addCamperSuccess = await addCamper({ addFormData, currentDate });
    if (addCamperSuccess) {
      setShowAddModal(false);
      setAddFormData({});
    }
  };

  const handleConfirmDeleteAll = async () => {
    await deleteSelected({ selectedRows });
    setSelectedRows([]);
    setSelectAllRows(false);
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteSpecific = async () => {
    await deleteOne({ editRowIndex });
    setEditRowIndex(null);
    setShowDeleteModal(false);
  };

  const rowsRef = useRef([]);
  const DefaultFilter = useMemo(() => makeDefaultFilter(setFilteredRows), []);

  const columns = useMemo(
    () =>
      buildCampersColumns({
        selectedRows,
        filteredRows,
        rowsRef,
        handleSelectAll: () => handleSelectAll(),
        handleCheckboxChange,
        handleEditClick,
        handleDeleteClick,
        setFilteredRows,
        adminTableEditDeletePermissions,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selectedRows, filteredRows],
  );

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
        Filter: DefaultFilter,
      },
      initialState: { sortBy: JSON.parse(sessionStorage.getItem(SORT_BY_KEY)) || [] },
      filterTypes,
    },
    useFilters,
    useSortBy,
  );

  rowsRef.current = rows;

  const handleSelectAll = () => {
    const isFilterApplied = filteredRowsRef.current.length > 0;

    if (selectAllRows) {
      setSelectedRows([]);
    } else {
      const rowsToSelect = isFilterApplied ? filteredRowsRef.current : rowsRef.current;
      setSelectedRows(
        rowsToSelect.map((row) => ({
          index: row.index,
          name: row.original.personalInformation.name,
        })),
      );
    }
    setSelectAllRows(!selectAllRows);
  };

  const storeSortByInSession = useCallback(() => {
    sessionStorage.setItem(SORT_BY_KEY, JSON.stringify(sortBy));
  }, [sortBy]);

  useEffect(() => {
    window.addEventListener('beforeunload', storeSortByInSession);
    return () => window.removeEventListener('beforeunload', storeSortByInSession);
  }, [storeSortByInSession]);

  const handleGenerateExcel = () => exportCampersToExcel({ data, filteredRows: filteredRowsRef.current });

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 mb-3 mb-lg-0 d-flex flex-column align-items-center',
      cols: { xs: 6, lg: 3 },
      fill: '#007185',
      iconSize: 40,
      id: 'filters',
      name: showFilters ? 'Ocultar Filtros' : 'Filtrar',
      onClick: () => setShowFilters((prev) => !prev),
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
      onClick: handleGenerateExcel,
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
      condition: selectedRows.length > 0 && adminTableDeleteRegistrationsAndSelectRowsPermissions,
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
      condition: adminTableCreateRegistrationPermissions,
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
        handleCloseDeleteModal={() => setShowDeleteModal(false)}
        handleConfirmDeleteAll={handleConfirmDeleteAll}
        handleConfirmDeleteSpecific={handleConfirmDeleteSpecific}
      />

      <Loading loading={loading} />
    </Container>
  );
};

AdminCampers.propTypes = {
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
};

export default AdminCampers;
