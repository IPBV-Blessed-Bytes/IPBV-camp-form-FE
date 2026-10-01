import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Table, Accordion, Badge } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';
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
  randomAssignTeams,
} from '@/services/teams';
import { useWristbandsList } from '@/hooks/useWristbandsList';
import { useParticipantsList } from '@/hooks/useParticipantsList';
import { registerLog } from '@/services/logs';
import ActionButton from '@/components/Global/ActionButton';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';

const AdminTeams = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const { wristbands } = useWristbandsList();
  const [showRemoveCamperModal, setShowRemoveCamperModal] = useState(false);
  const [showAddCamperModal, setShowAddCamperModal] = useState(false);
  const [showRemoveTeamModal, setShowRemoveTeamModal] = useState(false);
  const [randomOpen, setRandomOpen] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const [randomMode, setRandomMode] = useState('all');
  const [selectedCampersIds, setSelectedCampersIds] = useState([]);
  const [selectedCamperId, setSelectedCamperId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { campers, isLoading: loadingCampers, refetch: refetchCampers } = useParticipantsList();
  const [selectedTeamToRemove, setSelectedTeamToRemove] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    wristbandId: '',
  });
  const [search, setSearch] = useState('');
  const [camperSearch, setCamperSearch] = useState('');

  const fetchTeams = async (silent = false) => {
    try {
      if (!silent) setLoadingTeams(true);
      const data = await listTeams();
      setTeams(data || []);
    } catch (error) {
      toast.error(t('admin.teams.toast.loadError'));
      console.error(error);
    } finally {
      if (!silent) setLoadingTeams(false);
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
      setSaving(true);
      const payload = buildPayload();

      if (editTeam) {
        await updateTeam(editTeam.id, payload);
        toast.success(t('admin.teams.toast.teamUpdated'));
        registerLog(`Editou o time "${editTeam.name}"`, loggedUsername);
      } else {
        await createTeam(payload);
        toast.success(t('admin.teams.toast.teamCreated'));
        registerLog(`Criou o time "${payload.name}"`, loggedUsername);
      }

      handleCloseModal();
      await fetchTeams(true);
    } catch (error) {
      toast.error(t('admin.teams.toast.teamSaveError'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addCampersToTeam = async () => {
    if (!selectedCampersIds.length || !selectedTeam) return;

    try {
      setSaving(true);

      const payload = {
        campers: selectedCampersIds.map((id) => ({
          id: Number(id),
          teamName: selectedTeam?.name || '',
          teamColor: selectedTeam?.wristbandColor || '',
        })),
      };

      await assignCamperToTeam(payload);

      toast.success(t('admin.teams.toast.campersAdded'));
      registerLog(`Adicionou ${selectedCampersIds.length} inscritos ao time ${selectedTeam.name}`, loggedUsername);

      setSelectedCampersIds([]);
      setSelectedTeam(null);
      setShowAddCamperModal(false);

      await fetchTeams(true);
      refetchCampers();
    } catch (error) {
      toast.error(t('admin.teams.toast.campersAddError'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmRemoveCamper = async () => {
    if (!selectedCamperId) return;

    try {
      setSaving(true);

      await removeCamperFromTeam(selectedCamperId);

      await fetchTeams(true);
      refetchCampers();

      toast.success(t('admin.teams.toast.camperRemoved'));
      registerLog(`Removeu o inscrito ${selectedCamperId} de um time`, loggedUsername);

      setShowRemoveCamperModal(false);
    } catch (error) {
      toast.error(t('admin.teams.toast.camperRemoveError'));
      console.error(error);
    } finally {
      setSaving(false);
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
      setSaving(true);

      if (selectedTeamToRemove.campers?.length) {
        await Promise.all(selectedTeamToRemove.campers.map((camper) => removeCamperFromTeam(camper.id)));
      }

      await deleteTeam(selectedTeamToRemove.id);

      toast.success(t('admin.teams.toast.teamRemoved'));
      registerLog(`Removeu o time "${selectedTeamToRemove.name}"`, loggedUsername);

      await fetchTeams(true);
      refetchCampers();

      setShowRemoveTeamModal(false);
      setSelectedTeamToRemove(null);
    } catch (error) {
      toast.error(t('admin.teams.toast.teamRemoveError'));
      console.error(error);
    } finally {
      setSaving(false);
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

      const rows = [['Inscritos', 'Qtd. Inscritos']];

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
    { label: t('admin.teams.stats.teams'), value: teams.length },
    { label: t('admin.teams.stats.allocated'), value: totalAllocated, tone: 'free' },
    { label: t('admin.teams.stats.withoutTeam'), value: availableCampers.length, tone: 'used' },
    { label: t('admin.teams.stats.biggestTeam'), value: biggestTeam, tone: 'accent' },
  ];

  const camperTerm = camperSearch.trim().toLowerCase();
  const filteredAvailableCampers = camperTerm
    ? availableCampers.filter((c) => (c.personalInformation?.name || '').toLowerCase().includes(camperTerm))
    : availableCampers;

  const openRandomModal = (mode) => {
    setRandomMode(mode);
    setRandomOpen(true);
  };

  const handleRandomAssign = async () => {
    const onlyUnassigned = randomMode === 'remaining';
    setRandomizing(true);
    try {
      const result = await randomAssignTeams(onlyUnassigned);
      registerLog(
        onlyUnassigned ? 'Alocou os inscritos sem time' : 'Sorteou os times aleatoriamente',
        loggedUsername,
      );
      toast.success(
        onlyUnassigned
          ? t('admin.teams.toast.randomRemainingResult', { assigned: result.assigned, teams: result.teams })
          : t('admin.teams.toast.randomAllResult', { assigned: result.assigned, teams: result.teams }),
      );
      setRandomOpen(false);
      await fetchTeams(true);
      refetchCampers();
    } catch (error) {
      toast.error(t('admin.teams.toast.randomError'));
    } finally {
      setRandomizing(false);
    }
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'team-excel',
      name: t('admin.teams.toolbar.downloadReport'),
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#007185',
      iconSize: 22,
      id: 'team-random',
      name: t('admin.teams.toolbar.randomAll'),
      onClick: () => openRandomModal('all'),
      typeButton: 'outline-teal-blue',
      typeIcon: 'person',
    },
    {
      fill: '#007185',
      iconSize: 22,
      id: 'team-random-remaining',
      name: t('admin.teams.toolbar.randomRemaining'),
      onClick: () => openRandomModal('remaining'),
      typeButton: 'outline-teal-blue',
      typeIcon: 'add-person',
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'team-add',
      name: t('admin.teams.toolbar.createTeam'),
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
        title={t('admin.teams.title')}
        subtitle={t('admin.teams.subtitle')}
        typeIcon="team"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="teams-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.teams.searchPlaceholder')} />
        </div>

        <SectionHeader title={t('admin.teams.sectionTitle')} count={filteredTeams.length} />

        <div className="admin-table-card">
          <div className="table-responsive">
            <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">{t('admin.teams.columns.teamName')}</th>
              <th className="table-cells-header">{t('admin.teams.columns.wristbandColor')}</th>
              <th className="table-cells-header">{t('admin.teams.columns.quantity')}</th>
              <th className="table-cells-header">{t('admin.teams.columns.campers')}</th>
              <th className="table-cells-header">{t('admin.teams.columns.actions')}</th>
            </tr>
          </thead>

          <tbody>
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-start text-secondary p-4">
                  {t('admin.teams.empty')}
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
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
                      <Accordion.Header>{t('admin.teams.showCampers')}</Accordion.Header>

                      <Accordion.Body>
                        {team.campers?.length ? (
                          team.campers.map((camper) => (
                            <React.Fragment key={camper.id}>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>{camper.name}</span>

                                <div className="table-action-cell">
                                  <ActionButton
                                    action="delete"
                                    label={t('admin.teams.removeCamper')}
                                    onClick={() => handleOpenRemoveCamperModal(camper.id)}
                                  />
                                </div>
                              </div>
                              <hr className="horizontal-line" />
                            </React.Fragment>
                          ))
                        ) : (
                          <small className="text-muted">{t('admin.teams.noCampers')}</small>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </td>
                <td>
                  <div className="table-action-cell">
                    <ActionButton
                      action="add"
                      label={t('admin.teams.addCamper')}
                      onClick={() => handleOpenAddCamperModal(team)}
                    />
                    <ActionButton action="edit" label={t('admin.teams.editTeam')} onClick={() => handleOpenModal(team)} />
                    <ActionButton
                      action="delete"
                      label={t('admin.teams.removeTeam')}
                      onClick={() => {
                        setSelectedTeamToRemove(team);
                        setShowRemoveTeamModal(true);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))
            )}
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
        title={editTeam ? t('admin.teams.editTitle') : t('admin.teams.createTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('admin.teams.cancel')}
            </Button>
            <SpinnerButton variant="primary" className="btn-confirm" onClick={handleSubmit} loading={saving}>
              {editTeam ? t('admin.teams.saveChanges') : t('admin.teams.createTeamBtn')}
            </SpinnerButton>
          </>
        }
      >
        <Form.Group className="mb-3">
            <Form.Label>
              <b>{t('admin.teams.teamNameLabel')}</b>
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
              <b>{t('admin.teams.teamWristbandLabel')}</b>
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
                {t('admin.teams.selectWristband')}
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
                <small className="text-muted">{t('admin.teams.selectedWristbandColor')}</small>
              </div>
            )}
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={showAddCamperModal}
        onHide={() => setShowAddCamperModal(false)}
        variant="confirm"
        icon="plus"
        title={t('admin.teams.addCamperTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddCamperModal(false)}>
              {t('admin.teams.cancel')}
            </Button>
            <SpinnerButton
              variant="primary"
              className="btn-confirm"
              onClick={addCampersToTeam}
              disabled={!selectedCampersIds.length}
              loading={saving}
            >
              {t('admin.teams.add')}
            </SpinnerButton>
          </>
        }
      >
        <Form.Group className="mb-3">
          <Form.Label>
            <b>{t('admin.teams.campersLabel')}</b>
          </Form.Label>

          <SearchBox value={camperSearch} onChange={setCamperSearch} placeholder={t('admin.teams.searchCamperPlaceholder')} />

          <div className="camper-checklist">
            {loadingCampers ? (
              <small className="text-muted">{t('admin.teams.loadingCampers')}</small>
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
                        {camper.personalInformation?.name || t('admin.teams.noName')}
                      </span>
                      {camper.personalInformation?.cpf && (
                        <span className="camper-check__cpf">{camper.personalInformation.cpf}</span>
                      )}
                    </span>
                  </label>
                );
              })
            ) : (
              <small className="text-muted">{t('admin.teams.noCampersAvailable')}</small>
            )}
          </div>

          {selectedCampersIds.length > 0 && (
            <small className="text-success">{t('admin.teams.selectedCount', { count: selectedCampersIds.length })}</small>
          )}
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={showRemoveCamperModal}
        onHide={() => setShowRemoveCamperModal(false)}
        variant="cancel"
        title={t('admin.teams.removeCamperTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRemoveCamperModal(false)}>
              {t('admin.teams.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleConfirmRemoveCamper} loading={saving}>
              {t('admin.teams.remove')}
            </SpinnerButton>
          </>
        }
      >
        <p>{t('admin.teams.removeCamperConfirm')}</p>
      </CustomModal>

      <CustomModal
        show={showRemoveTeamModal}
        onHide={handleCloseRemoveTeamModal}
        variant="cancel"
        title={t('admin.teams.removeTeamTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRemoveTeamModal(false)}>
              {t('admin.teams.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleConfirmRemoveTeam} loading={saving}>
              {t('admin.teams.delete')}
            </SpinnerButton>
          </>
        }
      >
        <p>
          <Trans
            i18nKey="admin.teams.removeTeamConfirm"
            components={{ b: <b /> }}
            values={{ name: selectedTeamToRemove?.name }}
          />
        </p>
      </CustomModal>

      <CustomModal
        show={randomOpen}
        onHide={() => setRandomOpen(false)}
        variant="confirm"
        title={randomMode === 'remaining' ? t('admin.teams.randomRemainingTitle') : t('admin.teams.randomAllTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRandomOpen(false)} disabled={randomizing}>
              {t('admin.teams.cancel')}
            </Button>
            <SpinnerButton variant="primary" className="btn-confirm" onClick={handleRandomAssign} loading={randomizing}>
              {randomMode === 'remaining' ? t('admin.teams.allocate') : t('admin.teams.drawAll')}
            </SpinnerButton>
          </>
        }
      >
        {randomMode === 'remaining' ? (
          <p>
            <Trans i18nKey="admin.teams.randomRemainingBody" components={{ b: <b /> }} values={{ count: teams.length }} />
          </p>
        ) : (
          <p>
            <Trans i18nKey="admin.teams.randomAllBody" components={{ b: <b /> }} values={{ count: teams.length }} />
          </p>
        )}
      </CustomModal>

        <Loading loading={loadingTeams} />
      </div>
    </div>
  );
};

AdminTeams.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminTeams;
