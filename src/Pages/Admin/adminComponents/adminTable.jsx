import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Button, Form, Modal, Col, Table } from 'react-bootstrap';
import { useTable, useFilters, useSortBy } from 'react-table';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import Icons from '../../../components/Icons';
import * as XLSX from 'xlsx';
import AdminColumnFilter from './adminColumnFilter';
import AdminTableColumns from './adminTableColumns';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../components/Loading';
import fetcher from '../../../fetchers/fetcherWithCredentials'

const AdminTable = () => {
  const [data, setData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const currentDate = `${day}/${month}/${year}`;

  useEffect(() => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetcher.get('acampante');
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

  const handleDeleteClick = async (index) => {
    handleDeleteSpecific();
    setEditRowIndex(index);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await fetcher.put(`acampante/${editFormData.id}`, editFormData);
      setFormSubmitted(true);
      const newData = data.map((item, index) => (index === editRowIndex ? editFormData : item));
      setData(newData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    const booleanValue =
      name === 'extraMeals.someFood' ||
      name === 'contact.car' ||
      name === 'contact.needRide' ||
      name === 'contact.isWhatsApp'
        ? value === 'true'
        : value;

    const updateState = (setter) => {
      setter((prevData) => {
        if (keys.length === 3) {
          const [parentKey, childKey, grandChildKey] = keys;
          return {
            ...prevData,
            [parentKey]: {
              ...prevData[parentKey],
              [childKey]: {
                ...prevData[parentKey]?.[childKey],
                [grandChildKey]: booleanValue,
              },
            },
          };
        } else if (keys.length === 2) {
          const [parentKey, childKey] = keys;
          return {
            ...prevData,
            [parentKey]: {
              ...prevData[parentKey],
              [childKey]: booleanValue,
            },
          };
        } else {
          return {
            ...prevData,
            [name]: booleanValue,
          };
        }
      });
    };

    if (formType === 'edit') {
      updateState(setEditFormData);
    } else if (formType === 'add') {
      updateState(setAddFormData);
    }
  };

  const handleAddSubmit = async () => {
    const updatedFormValues = {
      manualRegistration: true,
      registrationDate: currentDate,
      ...addFormData,
    };

    try {
      await fetcher.post('acampante', updatedFormValues);
      setFormSubmitted(true);
      fetchData();
      setShowAddModal(false);
      setAddFormData({});
    } catch (error) {
      console.error('Error adding data:', error);
    }
  };

  const handleCheckboxChange = (rowIndex) => {
    if (selectedRows.includes(rowIndex)) {
      setSelectedRows(selectedRows.filter((row) => row !== rowIndex));
    } else {
      setSelectedRows([...selectedRows, rowIndex]);
    }
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
    try {
      const idsToDelete = selectedRows.map((index) => data[index].id);
      await Promise.all(idsToDelete.map((id) => fetcher.delete(`acampante/${id}`)));
      const newData = data.filter((_, index) => !selectedRows.includes(index));
      setData(newData);
      setSelectedRows([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting selected data:', error);
    }
  };

  const handleConfirmDeleteSpecific = async () => {
    try {
      const itemToDelete = data[editRowIndex];
      await fetcher.delete(`acampante/${itemToDelete.id}`);
      const newData = data.filter((_, index) => index !== editRowIndex);
      setData(newData);
      setEditRowIndex(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting specific data:', error);
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
          <div className="d-flex justify-content-between w-100">
            <span className="d-flex">
              <Form.Check
                className="table-checkbox"
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedRows.length === data.length}
              />
              &nbsp; Todos:
            </span>
          </div>
        ),
        accessor: 'selection',
        Filter: '',
        sortType: 'alphanumeric',
        Cell: ({ row }) => (
          <Form.Check
            className="table-checkbox"
            type="checkbox"
            onChange={() => handleCheckboxChange(row.index)}
            checked={selectedRows.includes(row.index)}
          />
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
        accessor: 'package.title',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Nome:',
        accessor: 'personalInformation.name',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: alphabeticalSort,
      },
      {
        Header: 'Pagamento:',
        accessor: 'formPayment.formPayment',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Igreja:',
        accessor: 'contact.church',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Nascimento:',
        accessor: 'personalInformation.birthday',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'CPF:',
        accessor: 'personalInformation.cpf',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'RG:',
        accessor: 'personalInformation.rg',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Órgão Expedidor:',
        accessor: 'personalInformation.rgShipper',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Estado Expedidor:',
        accessor: 'personalInformation.rgShipperState',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Vai de Carro:',
        accessor: 'contact.car',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : 'Não'),
      },
      {
        Header: 'Precisa de Carona:',
        accessor: 'contact.needRide',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : 'Não'),
      },
      {
        Header: 'Vagas de Carona:',
        accessor: 'contact.numberVacancies',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Observação de Carona:',
        accessor: 'contact.rideObservation',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Data de Inscrição:',
        accessor: 'registrationDate',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Categoria:',
        accessor: 'personalInformation.gender',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Celular:',
        accessor: 'contact.cellPhone',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Whatsapp:',
        accessor: 'contact.isWhatsApp',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : 'Não'),
      },
      {
        Header: 'Email:',
        accessor: 'contact.email',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Preço:',
        accessor: 'totalPrice',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Cupom:',
        accessor: 'package.discountCoupon',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Alergia:',
        accessor: 'contact.allergy',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Agregados:',
        accessor: 'contact.aggregate',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Acomodação:',
        accessor: 'package.accomodation.name',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Sub Acomodação:',
        accessor: 'package.accomodation.subAccomodation',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Transporte:',
        accessor: 'package.transportation',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Alimentação:',
        accessor: 'package.food',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Alimentação Extra:',
        accessor: 'extraMeals.someFood',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : 'Não'),
      },
      {
        Header: 'Dias de Alimentação Extra:',
        accessor: 'extraMeals.extraMeals',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Inscrição Manual:',
        accessor: 'manualRegistration',
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        Cell: ({ value }) => (value ? 'Sim' : 'Não'),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Editar / Deletar',
        Cell: ({ row }) => (
          <div>
            <Button variant="outline-success" onClick={() => handleEditClick(row.index)}>
              <Icons typeIcon="edit" iconSize={24} />
            </Button>{' '}
            <Button variant="outline-danger" onClick={() => handleDeleteClick(row.index)}>
              <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
            </Button>
          </div>
        ),
        disableFilters: true,
      },
    ];
  }, [data, selectedRows]);

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
      defaultColumn: { Filter: ({ column }) => <AdminColumnFilter column={column} /> },
      initialState: {
        sortBy: JSON.parse(sessionStorage.getItem('sortBy')) || [],
      },
    },
    useFilters,
    useSortBy,
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const indices = data.map((_, index) => index);
      setSelectedRows(indices);
    } else {
      setSelectedRows([]);
    }
  };

  const generateExcel = () => {
    const filteredData = data.map((row) => {
      const newRow = { ...row };
      delete newRow.id;
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
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
      <Row className="mt-3">
        <Col>
          <Button variant="danger" onClick={() => navigate('/admin')}>
            <Icons typeIcon="arrow-left" iconSize={30} fill="#fff" />
            &nbsp;Voltar
          </Button>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <h4 className="fw-bold m-0">Tabela de Gerenciamento de Inscritos:</h4>
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="table-tools">
        <Col xl={9}>
          <div className="table-tools__left-buttons d-flex mb-3 gap-3">
            <Button
              variant="warning"
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
            <Button onClick={() => setShowAddModal(true)} className="d-flex align-items-center d-lg-none" size="lg">
              <Icons typeIcon="add-person" iconSize={30} fill="#fff" />{' '}
              <span className="table-tools__button-name">&nbsp;Nova Inscrição</span>
            </Button>
          </div>
        </Col>
        <Col xl={3}>
          <div className="table-tools__right-buttons mb-3">
            <Button
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center d-none d-lg-flex"
              size="lg"
            >
              <Icons typeIcon="add-person" iconSize={30} fill="#fff" />{' '}
              <span className="table-tools__button-name">&nbsp;Nova Inscrição</span>
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <div className="table-responsive">
          <Table striped bordered hover {...getTableProps()} className="custom-table">
            <thead>
              {headerGroups.map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th className="table-cells-header" key={column.id}>
                        <div className="d-flex justify-content-between align-items-center">
                          {column.render('Header')}
                          <span
                            className="sort-icon-wrapper px-3"
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                          >
                            <Icons className="sort-icon" typeIcon="sort" iconSize={20} />
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                  {showFilters && (
                    <tr>
                      {headerGroup.headers.map((column) => (
                        <th key={column.id}>{column.canFilter ? column.render('Filter') : null}</th>
                      ))}
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map((cell) => (
                      <td
                        className={`table-cells-cols${selectedRows.includes(row.index) ? ' selected-row' : ''}`}
                        key={cell.id}
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Row>

      <Modal show={showEditModal} size="xl" onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Editar Inscrição</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <AdminTableColumns
              editFormData={editFormData}
              handleFormChange={(e) => handleFormChange(e, 'edit')}
              formSubmitted={formSubmitted}
              currentDate={currentDate}
              editForm
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} size="xl" onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Nova Inscrição</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <AdminTableColumns
              addFormData={addFormData}
              handleFormChange={(e) => handleFormChange(e, 'add')}
              formSubmitted={formSubmitted}
              currentDate={currentDate}
              addForm
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddSubmit}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'delete-all'
            ? 'Tem certeza que deseja excluir as inscrições selecionadas?'
            : 'Tem certeza que deseja excluir essa inscrição?'}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={modalType === 'delete-all' ? handleConfirmDeleteAll : handleConfirmDeleteSpecific}
          >
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>
      {showScrollButton && <Icons className="scroll-to-top" typeIcon="arrow-top" onClick={scrollToTop} iconSize={30} />}

      <Loading loading={loading} />
    </Container>
  );
};

AdminTable.propTypes = {
  row: PropTypes.shape({
    index: PropTypes.string,
  }),
  column: PropTypes.shape({
    index: PropTypes.string,
  }),
};

export default AdminTable;
