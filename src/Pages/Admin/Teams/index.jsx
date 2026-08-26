import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Table, Accordion, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { downloadMultiSheet } from '@/utils/excelExport';
import PropTypes from 'prop-types';
import './style.scss';
import {
  listTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  assignCamperToTeam,
  removeCamperFromTeam,
} from '@/services/teams';
import { useWristbandsList } from '@/hooks/useWristbandsList';
import { useCampersList } from '@/hooks/useCampersList';
import { registerLog } from '@/services/logs';
import Icons from '@/components/Global/Icons';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';

const AdminTeams = ({ loggedUsername }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const { wristbands } = useWristbandsList();
  const [showRemoveCamperModal, setShowRemoveCamperModal] = useState(false);
  const [showAddCamperModal, setShowAddCamperModal] = useState(false);
  const [showRemoveTeamModal, setShowRemoveTeamModal] = useState(false);
  const [selectedCampersIds, setSelectedCampersIds] = useState([]);
  const [selectedCamperId, setSelectedCamperId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { campers, isLoading: loadingCampers, refetch: refetchCampers } = useCampersList();
  const [selectedTeamToRemove, setSelectedTeamToRemove] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    wristbandId: '',
  });
  const [search, setSearch] = useState('');
  const [camperSearch, setCamperSearch] = useState('');

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const data = await listTeams();
      setTeams(data || []);
    } catch (error) {
      toast.error('Erro ao carregar times');
      console.error(error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const teamWristbands = useMemo(
    () => wristbands.filter((wristband) => wristband.type === 'TEAM' && wristband.active),
    [wristbands],
  );

  useEffect(() => {
    fetchTeams();
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
        await updateTeam(editTeam.id, payload);
        toast.success('Time atualizado com sucesso');
        registerLog(`Editou o time "${editTeam.name}"`, loggedUsername);
      } else {
        await createTeam(payload);
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

      await assignCamperToTeam(payload);

      toast.success('Acampantes adicionados ao time');
      registerLog(`Adicionou ${selectedCampersIds.length} acampantes ao time ${selectedTeam.name}`, loggedUsername);

      setSelectedCampersIds([]);
      setSelectedTeam(null);
      setShowAddCamperModal(false);

      fetchTeams();
      refetchCampers();
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

      await removeCamperFromTeam(selectedCamperId);

      fetchTeams();
      refetchCampers();

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
        await Promise.all(selectedTeamToRemove.campers.map((camper) => removeCamperFromTeam(camper.id)));
      }

      await deleteTeam(selectedTeamToRemove.id);

      toast.success('Time removido com sucesso');
      registerLog(`Removeu o time "${selectedTeamToRemove.name}"`, loggedUsername);

      fetchTeams();
      refetchCampers();

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

  const availableCampers = useMemo(
    () =>
      campers
        .filter(
          (camper) => !camper.teamColor || camper.teamColor === '' || !camper.teamName || camper.teamName === '',
        )
        .sort((a, b) =>
          (a.personalInformation?.name || '').localeCompare(b.personalInformation?.name || '', 'pt-BR', {
            sensitivity: 'base',
          }),
        ),
    [campers],
  );

  const wristbandColorMap = useMemo(
    () =>
      teamWristbands.reduce((acc, wristband) => {
        acc[wristband.label] = wristband.color;
        return acc;
      }, {}),
    [teamWristbands],
  );

  const getTeamColor = useCallback(
    (team) => {
      if (team.wristbandColor?.startsWith('#')) {
        return team.wristbandColor;
      }

      return wristbandColorMap[team.wristbandColor] || '#ccc';
    },
    [wristbandColorMap],
  );

  const generateExcel = () => {
    const sheets = teams.map((team) => {
      const campers = team.campers || [];
      const campersCount = Number(team.campersCount ?? campers.length ?? 0);

      const rows = [['Acampantes', 'Qtd. Acampantes']];

      if (campers.length) {
        rows.push([campers[0]?.name || '', campersCount]);
        for (let i = 1; i < campers.length; i++) {
          rows.push([campers[i]?.name || '', '']);
        }
      } else {
        rows.push(['', campersCount]);
      }

      return { name: team.name || 'Time', rows, aoa: true };
    });

    downloadMultiSheet({ filename: 'times.xlsx', sheets });
  };

  const term = search.trim().toLowerCase();
  const filteredTeams = term
    ? teams.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(term) ||
          (t.campers || []).some((c) => (c.name || '').toLowerCase().includes(term)),
      )
    : teams;

  const totalAllocated = teams.reduce((s, t) => s + Number(t.campersCount ?? t.campers?.length ?? 0), 0);
  const biggestTeam = teams.reduce((m, t) => Math.max(m, Number(t.campersCount ?? 0)), 0);
  const statItems = [
    { label: 'Times', value: teams.length },
    { label: 'Acampantes alocados', value: totalAllocated, tone: 'free' },
    { label: 'Sem time', value: availableCampers.length, tone: 'used' },
    { label: 'Maior time', value: biggestTeam, tone: 'accent' },
  ];

  const camperTerm = camperSearch.trim().toLowerCase();
  const filteredAvailableCampers = camperTerm
    ? availableCampers.filter((c) => (c.personalInformation?.name || '').toLowerCase().includes(camperTerm))
    : availableCampers;

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'team-excel',
      name: 'Baixar Relatório Times',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'team-add',
      name: 'Criar Novo Time',
      onClick: () => handleOpenModal(),
      typeButton: 'teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--teams">
      <AdminSubpageHeader
        sessionKey="times"
        username={loggedUsername}
        title="Times"
        subtitle="Times e seus acampantes"
        typeIcon="team"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="teams-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por time ou acampante..." />
        </div>

        <SectionHeader title="Times" count={filteredTeams.length} />

        <div className="admin-table-card">
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
            {filteredTeams.map((team) => (
              <tr key={team.id}>
                <td>{team.name}</td>

                <td>
                  <span className="team-wristband-chip">
                    <span className="team-wristband-chip__dot" style={{ backgroundColor: getTeamColor(team) }} />
                    {team.wristbandColor}
                  </span>
                </td>
                <td>
                  <Badge bg="teal-blue">{team.campersCount ?? team.campers?.length ?? 0}</Badge>
                </td>
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
        </div>

      <CustomModal
        show={showModal}
        onHide={handleCloseModal}
        variant="confirm"
        icon={editTeam ? 'edit' : 'plus'}
        iconFill={editTeam ? '' : '#057c05'}
        title={editTeam ? 'Editar Time' : 'Criar Novo Time'}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" className="btn-confirm" onClick={handleSubmit}>
              {editTeam ? 'Salvar Alterações' : 'Criar Time'}
            </Button>
          </>
        }
      >
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
                  className="color-swatch color-swatch--sm"
                  style={{
                    backgroundColor: teamWristbands.find((w) => w.id === Number(formData.wristbandId))?.color,
                  }}
                />
                <small className="text-muted">Cor da pulseira selecionada</small>
              </div>
            )}
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={showAddCamperModal}
        onHide={() => setShowAddCamperModal(false)}
        variant="confirm"
        icon="plus"
        title="Adicionar Acampante"
        centered={false}
        footer={
          <>
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
          </>
        }
      >
        <Form.Group className="mb-3">
          <Form.Label>
            <b>Acampantes:</b>
          </Form.Label>

          <SearchBox value={camperSearch} onChange={setCamperSearch} placeholder="Buscar acampante..." />

          <div className="camper-checklist">
            {loadingCampers ? (
              <small className="text-muted">Buscando lista de acampantes...</small>
            ) : filteredAvailableCampers.length ? (
              filteredAvailableCampers.map((camper) => {
                const id = String(camper.id);
                const checked = selectedCampersIds.includes(id);
                return (
                  <label key={camper.id} className={`camper-check ${checked ? 'is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSelectedCampersIds((prev) =>
                          e.target.checked ? [...prev, id] : prev.filter((x) => x !== id),
                        )
                      }
                    />
                    <span className="camper-check__info">
                      <span className="camper-check__name">
                        {camper.personalInformation?.name || 'Sem nome'}
                      </span>
                      {camper.personalInformation?.cpf && (
                        <span className="camper-check__cpf">{camper.personalInformation.cpf}</span>
                      )}
                    </span>
                  </label>
                );
              })
            ) : (
              <small className="text-muted">Nenhum acampante disponível</small>
            )}
          </div>

          {selectedCampersIds.length > 0 && (
            <small className="text-success">{selectedCampersIds.length} selecionado(s)</small>
          )}
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={showRemoveCamperModal}
        onHide={() => setShowRemoveCamperModal(false)}
        variant="cancel"
        title="Excluir Acampante"
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRemoveCamperModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmRemoveCamper}>
              Remover
            </Button>
          </>
        }
      >
        <p>Deseja realmente remover este acampante do time?</p>
      </CustomModal>

      <CustomModal
        show={showRemoveTeamModal}
        onHide={handleCloseRemoveTeamModal}
        variant="cancel"
        title="Excluir Time"
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRemoveTeamModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmRemoveTeam}>
              Excluir
            </Button>
          </>
        }
      >
        <p>
          Deseja realmente remover o time <b>{selectedTeamToRemove?.name}</b>?
        </p>
      </CustomModal>

        <Loading loading={loading || loadingTeams} />
      </div>
    </div>
  );
};

AdminTeams.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminTeams;
