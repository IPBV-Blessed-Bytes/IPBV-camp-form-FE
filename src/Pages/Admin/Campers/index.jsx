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
import StatCards from '@/components/Admin/StatCards';
import CoreTable from '@/components/Admin/CampersTable/CoreTable';
import TablePagination from '@/components/Admin/CampersTable/TablePagination';
import EditAndAddCamperModal from '@/components/Admin/CampersTable/EditAndAddCamperModal';
import ImportCampersModal from '@/components/Admin/CampersTable/ImportCampersModal';

import useCampersData from './hooks/useCampersData';
import { useProductCatalog } from './hooks/useProductCatalog';
import { buildCampersColumns, makeDefaultFilter } from './utils/buildColumns';
import { filterTypes } from './utils/tableFilters';
import { exportCampersToExcel } from './utils/exportExcel';
import './style.scss';

const SORT_BY_KEY = 'sortBy';
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
const DEFAULT_PAGE_SIZE = 50;
const CHILDREN_AGE_RANGE = '2-10';

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
    setFormSubmitted,
    saveEdit,
    addCamper,
    importCampers,
    deleteSelected,
    deleteOne,
  } = useCampersData({ loggedUsername });

  const catalog = useProductCatalog();

  const {
    adminTableEditDeletePermissions,
    adminTableCreateRegistrationPermissions,
    adminTableDeleteRegistrationsAndSelectRowsPermissions,
  } = permissionsSections(userRole);

  const [name, setName] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllRows, setSelectAllRows] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [childrenFilter, setChildrenFilter] = useState(false);

  const currentDate = formatCurrentDate();

  const statItems = useMemo(() => {
    const campers = data || [];
    const isNonPaying = (camper) => camper.totalPrice === '0' || !camper.formPayment?.formPayment;
    const paidCount = campers.filter((camper) => !isNonPaying(camper)).length;
    const checkedInCount = campers.filter((camper) => camper.checkin).length;
    return [
      { label: 'Total de inscritos', value: campers.length },
      { label: 'Pagantes', value: paidCount, tone: 'info' },
      { label: 'Não pagantes', value: campers.length - paidCount, tone: 'used' },
      { label: 'Check-in feito', value: checkedInCount, tone: 'free' },
      { label: 'Aguardando check-in', value: campers.length - checkedInCount, tone: 'accent' },
    ];
  }, [data]);

  const handleEditClick = (index) => {
    setEditRowIndex(index);
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

  const handleSaveEdit = async (editFormData) => {
    const saveOrEditSuccess = await saveEdit({ editFormData, editRowIndex });
    if (saveOrEditSuccess) setShowEditModal(false);
  };

  const handleAddSubmit = async (addFormData) => {
    const addCamperSuccess = await addCamper({ addFormData, currentDate });
    if (addCamperSuccess) setShowAddModal(false);
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
        catalog,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selectedRows, catalog],
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
    setFilter,
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
      buttonClassName: childrenFilter && 'btn-bw',
      fill: childrenFilter ? '#fff' : '#007185',
      iconSize: 22,
      id: 'children-filter',
      name: childrenFilter ? 'Mostrar Todos' : 'Crianças (2–10 anos)',
      onClick: () => {
        const next = !childrenFilter;
        setChildrenFilter(next);
        setFilter('age', next ? CHILDREN_AGE_RANGE : undefined);
      },
      typeButton: childrenFilter ? 'teal-blue' : 'outline-teal-blue',
      typeIcon: 'family',
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
      fill: '#007185',
      iconSize: 22,
      id: 'import-campers',
      name: 'Importar Planilha',
      onClick: () => setShowImportModal(true),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
      condition: adminTableCreateRegistrationPermissions,
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
      buttonClassName: 'btn-bw',
      typeButton: 'teal-blue',
      typeIcon: 'add-person',
      condition: adminTableCreateRegistrationPermissions,
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--registered">
      <AdminSubpageHeader
        sessionKey="acampantes"
        username={loggedUsername}
        title="Inscrições"
        subtitle="Todos os acampantes inscritos"
        typeIcon="person"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

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
        editInitialData={editRowIndex != null ? data[editRowIndex] : {}}
        editRowIndex={editRowIndex}
        currentDate={currentDate}
        onSaveEdit={handleSaveEdit}
        onAddSubmit={handleAddSubmit}
        handleCloseDeleteModal={() => setShowDeleteModal(false)}
        handleConfirmDeleteAll={handleConfirmDeleteAll}
        handleConfirmDeleteSpecific={handleConfirmDeleteSpecific}
      />

      <ImportCampersModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onImport={importCampers}
        loading={loading}
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
