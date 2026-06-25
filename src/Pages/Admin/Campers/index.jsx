import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useTable, useFilters, useSortBy, usePagination } from 'react-table';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';

import { permissionsSections } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import CoreTable from '@/components/Admin/CampersTable/CoreTable';
import TablePagination from '@/components/Admin/CampersTable/TablePagination';
import EditAndAddCamperModal from '@/components/Admin/CampersTable/EditAndAddCamperModal';

import useCampersData from './hooks/useCampersData';
import { buildCampersColumns, makeDefaultFilter } from './utils/buildColumns';
import { filterTypes } from './utils/tableFilters';
import { exportCampersToExcel } from './utils/exportExcel';
import { handleCamperFormChange } from './utils/handleFormChange';
import './style.scss';

const SORT_BY_KEY = 'sortBy';
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
const DEFAULT_PAGE_SIZE = 50;

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState({});
  const [showFilters, setShowFilters] = useState(false);

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
  const DefaultFilter = useMemo(() => makeDefaultFilter(), []);

  const columns = useMemo(
    () =>
      buildCampersColumns({
        selectedRows,
        rowsRef,
        handleSelectAll: () => handleSelectAll(),
        handleCheckboxChange,
        handleEditClick,
        handleDeleteClick,
        adminTableEditDeletePermissions,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selectedRows],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { sortBy, pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: {
        Filter: DefaultFilter,
        filter: 'text',
      },
      initialState: {
        sortBy: JSON.parse(sessionStorage.getItem(SORT_BY_KEY)) || [],
        pageSize: DEFAULT_PAGE_SIZE,
      },
      filterTypes,
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  rowsRef.current = rows;

  const handleSelectAll = () => {
    if (selectAllRows) {
      setSelectedRows([]);
    } else {
      setSelectedRows(
        rowsRef.current.map((row) => ({
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

  const handleGenerateExcel = () => exportCampersToExcel({ data, filteredRows: rowsRef.current });

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'filters',
      name: showFilters ? 'Ocultar Filtros' : 'Filtrar',
      onClick: () => setShowFilters((prev) => !prev),
      typeButton: 'outline-teal-blue',
      typeIcon: 'filter',
    },
    {
      fill: '#007185',
      iconSize: 22,
      id: 'campers-excel',
      name: 'Baixar Relatório',
      onClick: handleGenerateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#dc3545',
      iconSize: 22,
      id: 'room-excel',
      name: 'Deletar',
      onClick: handleDeleteWithCheckbox,
      typeButton: 'outline-danger',
      typeIcon: 'delete',
      condition: selectedRows.length > 0 && adminTableDeleteRegistrationsAndSelectRowsPermissions,
    },
    {
      fill: '#fff',
      iconSize: 22,
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
    <div className="admin-subpage admin-subpage--registered">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Gerenciamento de Inscritos"
        subtitle="Todos os acampantes inscritos"
        typeIcon="person"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <Row>
        <CoreTable
          getTableProps={getTableProps}
          getTableBodyProps={getTableBodyProps}
          headerGroups={headerGroups}
          rows={page}
          prepareRow={prepareRow}
          showFilters={showFilters}
          selectedRows={selectedRows}
        />
        <TablePagination
          pageIndex={pageIndex}
          pageCount={pageCount}
          pageSize={pageSize}
          totalRows={rows.length}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          gotoPage={gotoPage}
          previousPage={previousPage}
          nextPage={nextPage}
          setPageSize={setPageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
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
      </div>
    </div>
  );
};

AdminCampers.propTypes = {
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
};

export default AdminCampers;
