import React from 'react';
import { useEffect, useState } from 'react';
import { Container, Button, Form, Modal, Table, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';
import Icons from '@/components/Global/Icons';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Loading from '@/components/Global/Loading';
import Tools from '@/components/Admin/Header/Tools';

const AdminTeams = ({ loggedUsername }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingCampers, setLoadingCampers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [teamWristbands, setTeamWristbands] = useState([]);
  const [showRemoveCamperModal, setShowRemoveCamperModal] = useState(false);
  const [showAddCamperModal, setShowAddCamperModal] = useState(false);
  const [showRemoveTeamModal, setShowRemoveTeamModal] = useState(false);
  const [selectedCampersIds, setSelectedCampersIds] = useState([]);
  const [selectedCamperId, setSelectedCamperId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [campers, setCampers] = useState([]);
  const [selectedTeamToRemove, setSelectedTeamToRemove] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    wristbandId: '',
  });

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const { data } = await fetcher.get('/team');
      setTeams(data || []);
    } catch (error) {
      toast.error('Erro ao carregar times');
      console.error(error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchTeamWristbands = async () => {
    try {
      setLoading(true);
      const { data } = await fetcher.get('/user-wristbands');

      const onlyTeamWristbands = (data || []).filter((wristband) => wristband.type === 'TEAM' && wristband.active);

      setTeamWristbands(onlyTeamWristbands);
    } catch (error) {
      toast.error('Erro ao carregar pulseiras dos times');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampers = async () => {
    try {
      setLoadingCampers(true);

      const response = await fetcher.get('/camper', {
        params: { size: MAX_SIZE_CAMPERS },
      });

      const data = response?.data;

      const campersList = Array.isArray(data?.content) ? data.content : [];

      setCampers(campersList);
    } catch (error) {
      toast.error('Erro ao carregar acampantes');
      console.error(error);
      setCampers([]);
    } finally {
      setLoadingCampers(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchTeamWristbands();
    fetchCampers();
  }, []);

  const handleOpenModal = (team = null) => {
    setEditTeam(team);
    let wristbandId = '';

    if (team?.wristbandColor) {
      const matchedWristband = teamWristbands.find((wristband) => wristband.color === team.wristbandColor);

      wristbandId = matchedWristband?.id ?? '';
    }

    setFormData({
      name: team?.name || '',
      wristbandId,
    });

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTeam(null);
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    wristbandId: Number(formData.wristbandId),
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = buildPayload();

      if (editTeam) {
        await fetcher.patch(`/team/${editTeam.id}`, payload);
        toast.success('Time atualizado com sucesso');
        registerLog(`Editou o time "${editTeam.name}"`, loggedUsername);
      } else {
        await fetcher.post('/team', payload);
        toast.success('Time criado com sucesso');
        registerLog(`Criou o time "${payload.name}"`, loggedUsername);
      }

      handleCloseModal();
      fetchTeams();
    } catch (error) {
      toast.error('Erro ao salvar time');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addCampersToTeam = async () => {
    if (!selectedCampersIds.length || !selectedTeam) return;

    try {
      setLoading(true);

      const payload = {
        campers: selectedCampersIds.map((id) => ({
          id: Number(id),
          teamName: selectedTeam?.name || '',
          teamColor: selectedTeam?.wristbandColor || '',
        })),
      };

      await fetcher.patch('/team/camper', payload);

      toast.success('Acampantes adicionados ao time');
      registerLog(`Adicionou ${selectedCampersIds.length} acampantes ao time ${selectedTeam.name}`, loggedUsername);

      setSelectedCampersIds([]);
      setSelectedTeam(null);
      setShowAddCamperModal(false);

      fetchTeams();
      fetchCampers();
    } catch (error) {
      toast.error('Erro ao adicionar acampantes ao time');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRemoveCamper = async () => {
    if (!selectedCamperId) return;

    try {
      setLoading(true);

      await fetcher.delete(`/team/camper/${selectedCamperId}`);

      fetchTeams();
      fetchCampers();

      toast.success('Acampante removido do time');
      registerLog(`Removeu o acampante ${selectedCamperId} de um time`, loggedUsername);

      setShowRemoveCamperModal(false);
    } catch (error) {
      toast.error('Erro ao remover acampante do time');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddCamperModal = (team) => {
    setSelectedTeam(team);
    setSelectedCampersIds([]);
    setShowAddCamperModal(true);
  };

  const handleOpenRemoveCamperModal = (camperId) => {
    setSelectedCamperId(camperId);
    setShowRemoveCamperModal(true);
  };

  const handleConfirmRemoveTeam = async () => {
    if (!selectedTeamToRemove) return;

    try {
      setLoading(true);

      if (selectedTeamToRemove.campers?.length) {
        await Promise.all(selectedTeamToRemove.campers.map((camper) => fetcher.delete(`/team/camper/${camper.id}`)));
      }

      await fetcher.delete(`/team/${selectedTeamToRemove.id}`);

      toast.success('Time removido com sucesso');
      registerLog(`Removeu o time "${selectedTeamToRemove.name}"`, loggedUsername);

      fetchTeams();
      fetchCampers();

      setShowRemoveTeamModal(false);
      setSelectedTeamToRemove(null);
    } catch (error) {
      toast.error('Erro ao remover time');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRemoveTeamModal = () => {
    setShowRemoveTeamModal(false);
    setSelectedTeamToRemove(null);
  };

  const availableCampers = campers
    .filter((camper) => !camper.teamColor || camper.teamColor === '' || !camper.teamName || camper.teamName === '')
    .sort((a, b) =>
      (a.personalInformation?.name || '').localeCompare(b.personalInformation?.name || '', 'pt-BR', {
        sensitivity: 'base',
      }),
    );

  const wristbandColorMap = teamWristbands.reduce((acc, wristband) => {
    acc[wristband.label] = wristband.color;
    return acc;
  }, {});

  const getTeamColor = (team) => {
    if (team.wristbandColor?.startsWith('#')) {
      return team.wristbandColor;
    }

    return wristbandColorMap[team.wristbandColor] || '#ccc';
  };

  const generateExcel = () => {
    const rows = teams.map((team) => ({
      'Nome do Time': team.name,
      'Cor da Pulseira': team.wristbandColor || '-',
      'Qtd. Acampantes': Number(team.campersCount ?? team.campers?.length ?? 0),
      Acampantes: team.campers?.length ? team.campers.map((camper) => camper.name).join(', ') : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Times');
    XLSX.writeFile(workbook, 'times.xlsx');
  };

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center mb-3 mb-md-0',
      cols: { xs: 12, md: 6 },
      fill: '#007185',
      iconSize: 40,
      id: 'team-excel',
      name: 'Baixar Relatório Times',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      buttonClassName: 'w-100 h-100 py-3 btn-bw-3 d-flex flex-column align-items-center',
      cols: { xs: 12, md: 6 },
      fill: '#fff',
      iconSize: 40,
      id: 'team-add',
      name: 'Criar Novo Time',
      onClick: () => handleOpenModal(),
      typeButton: 'teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Times" sessionTypeIcon="team" iconSize={80} fill="#007185" />

      <Tools buttons={toolsButtons} />

      <div className="table-responsive">
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">Nome do Time:</th>
              <th className="table-cells-header">Cor da Pulseira:</th>
              <th className="table-cells-header">Quantidade:</th>
              <th className="table-cells-header">Acampantes:</th>
              <th className="table-cells-header">Ações:</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>{team.name}</td>

                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: getTeamColor(team),
                        borderRadius: 4,
                      }}
                    />
                    {team.wristbandColor}
                  </div>
                </td>
                <td>{team.campersCount}</td>
                <td>
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Mostrar Acampantes</Accordion.Header>

                      <Accordion.Body>
                        {team.campers?.length ? (
                          team.campers.map((camper) => (
                            <React.Fragment key={camper.id}>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>{camper.name}</span>

                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleOpenRemoveCamperModal(camper.id)}
                                >
                                  <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                                </Button>
                              </div>
                              <hr className="horizontal-line" />
                            </React.Fragment>
                          ))
                        ) : (
                          <small className="text-muted">Nenhum Acampante</small>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </td>
                <td>
                  <Button variant="outline-primary" className="me-2" onClick={() => handleOpenAddCamperModal(team)}>
                    <Icons typeIcon="plus" iconSize={20} fill="#0d6efd" />
                  </Button>

                  <Button variant="outline-success" className="me-2" onClick={() => handleOpenModal(team)}>
                    <Icons typeIcon="edit" iconSize={24} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      setSelectedTeamToRemove(team);
                      setShowRemoveTeamModal(true);
                    }}
                  >
                    <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal className="custom-modal" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon={editTeam ? 'edit' : 'plus'} iconSize={25} fill={editTeam ? '' : '#057c05'} />
            <b>{editTeam ? 'Editar Time' : 'Criar Novo Time'}</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>Nome do Time:</b>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              size="lg"
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <b>Pulseira do Time:</b>
            </Form.Label>

            <Form.Select
              size="lg"
              value={formData.wristbandId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  wristbandId: e.target.value,
                }))
              }
            >
              <option value="" disabled>
                Selecione uma pulseira
              </option>

              {teamWristbands.map((wristband) => (
                <option key={wristband.id} value={wristband.id}>
                  {wristband.label}
                </option>
              ))}
            </Form.Select>

            {formData.wristbandId && (
              <div className="d-flex align-items-center gap-2 mt-3">
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: teamWristbands.find((w) => w.id === Number(formData.wristbandId))?.color,
                  }}
                />
                <small className="text-muted">Cor da pulseira selecionada</small>
              </div>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleSubmit}>
            {editTeam ? 'Salvar Alterações' : 'Criar Time'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="custom-modal" show={showAddCamperModal} onHide={() => setShowAddCamperModal(false)}>
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="plus" iconSize={25} fill="#057c05" />
            <b>Adicionar Acampante</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>Acampante:</b>
            </Form.Label>

            <Form.Select
              disabled={loadingCampers}
              multiple
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
                setSelectedCampersIds(values);
              }}
              size="lg"
              value={selectedCampersIds}
            >
              {loadingCampers ? (
                <option disabled>Buscando lista de acampantes...</option>
              ) : availableCampers.length ? (
                availableCampers.map((camper) => (
                  <option key={camper.id} value={camper.id}>
                    {camper.personalInformation?.name || 'Sem nome'}
                  </option>
                ))
              ) : (
                <option disabled>Nenhum acampante disponível</option>
              )}
            </Form.Select>

            {selectedCampersIds.length > 0 && (
              <small className="text-success">{selectedCampersIds.length} selecionado(s)</small>
            )}
            <br />
            <small className="text-muted">Segure CTRL (ou CMD no Mac) para selecionar vários</small>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCamperModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="btn-confirm"
            onClick={addCampersToTeam}
            disabled={!selectedCampersIds.length}
          >
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="custom-modal" show={showRemoveCamperModal} onHide={() => setShowRemoveCamperModal(false)}>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Excluir Acampante</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Deseja realmente remover este acampante do time?</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveCamperModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmRemoveCamper}>
            Remover
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="custom-modal" show={showRemoveTeamModal} onHide={handleCloseRemoveTeamModal}>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Excluir Time</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Deseja realmente remover o time <b>{selectedTeamToRemove?.name}</b>?
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveTeamModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmRemoveTeam}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading || loadingTeams} />
    </Container>
  );
};

AdminTeams.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminTeams;
