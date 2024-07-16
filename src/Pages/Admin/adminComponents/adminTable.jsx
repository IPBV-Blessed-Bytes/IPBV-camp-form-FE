import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Button, Form, Modal, Col, Table } from 'react-bootstrap';
import { useTable, useFilters, useSortBy } from 'react-table';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Icons from '../../../components/Icons';
import * as XLSX from 'xlsx';
import AdminColumnFilter from './adminColumnFilter';
import { useNavigate } from 'react-router-dom';

const AdminTable = () => {
  const [data, setData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFormData, setNewFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();

  const apiUrl = 'http://ec2-35-89-80-98.us-west-2.compute.amazonaws.com:8080';

  useEffect(() => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/acampante`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${apiUrl}/${editFormData.id}`, editFormData);
      const newData = data.map((item, index) => (index === editRowIndex ? editFormData : item));
      setData(newData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddSubmit = async () => {
    try {
      await axios.post(apiUrl, newFormData);
      fetchData();
      setShowAddModal(false);
      setNewFormData({});
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

  const handleDeleteAll = () => {
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
      await Promise.all(idsToDelete.map((id) => axios.delete(`${apiUrl}/${id}`)));
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
      await axios.delete(`${apiUrl}/${itemToDelete.id}`);
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
    const columnData = [
      'Pacote:',
      'Nome:',
      'Observação:',
      'Pagamento:',
      'Igreja:',
      'Precisa de Carona:',
      'Vagas de Carona:',
      'Data de Inscrição:',
      'Nascimento:',
      'CPF:',
      'RG:',
      'Órgão Expedidor:',
      'Estado Expedidor:',
      'Categoria:',
      'Celular:',
      'Whatsapp:',
      'Email:',
      'Preço:',
      'Alergia:',
      'Agregados:',
      'Acomodação:',
      'Sub Acomodação:',
      'Alimentação:',
      'Transporte:',
    ];

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
              &nbsp; Todos
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
        Header: 'Ordem',
        accessor: (_, i) => i + 1,
        disableFilters: true,
        sortType: 'alphanumeric',
      },
      ...columnData.map((field) => ({
        Header: field,
        accessor: field,
        Filter: ({ column }) => <AdminColumnFilter column={column} />,
        sortType: field === 'Nome:' ? alphabeticalSort : 'alphanumeric',
      })),
      {
        Header: 'Editar / Deletar',
        Cell: ({ row }) => (
          <div className="justify-content-between d-flex">
            <Button variant="outline-success" onClick={() => handleEditClick(row.index)}>
              <Icons typeIcon="edit" iconSize={24} />
            </Button>
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
              <Button variant="danger" onClick={handleDeleteAll} className="d-flex align-items-center" size="lg">
                <Icons typeIcon="delete" iconSize={30} fill="#fff" />{' '}
                <span className="table-tools__button-name">&nbsp;Deletar Selecionados</span>
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
          <Modal.Title>Editar Inscrição</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              {columns
                .slice(1, -1)
                .filter((column) => column.Header !== 'Ordem')
                .map((column) => (
                  <Col key={column.accessor} md={4} className="mb-3">
                    <Form.Group>
                      <b>
                        <Form.Label>{column.Header}</Form.Label>
                      </b>
                      <Form.Control
                        type="text"
                        name={column.accessor}
                        value={editFormData[column.accessor] || ''}
                        onChange={handleEditFormChange}
                        className="form-control-lg form-control-bg"
                      />
                    </Form.Group>
                  </Col>
                ))}
            </Row>
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
          <Modal.Title>Nova Inscrição</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              {columns
                .slice(1, -1)
                .filter((column) => column.Header !== 'Ordem')
                .map((column) => (
                  <Col key={column.accessor} md={4} className="mb-3">
                    <Form.Group>
                      <b>
                        <Form.Label>{column.Header}</Form.Label>
                      </b>
                      <Form.Control
                        type="text"
                        name={column.accessor}
                        value={newFormData[column.accessor] || ''}
                        onChange={handleAddFormChange}
                        className="form-control-lg form-control-bg"
                      />
                    </Form.Group>
                  </Col>
                ))}
            </Row>
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
          <Modal.Title>Confirmar Exclusão</Modal.Title>
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
