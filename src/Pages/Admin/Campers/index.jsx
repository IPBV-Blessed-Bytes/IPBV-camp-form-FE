import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Button, Col } from 'react-bootstrap';
import { useTable, useFilters, useSortBy } from 'react-table';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import generateExcel from './utils/generateExcel';
import { permissions } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/AdminHeader';
// import ColumnFilter from '@/components/Admin/CampersTable/ColumnFilter';
import CoreTable from '@/components/Admin/CampersTable/CoreTable';
import EditAndAddCamperModal from '@/components/Admin/CampersTable/EditAndAddCamperModal';
import { useCampersTable } from '../../../hooks/useCampersTable';
import useColumns from './utils/useColumns';

const AdminCampers = ({ loggedUsername, userRole }) => {
  // const [filteredRows, setFilteredRows] = useState([]);
  const adminTableCreateRegistration = permissions(userRole, 'create-registration-admin-table');
  const adminTableDeleteRegistrationsAndSelectRows = permissions(userRole, 'delete-registrations-admin-table');

  const {
    data,
    name,
    showEditModal,
    setShowEditModal,
    editFormData,
    showAddModal,
    setShowAddModal,
    addFormData,
    selectedRows,
    showDeleteModal,
    modalType,
    showFilters,
    showScrollButton,
    formSubmitted,
    setFormSubmitted,
    loading,
    currentDate,
    handleFormChange,
    handleSaveEdit,
    handleAddSubmit,
    handleDeleteWithCheckbox,
    handleConfirmDeleteAll,
    handleConfirmDeleteSpecific,
    handleCloseDeleteModal,
    handleFilterClick,
    filteredRowsRef,
  } = useCampersTable({um: 'um', dois: 'dois', tres: 'tres'});

  // console.log('filteredRows1:',filteredRows)

  scrollUp();

  const columns = useColumns(userRole, 'edit-delete-admin-table', selectedRows, []);

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

  const storeSortByInSession = useCallback(() => {
    sessionStorage.setItem('sortBy', JSON.stringify(sortBy));
  }, [sortBy]);

  useEffect(() => {
    window.addEventListener('beforeunload', storeSortByInSession);
    return () => {
      window.removeEventListener('beforeunload', storeSortByInSession);
    };
  }, [storeSortByInSession]);

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
        // defaultColumn: {
        //   Filter: ({ column }) => (
        //     <ColumnFilter
        //       column={column}
        //       onFilterChange={() => {
        //         setFilteredRows(column.filteredRows);
        //       }}
        //     />
        //   ),
        // },
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
            <Button
              variant="success"
              onClick={generateExcel(data, filteredRowsRef)}
              className="d-flex align-items-center"
              size="lg"
            >
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
        handleSaveEdit={handleSaveEdit(loggedUsername)}
        addFormData={addFormData}
        handleFormChange={handleFormChange}
        handleAddSubmit={handleAddSubmit(loggedUsername)}
        handleCloseDeleteModal={handleCloseDeleteModal}
        handleConfirmDeleteAll={handleConfirmDeleteAll(loggedUsername)}
        handleConfirmDeleteSpecific={handleConfirmDeleteSpecific(loggedUsername)}
      />

      {showScrollButton && <Icons className="scroll-to-top" typeIcon="arrow-top" onClick={scrollUp} iconSize={30} />}
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
