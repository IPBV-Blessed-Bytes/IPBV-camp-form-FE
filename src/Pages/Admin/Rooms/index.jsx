import { useState, useEffect, useMemo } from 'react';
import { Table, Accordion, Button, Form, Badge } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';
import { useTable, useSortBy } from 'react-table';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import Icons from '@/components/Global/Icons';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import {
  listAggregates,
  createRoom as createRoomRequest,
  updateRoom,
  renameRoom as renameRoomRequest,
  deleteRoom,
  removeCamperFromRoom,
  reorderRooms,
} from '@/services/rooms';
import { registerLog } from '@/services/logs';
import { useRoomsList } from '@/hooks/useRoomsList';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import StatCards from '@/components/Admin/StatCards';

const AdminRooms = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [dropdownCampers, setDropdownCampers] = useState([]);
  const { rooms, refetch: refetchRooms } = useRoomsList();
  const [roomSortOrder, setRoomSortOrder] = useState('asc');
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [selectedCamper, setSelectedCamper] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [renamedRoomName, setRenamedRoomName] = useState('');
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [roomToRename, setRoomToRename] = useState(null);
  const [showDeleteCamperFromRoomModal, setShowDeleteCamperFromRoomModal] = useState(false);
  const [camperToDelete, setCamperToDelete] = useState(null);

  scrollUp();

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await listAggregates();
      setDropdownCampers(data);
    } catch (error) {
      toast.error(t('admin.rooms.toast.loadUsersError'));
      console.error('Erro ao buscar usuários:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewRoomName('');
  };

  const createRoom = async () => {
    if (newRoomName.trim() === '') {
      toast.error(t('admin.rooms.toast.roomNameRequired'));
      return;
    }

    const newRoom = { id: uuidv4(), name: newRoomName, campers: [] };
    setSaving(true);

    try {
      const data = await createRoomRequest(newRoom);

      if (data === 'Quarto criado com sucesso.') {
        refetchRooms();
        toast.success(t('admin.rooms.toast.roomCreated'));
        registerLog(`Criou o quarto com nome ${newRoomName}`, loggedUsername);
        handleCloseModal();
      }
    } catch (error) {
      toast.error(t('admin.rooms.toast.roomCreateError'));
      console.error('Erro ao criar quarto:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleShowDeleteModal = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const handleShowEditModal = (room) => {
    setRoomToRename(room);
    setShowEditModal(true);
  };

  const handleCloseDeleteModal = () => {
    setRoomToDelete(null);
    setShowDeleteModal(false);
  };

  const handleCloseEditModal = () => {
    setRoomToRename(null);
    setShowEditModal(false);
  };

  const handleShowDeleteCamperFromRoomModal = (camper) => {
    if (!camper || !camper.id) {
      toast.error(t('admin.rooms.toast.camperNotFound'));
      return;
    }
    setCamperToDelete(camper);
    setShowDeleteCamperFromRoomModal(true);
  };

  const handleCloseDeleteCamperFromRoomModal = () => {
    setCamperToDelete(null);
    setShowDeleteCamperFromRoomModal(false);
  };

  const confirmDeleteRoom = async () => {
    if (roomToDelete) {
      const roomData = {
        id: roomToDelete.id,
        name: roomToDelete.name,
        campers: roomToDelete.campers || [],
      };
      setSaving(true);

      try {
        const data = await deleteRoom(roomToDelete.id, roomData);

        if (data === 'Quarto removido com sucesso.') {
          refetchRooms();
          fetchUsers(true);
          toast.success(t('admin.rooms.toast.roomDeleted'));
          registerLog(`Excluiu o quarto com nome ${roomToDelete.name}`, loggedUsername);
          handleCloseDeleteModal();
        }
      } catch (error) {
        toast.error(t('admin.rooms.toast.roomDeleteError'));
        console.error('Erro ao excluir quarto:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    if (roomToRename) {
      setRenamedRoomName(roomToRename.name);
    }
  }, [roomToRename]);

  const renameRoom = async () => {
    if (roomToRename) {
      const roomData = {
        name: renamedRoomName,
      };
      setSaving(true);

      try {
        const data = await renameRoomRequest(roomToRename.id, roomData);

        if (data === 'Nome do quarto atualizado com sucesso.') {
          refetchRooms();
          toast.success(t('admin.rooms.toast.roomRenamed'));
          registerLog(`Renomeou o quarto com nome ${roomToRename.name}`, loggedUsername);
          handleCloseEditModal();
        }
      } catch (error) {
        toast.error(t('admin.rooms.toast.roomRenameError'));
        console.error('Erro ao renomear quarto:', error);
      } finally {
        setSaving(false);
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
        const data = await updateRoom(roomId, updatedRoom);

        if (data === 'Quarto atualizado com sucesso.') {
          refetchRooms();
          fetchUsers();
          toast.success(t('admin.rooms.toast.camperAdded'));
          registerLog(`Adicionou usuário ${camper.personalInformation.name} ao quarto ${roomName}`, loggedUsername);
        }
      } catch (error) {
        toast.error(t('admin.rooms.toast.camperAddError'));
        console.error('Erro ao adicionar pessoa ao quarto:', error);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error(t('admin.rooms.toast.roomNotFound'));
      console.error('Room not found:', roomId);
    }
  };

  const handleAddCamperToRoom = (roomId, roomName) => {
    if (selectedCamper[roomId]) {
      setSelectedCamper({});
      const camperId = selectedCamper[roomId];
      const camper = dropdownCampers.find((c) => {
        return String(c.id) === String(camperId);
      });

      if (!camper) {
        toast.error(t('admin.rooms.toast.camperNotInDb'));
        return;
      }

      addCamperToRoom(roomId, camper, roomName);
    } else {
      toast.warn(t('admin.rooms.toast.selectCamperFirst'));
    }
  };

  const deleteCamperFromRoom = async (camperToDelete) => {
    if (!camperToDelete) {
      toast.error(t('admin.rooms.toast.noCamperSelected'));
      return;
    }
    setSaving(true);

    try {
      const data = await removeCamperFromRoom(camperToDelete.id);

      if (data === 'Acampante removido do quarto com sucesso.') {
        toast.success(t('admin.rooms.toast.camperRemoved'));
        refetchRooms();
        fetchUsers(true);
        handleCloseDeleteCamperFromRoomModal();
      }
    } catch (error) {
      toast.error(t('admin.rooms.toast.camperRemoveError'));
      console.error('Erro ao apagar acampante do quarto:', error);
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { Header: t('admin.rooms.columns.user'), accessor: 'personalInformation.name' },
      {
        Header: t('admin.rooms.columns.aggregates'),
        accessor: 'contact.aggregate',
        Cell: ({ value }) => (value ? value.split('|').join(', ') : t('admin.rooms.noAggregate')),
      },
    ],
    [t],
  );

  const handleRoomDragStart = (index) => (e) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRoomDragOver = (index) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== dragOverIndex) setDragOverIndex(index);
  };

  const handleRoomDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleRoomDrop = (targetIndex) => async (e) => {
    e.preventDefault();
    const sourceIndex = dragIndex;
    setDragIndex(null);
    setDragOverIndex(null);
    if (sourceIndex === null || sourceIndex === targetIndex) return;
    const reordered = [...rooms];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    try {
      await reorderRooms(reordered.map((room) => room.id));
      refetchRooms();
    } catch (error) {
      toast.error(t('admin.rooms.toast.reorderError'));
    }
  };

  const persistAlphabeticalOrder = async () => {
    const nextOrder = roomSortOrder === 'asc' ? 'desc' : 'asc';
    const orderedIds = [...rooms]
      .sort((a, b) =>
        nextOrder === 'asc'
          ? a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' })
          : b.name.localeCompare(a.name, 'pt-BR', { numeric: true, sensitivity: 'base' }),
      )
      .map((room) => room.id);
    setRoomSortOrder(nextOrder);
    try {
      await reorderRooms(orderedIds);
      refetchRooms();
    } catch (error) {
      toast.error(t('admin.rooms.toast.sortError'));
    }
  };

  const sortedDropdownCampers = useMemo(
    () =>
      [...dropdownCampers].sort((a, b) =>
        a.personalInformation.name.localeCompare(b.personalInformation.name),
      ),
    [dropdownCampers],
  );

  const tableInstance = useTable({ columns, data: dropdownCampers }, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const generateAggregateExcel = () => {
    const rows = dropdownCampers.map((camper) => ({
      Nome: camper.personalInformation.name,
      Agregados: camper.contact.aggregate ? camper.contact.aggregate.split('|').join(', ') : 'Nenhum agregado',
      Gênero: camper.personalInformation.gender,
      'Data de Nascimento': camper.personalInformation.birthday,
    }));

    downloadSingleSheet({ filename: 'agregados.xlsx', sheetName: 'Agregados', rows });
  };

  const generateRoomExcel = () => {
    const rows = rooms.map((room) => ({
      Quarto: room.name,
      Inscritos: room.campers.map((camper) => camper.name).join(', '),
    }));

    downloadSingleSheet({ filename: 'quartos.xlsx', sheetName: 'Quartos', rows });
  };

  const roomStats = useMemo(() => {
    const totalRooms = rooms.length;
    const totalCampers = rooms.reduce((sum, room) => sum + (room.campers?.length || 0), 0);
    const emptyRooms = rooms.filter((room) => !room.campers || room.campers.length === 0).length;
    const average = totalRooms > 0 ? (totalCampers / totalRooms).toFixed(1) : '0';

    return [
      { label: t('admin.rooms.stats.rooms'), value: totalRooms },
      { label: t('admin.rooms.stats.allocated'), value: totalCampers, tone: 'accent' },
      { label: t('admin.rooms.stats.emptyRooms'), value: emptyRooms, tone: emptyRooms > 0 ? 'danger' : 'free' },
      { label: t('admin.rooms.stats.avgPerRoom'), value: average, tone: 'info' },
    ];
  }, [rooms, t]);

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'aggregate-excel',
      name: t('admin.rooms.toolbar.downloadAggregateReport'),
      onClick: generateAggregateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'room-excel',
      name: t('admin.rooms.toolbar.downloadRoomReport'),
      onClick: generateRoomExcel,
      typeButton: 'teal-blue',
      typeIcon: 'excel',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--rooms rooms">
      <AdminSubpageHeader
        sessionKey="quartos"
        username={loggedUsername}
        title={t('admin.rooms.title')}
        subtitle={t('admin.rooms.subtitle')}
        typeIcon="rooms"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={roomStats} />

        <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>{t('admin.rooms.aggregatesList')}</Accordion.Header>
          <Accordion.Body>
            <Table striped bordered hover responsive className="custom-table mt-3" {...getTableProps()}>
              <thead>
                {headerGroups.map((headerGroup) => {
                  const { key: headerGroupKey, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                  return (
                    <tr key={headerGroupKey} {...restHeaderGroupProps}>
                      {headerGroup.headers.map((column) => {
                        const { key: columnKey, ...restColumnProps } = column.getHeaderProps(
                          column.getSortByToggleProps(),
                        );
                        return (
                          <th key={columnKey} {...restColumnProps} className="table-cells-header">
                            <div className="d-flex justify-content-between align-items-center">
                              {column.render('Header')}
                              <span className="sort-icon-wrapper">
                                <Icons className="sort-icon" typeIcon="sort" iconSize={20} fill="#fff" />
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  );
                })}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-start text-secondary p-4">
                      {t('admin.rooms.noUsersWithAggregates')}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    prepareRow(row);
                    const { key: rowKey, ...restRowProps } = row.getRowProps();
                    return (
                      <tr key={rowKey} {...restRowProps}>
                        {row.cells.map((cell) => {
                          const { key: cellKey, ...restCellProps } = cell.getCellProps();
                          return (
                            <td key={cellKey} {...restCellProps}>
                              {cell.render('Cell')}
                            </td>
                          );
                        })}
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
        <Button variant="teal-blue" onClick={handleOpenModal} className="mb-3 d-flex align-items-center" size="lg">
          <Icons typeIcon="plus" iconSize={20} fill="#fff" />
          &nbsp;{t('admin.rooms.addNewRoom')}
        </Button>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="outline-teal-blue" onClick={persistAlphabeticalOrder}>
          <Icons typeIcon="sort" iconSize={18} fill="#007185" />
          &nbsp; {t('admin.rooms.sortRooms', { order: roomSortOrder === 'asc' ? 'A ⭢ Z' : 'Z ⭢ A' })}
        </Button>
      </div>

      <Accordion className="mb-4" defaultActiveKey="1">
        {rooms.map((room, index) => (
          <Accordion.Item
            eventKey={room.id}
            key={room.id}
            className={[
              dragIndex === index ? 'is-dragging' : '',
              dragOverIndex === index && dragIndex !== null && dragIndex !== index ? 'is-drop-target' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onDragOver={handleRoomDragOver(index)}
            onDrop={handleRoomDrop(index)}
            onDragEnd={handleRoomDragEnd}
          >
            <Accordion.Header>
              <span
                className="rooms-reorder"
                draggable
                title={t('admin.rooms.dragToReorder')}
                style={{ cursor: 'grab' }}
                onClick={(e) => e.stopPropagation()}
                onDragStart={handleRoomDragStart(index)}
                onDragEnd={handleRoomDragEnd}
              >
                <span className="rooms-reorder__handle" aria-hidden="true">
                  ⠿
                </span>
              </span>
              <span className="rooms-reorder-name">{room.name}</span>
            </Accordion.Header>
            <Accordion.Body>
              <div className="p-3 rounded shadow-sm bg-light mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="d-flex align-items-center">
                    <Badge bg="teal-blue" className="px-3 py-2">
                      {t('admin.rooms.members', { count: room.campers?.length || 0 })}
                    </Badge>
                  </div>

                  <div className="table-action-cell">
                    <ActionButton action="edit" iconSize={18} onClick={() => handleShowEditModal(room)}>
                      {t('admin.rooms.rename')}
                    </ActionButton>
                    <ActionButton action="delete" iconSize={18} onClick={() => handleShowDeleteModal(room)}>
                      {t('admin.rooms.delete')}
                    </ActionButton>
                  </div>
                </div>

                <Form.Select
                  size="sm"
                  defaultValue=""
                  onChange={(e) => setSelectedCamper((prev) => ({ ...prev, [room.id]: e.target.value }))}
                >
                  <option value="">{t('admin.rooms.selectCamper')}</option>
                  {sortedDropdownCampers
                    .filter((camper) => !Object.values(selectedCamper).includes(camper.id))
                    .map((camper) => (
                      <option key={camper.id} value={camper.id}>
                        {camper.personalInformation.name}
                        {camper.contact?.hasAggregate && camper.contact?.aggregate
                          ? t('admin.rooms.companionsSuffix', { aggregate: camper.contact.aggregate })
                          : ''}
                      </option>
                    ))}
                </Form.Select>

                <div className="text-end mt-3">
                  <Button
                    variant="outline-teal-blue"
                    size="sm"
                    onClick={() => handleAddCamperToRoom(room.id, room.name)}
                  >
                    <Icons typeIcon="add-person" iconSize={18} fill="#007185" />
                    &nbsp;{t('admin.rooms.addToRoom')}
                  </Button>
                </div>
              </div>

              {room.campers && room.campers.length > 0 && (
                <div className="p-3 rounded border bg-white">
                  <ul className="list-unstyled m-0">
                    {room.campers.map((camper, index) => (
                      <li key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <Badge size="sm" bg="teal-blue" className="me-2">
                          {camper.name}
                        </Badge>

                        <div className="table-action-cell">
                          <ActionButton
                            action="delete"
                            iconSize={16}
                            label={t('admin.rooms.removeFromRoom')}
                            onClick={() => handleShowDeleteCamperFromRoomModal(camper)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <CustomModal
        show={showModal}
        onHide={handleCloseModal}
        variant="confirm"
        icon="plus"
        title={t('admin.rooms.modalAddTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('admin.rooms.cancel')}
            </Button>
            <SpinnerButton variant="primary" className="btn-confirm" onClick={createRoom} loading={saving}>
              {t('admin.rooms.createRoom')}
            </SpinnerButton>
          </>
        }
      >
        <Form.Group controlId="newRoomName">
          <Form.Label>
            <b>{t('admin.rooms.roomNameLabel')}</b>
          </Form.Label>
          <Form.Control
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder={t('admin.rooms.roomNamePlaceholder')}
            size="lg"
          />
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        variant="cancel"
        title={t('admin.rooms.confirmDeleteTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseDeleteModal}>
              {t('admin.rooms.cancel')}
            </Button>
            <SpinnerButton variant="danger" className="btn-cancel" onClick={confirmDeleteRoom} loading={saving}>
              {t('admin.rooms.delete')}
            </SpinnerButton>
          </>
        }
      >
        <Trans i18nKey="admin.rooms.deleteRoomConfirm" components={{ b: <b /> }} values={{ name: roomToDelete?.name }} />
      </CustomModal>

      {roomToRename && (
        <CustomModal
          show={showEditModal}
          onHide={handleCloseEditModal}
          variant="confirm"
          icon="refresh"
          title={t('admin.rooms.renameRoomTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseEditModal}>
                {t('admin.rooms.cancel')}
              </Button>
              <SpinnerButton variant="success" className="btn-confirm" onClick={renameRoom} loading={saving}>
                {t('admin.rooms.save')}
              </SpinnerButton>
            </>
          }
        >
          <Form.Group controlId="renameRoom">
            <Form.Label>
              <b>{t('admin.rooms.newRoomNameLabel')}</b>
            </Form.Label>
            <Form.Control
              type="text"
              value={renamedRoomName}
              onChange={(e) => setRenamedRoomName(e.target.value)}
              size="lg"
            />
          </Form.Group>
        </CustomModal>
      )}

      <CustomModal
        show={showDeleteCamperFromRoomModal}
        onHide={handleCloseDeleteCamperFromRoomModal}
        variant="cancel"
        title={t('admin.rooms.confirmDeleteTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseDeleteCamperFromRoomModal}>
              {t('admin.rooms.cancel')}
            </Button>
            <SpinnerButton
              variant="danger"
              className="btn-cancel"
              onClick={() => deleteCamperFromRoom(camperToDelete)}
              loading={saving}
            >
              {t('admin.rooms.delete')}
            </SpinnerButton>
          </>
        }
      >
        <Trans
          i18nKey="admin.rooms.deleteCamperConfirm"
          components={{ b: <b /> }}
          values={{ name: camperToDelete?.name }}
        />
      </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminRooms.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminRooms;
