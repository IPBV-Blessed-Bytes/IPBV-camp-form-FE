import { useState, useEffect, useMemo } from 'react';
import { Table, Container, Accordion, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { useTable, useSortBy } from 'react-table';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import './style.scss';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';
import scrollUp from '@/hooks/useScrollUp';
import AdminHeader from '@/components/Admin/adminHeader';

const AdminAggregate = ({ loggedUsername }) => {
  const [dropdownCampers, setDropdownCampers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCamper, setSelectedCamper] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomToDelete, setRoomToDelete] = useState(null);

  scrollUp();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetcher.get('aggregate');
      setDropdownCampers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetcher.get('aggregate/room');
      setRooms(response.data);
    } catch (error) {
      toast.error('Erro ao carregar quartos');
      console.error('Erro ao buscar quartos:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchUsers();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewRoomName('');
  };

  const createRoom = async () => {
    if (newRoomName.trim() === '') {
      toast.error('Insira um nome para o quarto');
      return;
    }

    const newRoom = { id: uuidv4(), name: newRoomName, campers: [] };
    setLoading(true);

    try {
      const response = await fetcher.post('aggregate', newRoom);

      if (response.data === 'Quarto criado com sucesso.') {
        fetchRooms();
        setRooms([...rooms, { ...response.data, name: newRoomName }]);
        toast.success('Quarto criado com sucesso');
        registerLog(`Criou o quarto com nome ${newRoomName}`, loggedUsername);
        handleCloseModal();
      }
    } catch (error) {
      toast.error('Erro ao criar quarto');
      console.error('Erro ao criar quarto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDeleteModal = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setRoomToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDeleteRoom = async () => {
    if (roomToDelete) {
      const roomData = {
        id: roomToDelete.id,
        name: roomToDelete.name,
        campers: roomToDelete.campers || [],
      };
      setLoading(true);

      try {
        const response = await fetcher.delete(`aggregate/${roomToDelete.id}`, { data: roomData });

        if (response.data === 'Quarto removido com sucesso.') {
          fetchRooms();
          setRooms(rooms.filter((room) => room.id !== roomToDelete.id));
          toast.success('Quarto excluido com sucesso');
          registerLog(`Excluiu o quarto com nome ${roomToDelete.name}`, loggedUsername);
          handleCloseDeleteModal();
        }
      } catch (error) {
        toast.error('Erro ao excluir quarto');
        console.error('Erro ao excluir quarto:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const addCamperToRoom = async (roomId, camper, roomName) => {
    const formattedCamper = {
      name: camper.personalInformation.name,
      birthday: camper.personalInformation.birthday,
      cpf: camper.personalInformation.cpf,
      rg: camper.personalInformation.rg,
      rgShipper: camper.personalInformation.rgShipper,
      rgShipperState: camper.personalInformation.rgShipperState,
      gender: camper.personalInformation.gender,
    };

    const room = rooms.find((room) => room.id === roomId);
    if (room) {
      const updatedRoom = {
        ...room,
        campers: [formattedCamper],
      };
      setLoading(true);

      try {
        const response = await fetcher.put(`aggregate/${roomId}`, updatedRoom);

        if (response.data === 'Quarto atualizado com sucesso.') {
          fetchRooms();
          fetchUsers();
          toast.success('Acampante adicionado ao quarto');
          registerLog(`Adicionou usuário ${camper.personalInformation.name} ao quarto ${roomName}`, loggedUsername);
        }
      } catch (error) {
        toast.error('Erro ao adicionar pessoa ao quarto');
        console.error('Erro ao adicionar pessoa ao quarto:', error);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Quarto não encontrado');
      console.error('Room not found:', roomId);
    }
  };

  const handleAddCamperToRoom = (roomId, roomName) => {
    if (selectedCamper[roomId]) {
      const camperId = selectedCamper[roomId];
      const camper = dropdownCampers.find((c) => {
        return String(c.id) === String(camperId);
      });

      if (!camper) {
        toast.error('Usuário não encontrado na base de dados');
        return;
      }

      addCamperToRoom(roomId, camper, roomName);
    } else {
      toast.warn(`Selecione um usuário antes de adicionar ao quarto`);
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

      <Accordion className="mb-4" defaultActiveKey="1">
        {rooms.map((room) => (
          <Accordion.Item eventKey={room.id} key={room.id}>
            <Accordion.Header>{room.name}</Accordion.Header>
            <Accordion.Body>
              <div className="d-flex justify-content-end mb-3">
                <Button variant="danger" onClick={() => handleShowDeleteModal(room)}>
                  <Icons typeIcon="delete" iconSize={24} fill="#fff" />
                  &nbsp;Excluir Quarto
                </Button>
              </div>
              <Row className="mb-3">
                <Col lg="8" md="7" sm="12" className="mb-3 mb-md-0">
                  <Form.Select
                    onChange={(e) => {
                      setSelectedCamper((prev) => ({ ...prev, [room.id]: e.target.value }));
                    }}
                    size="md"
                  >
                    <option value="" disabled selected>
                      Selecione um agregado para adicionar
                    </option>
                    {dropdownCampers
                      .filter((camper) => !Object.values(selectedCamper).includes(camper.id))
                      .sort((a, b) => a.personalInformation.name.localeCompare(b.personalInformation.name))
                      .map((camper) => (
                        <option key={camper.id} value={camper.id}>
                          {camper.personalInformation.name}
                        </option>
                      ))}
                  </Form.Select>
                </Col>
                <Col lg="4" md="5" sm="12" className="d-flex justify-content-end mb-3">
                  <Button onClick={() => handleAddCamperToRoom(room.id, room.name)} size="md">
                    <Icons typeIcon="add-person" iconSize={24} fill="#fff" />
                    &nbsp;Adicionar ao Quarto
                  </Button>
                </Col>
              </Row>
              <ul>
                {(room.campers || []).map((camper, index) => (
                  <li key={index}>{camper.name}</li>
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
