import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useTable, useFilters, useSortBy, usePagination } from 'react-table';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';

import { permissionsSections } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import CoreTable from '@/components/Admin/ParticipantsTable/CoreTable';
import TablePagination from '@/components/Admin/ParticipantsTable/TablePagination';
import EditAndAddParticipantModal from '@/components/Admin/ParticipantsTable/EditAndAddParticipantModal';
import ImportParticipantsModal from '@/components/Admin/ParticipantsTable/ImportParticipantsModal';

import useParticipantsData from './hooks/useParticipantsData';
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

const AdminParticipants = ({ loggedUsername, userRole }) => {
  const { t } = useTranslation();
  scrollUp();

  const {
    data,
    loading,
    savingEdit,
    savingAdd,
    deleting,
    setFormSubmitted,
    saveEdit,
    addCamper,
    importCampers,
    deleteSelected,
    deleteOne,
  } = useParticipantsData({ loggedUsername });

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
      { label: t('admin.participants.statTotal'), value: campers.length },
      { label: t('admin.participants.statPaying'), value: paidCount, tone: 'info' },
      { label: t('admin.participants.statNonPaying'), value: campers.length - paidCount, tone: 'used' },
      { label: t('admin.participants.statCheckedIn'), value: checkedInCount, tone: 'free' },
      { label: t('admin.participants.statAwaitingCheckin'), value: campers.length - checkedInCount, tone: 'accent' },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        t,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selectedRows, catalog, t],
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
      name: showFilters ? t('admin.participants.hideFilters') : t('admin.participants.filter'),
      onClick: () => setShowFilters((prev) => !prev),
      typeButton: 'outline-teal-blue',
      typeIcon: 'filter',
    },
    {
      buttonClassName: childrenFilter && 'btn-bw',
      fill: childrenFilter ? '#fff' : '#007185',
      iconSize: 22,
      id: 'children-filter',
      name: childrenFilter ? t('admin.participants.showAll') : t('admin.participants.childrenFilter'),
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
      name: t('admin.participants.downloadReport'),
      onClick: handleGenerateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#dc3545',
      iconSize: 22,
      id: 'room-excel',
      name: t('admin.participants.delete'),
      onClick: handleDeleteWithCheckbox,
      typeButton: 'outline-danger',
      typeIcon: 'delete',
      condition: selectedRows.length > 0 && adminTableDeleteRegistrationsAndSelectRowsPermissions,
    },
    {
      fill: '#007185',
      iconSize: 22,
      id: 'import-campers',
      name: t('admin.participants.importSpreadsheet'),
      onClick: () => setShowImportModal(true),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
      condition: adminTableCreateRegistrationPermissions,
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'add-camper',
      name: t('admin.participants.newRegistration'),
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
        title={t('admin.participants.title')}
        subtitle={t('admin.participants.subtitle')}
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

      <EditAndAddParticipantModal
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
        savingEdit={savingEdit}
        savingAdd={savingAdd}
        deleting={deleting}
        handleCloseDeleteModal={() => setShowDeleteModal(false)}
        handleConfirmDeleteAll={handleConfirmDeleteAll}
        handleConfirmDeleteSpecific={handleConfirmDeleteSpecific}
      />

      <ImportParticipantsModal
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

AdminParticipants.propTypes = {
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
};

export default AdminParticipants;
