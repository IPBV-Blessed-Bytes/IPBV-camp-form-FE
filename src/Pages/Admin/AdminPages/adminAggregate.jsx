import { useState, useEffect, useMemo } from 'react';
import { Table, Container, Accordion, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTable, useSortBy } from 'react-table';
import { v4 as uuidv4 } from 'uuid';
import Icons from '@/components/Icons';
import Loading from '@/components/Loading';
import fetcher from '@/fetchers/fetcherWithCredentials';
import AdminHeader from '../AdminComponents/adminHeader';
import scrollUp from '@/hooks/useScrollUp';

const AdminAggregate = () => {
  const [dropdownCampers, setDropdownCampers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCamper, setSelectedCamper] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomIdToDelete, setRoomIdToDelete] = useState(null);

  scrollUp();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetcher.get('camper', { params: { size: 100000 } });
        const campers = Object.entries(response.data.content).map(([key, camper]) => ({
          id: key,
          personalInformation: camper.personalInformation,
          contact: camper.contact,
        }));
        const sortedCampers = campers.sort((a, b) =>
          a.personalInformation.name.localeCompare(b.personalInformation.name),
        );
        const filteredCampers = sortedCampers.filter((camper) => camper.contact.hasAggregate);
        setDropdownCampers(filteredCampers);
      } catch (error) {
        toast.error('Erro ao carregar usuários');
        console.error('Erro ao buscar campers:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await fetcher.get('aggregate/rooms');
        setRooms(response.data);
      } catch (error) {
        toast.error('Erro ao carregar quartos');
        console.error('Erro ao buscar quartos:', error);
      }
    };

    fetchUsers();
    fetchRooms();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewRoomName('');
  };

  const createRoom = async () => {
    if (newRoomName.trim() === '') {
      toast.error('Por favor, insira um nome para o quarto');
      return;
    }

    const newRoom = { id: uuidv4(), name: newRoomName, campers: [] };
    try {
      const response = await fetcher.post('aggregate/rooms', newRoom);
      setRooms([...rooms, response.data]);
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao criar quarto');
      console.error('Erro ao criar quarto:', error);
    }
  };

  const handleShowDeleteModal = (roomId) => {
    setRoomIdToDelete(roomId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setRoomIdToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDeleteRoom = async () => {
    if (roomIdToDelete) {
      try {
        await fetcher.delete(`aggregate/rooms/${roomIdToDelete}`);
        setRooms(rooms.filter((room) => room.id !== roomIdToDelete));
        handleCloseDeleteModal();
      } catch (error) {
        toast.error('Erro ao excluir quarto');
        console.error('Erro ao excluir quarto:', error);
      }
    }
  };

  const addCamperToRoom = async (roomId, camper) => {
    const room = rooms.find((room) => room.id === roomId);
    if (room) {
      const updatedRoom = { ...room, campers: [...room.campers, camper] };
      try {
        await fetcher.put(`aggregate/rooms/${roomId}`, updatedRoom);
        setRooms(rooms.map((r) => (r.id === roomId ? updatedRoom : r)));
      } catch (error) {
        toast.error('Erro ao adicionar pessoa ao quarto');
        console.error('Erro ao adicionar pessoa ao quarto:', error);
      }
    }
  };

  const handleAddCamperToRoom = (roomId) => {
    if (selectedCamper[roomId]) {
      const camper = dropdownCampers.find((c) => c.id === selectedCamper[roomId]);
      if (camper) {
        addCamperToRoom(roomId, camper);
      }
    }
  };

  const columns = useMemo(
    () => [
      { Header: 'Usuário:', accessor: 'personalInformation.name' },
      {
        Header: 'Agregados:',
        accessor: 'contact.aggregate',
        Cell: ({ value }) => (value ? value.split('|').join(', ') : 'Nenhum agregado'),
      },
    ],
    [],
  );

  const tableInstance = useTable({ columns, data: dropdownCampers }, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Agregados" sessionTypeIcon="aggregate" iconSize={80} fill={'#204691'} />

      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Lista de Agregados</Accordion.Header>
          <Accordion.Body>
            <Table striped bordered hover responsive className="custom-table mt-3" {...getTableProps()}>
              <thead>
                {headerGroups.map((headerGroup, index) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                    {headerGroup.headers.map((column, index) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="table-cells-header"
                        key={index}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          {column.render('Header')}
                          <span className="sort-icon-wrapper">
                            <Icons className="sort-icon" typeIcon="sort" iconSize={20} />
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center">
                      Nenhum usuário com agregados encontrado
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={index}>
                        {row.cells.map((cell, index) => (
                          <td {...cell.getCellProps()} key={index}>
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className="d-flex justify-content-end">
        <Button onClick={handleOpenModal} className="mb-3 d-flex align-items-center" size="lg">
          <Icons typeIcon="plus" iconSize={20} fill="#fff" />
          &nbsp;Adicionar Novo Quarto
        </Button>
      </div>

      <Accordion defaultActiveKey="1">
        {rooms.map((room) => (
          <Accordion.Item eventKey={room.id} key={room.id}>
            <Accordion.Header>{room.name}</Accordion.Header>
            <Accordion.Body>
              <div className="d-flex justify-content-end mb-3">
                <Button variant="danger" onClick={() => handleShowDeleteModal(room.id)}>
                  <Icons typeIcon="delete" iconSize={24} fill="#fff" />
                  &nbsp;Excluir Quarto
                </Button>
              </div>
              <Row className="mb-3">
                <Col lg="8" md="7" sm="12" className="mb-3 mb-md-0">
                  <Form.Select
                    onChange={(e) => setSelectedCamper((prev) => ({ ...prev, [room.id]: e.target.value }))}
                    size="md"
                  >
                    <option value="">Selecione um agregado para adicionar</option>
                    {dropdownCampers.map((camper) => (
                      <option key={camper.id} value={camper.id}>
                        {camper.personalInformation.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col lg="4" md="5" sm="12" className="d-flex justify-content-end mb-3">
                  <Button onClick={() => handleAddCamperToRoom(room.id)} size="md">
                    <Icons typeIcon="add-person" iconSize={24} fill="#fff" />
                    &nbsp;Adicionar ao Quarto
                  </Button>
                </Col>
              </Row>
              <ul>
                {room.campers.map((camper, index) => (
                  <li key={index}>{camper.personalInformation.name}</li>
                ))}
              </ul>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Adicionar Novo Quarto</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newRoomName">
            <Form.Label>
              <b>Nome do Quarto:</b>
            </Form.Label>
            <Form.Control
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nome do novo quarto"
              size="lg"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={createRoom}>
            Criar Quarto
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Tem certeza de que deseja excluir este quarto?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDeleteRoom}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminAggregate;
