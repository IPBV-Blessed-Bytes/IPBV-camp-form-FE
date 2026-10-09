import { Fragment, useEffect, useState } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import {
  listAllWorkshops,
  getWorkshopSettings,
  updateWorkshopSettings,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getWorkshopRegistrations,
} from '@/services/workshops';
import { getApiErrorMessage } from '@/fetchers/helpers';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import ActionButton from '@/components/Global/ActionButton';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';

const emptyForm = {
  title: '',
  description: '',
  sessionLabel: '',
  startsAt: '',
  endsAt: '',
  capacity: '',
  price: '',
  active: true,
  sortOrder: '',
};

const AdminWorkshopManagement = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [settings, setSettings] = useState({ workshopsEnabled: false, workshopMinChoices: '', workshopMaxChoices: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [registrations, setRegistrations] = useState({});
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  scrollUp();

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [listData, settingsData] = await Promise.all([listAllWorkshops(), getWorkshopSettings()]);
      const list = Array.isArray(listData?.workshops) ? listData.workshops : [];
      setWorkshops([...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      setSettings({
        workshopsEnabled: Boolean(settingsData?.workshopsEnabled),
        workshopMinChoices: settingsData?.workshopMinChoices ?? '',
        workshopMaxChoices: settingsData?.workshopMaxChoices ?? '',
      });
    } catch (error) {
      toast.error(t('admin.workshops.fetchError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateWorkshopSettings({
        workshopsEnabled: settings.workshopsEnabled,
        workshopMinChoices:
          settings.workshopMinChoices === '' || settings.workshopMinChoices == null
            ? null
            : Number(settings.workshopMinChoices),
        workshopMaxChoices:
          settings.workshopMaxChoices === '' || settings.workshopMaxChoices == null
            ? null
            : Number(settings.workshopMaxChoices),
      });
      toast.success(t('admin.workshops.settingsSaved'));
      registerLog('Atualizou configurações de oficinas', loggedUsername);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.workshops.settingsSaveError'));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setEditingWorkshop(null);
    setShowModal(true);
  };

  const handleEditClick = (workshop) => {
    setFormData({
      title: workshop.title || '',
      description: workshop.description || '',
      sessionLabel: workshop.sessionLabel || '',
      startsAt: workshop.startsAt || '',
      endsAt: workshop.endsAt || '',
      capacity: workshop.capacity ?? '',
      price: workshop.price ?? '',
      active: workshop.active ?? true,
      sortOrder: workshop.sortOrder ?? '',
    });
    setEditingWorkshop(workshop);
    setShowModal(true);
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    sessionLabel: formData.sessionLabel.trim(),
    startsAt: formData.startsAt || null,
    endsAt: formData.endsAt || null,
    capacity: formData.capacity === '' || formData.capacity == null ? null : Number(formData.capacity),
    price: formData.price === '' || formData.price == null ? 0 : Number(formData.price),
    active: formData.active,
    sortOrder: formData.sortOrder === '' || formData.sortOrder == null ? 0 : Number(formData.sortOrder),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t('admin.workshops.titleRequired'));
      return;
    }
    if (formData.startsAt && formData.endsAt && formData.endsAt <= formData.startsAt) {
      toast.error(t('admin.workshops.endAfterStart'));
      return;
    }
    setSaving(true);
    try {
      if (editingWorkshop) {
        await updateWorkshop(editingWorkshop.id, buildPayload());
        toast.success(t('admin.workshops.updateSuccess'));
        registerLog(`Editou oficina ${formData.title}`, loggedUsername);
      } else {
        await createWorkshop(buildPayload());
        toast.success(t('admin.workshops.createSuccess'));
        registerLog(`Criou oficina ${formData.title}`, loggedUsername);
      }
      setShowModal(false);
      setEditingWorkshop(null);
      setFormData(emptyForm);
      await fetchAll(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.workshops.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteWorkshop(workshopToDelete.id);
      toast.success(t('admin.workshops.deleteSuccess'));
      registerLog(`Excluiu oficina ${workshopToDelete.title}`, loggedUsername);
      setShowDeleteModal(false);
      await fetchAll(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.workshops.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const toggleRegistrations = async (workshop) => {
    if (expandedId === workshop.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(workshop.id);
    if (registrations[workshop.id]) return;
    setLoadingRegistrations(true);
    try {
      const data = await getWorkshopRegistrations(workshop.id);
      setRegistrations((prev) => ({ ...prev, [workshop.id]: data?.registrations || [] }));
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.workshops.registrationsError'));
      setExpandedId(null);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const activeCount = workshops.filter((w) => w.active).length;
  const seatsTaken = workshops.reduce((sum, w) => sum + Number(w.seatsTaken || 0), 0);
  const statItems = [
    { label: t('admin.workshops.statTotal'), value: workshops.length },
    { label: t('admin.workshops.statActive'), value: activeCount, tone: 'free' },
    { label: t('admin.workshops.statInactive'), value: workshops.length - activeCount, tone: 'used' },
    { label: t('admin.workshops.statSeatsTaken'), value: seatsTaken, tone: 'accent' },
  ];

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-workshop',
      name: t('admin.workshops.createButton'),
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
  ];

  const capacityLabel = (workshop) =>
    workshop.capacity == null
      ? t('admin.workshops.unlimited')
      : t('admin.workshops.seatsOf', { taken: workshop.seatsTaken || 0, capacity: workshop.capacity });

  return (
    <div className="admin-subpage admin-subpage--workshops">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.workshops.title')}
        subtitle={t('admin.workshops.subtitle')}
        typeIcon="notebook"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <SectionHeader title={t('admin.workshops.sectionSettings')} />
        <div className="admin-table-card workshops-settings">
          <Form>
            <Form.Check
              type="switch"
              id="workshops-enabled-switch"
              label={t('admin.workshops.enableSwitch')}
              checked={settings.workshopsEnabled}
              onChange={(e) => setSettings({ ...settings, workshopsEnabled: e.target.checked })}
            />
            <div className="workshops-settings__fields">
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.workshops.minChoices')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={settings.workshopMinChoices}
                  onChange={(e) => setSettings({ ...settings, workshopMinChoices: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.workshops.maxChoices')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={settings.workshopMaxChoices}
                  onChange={(e) => setSettings({ ...settings, workshopMaxChoices: e.target.value })}
                />
              </Form.Group>
            </div>
            <Form.Text className="text-secondary d-block mb-3">{t('admin.workshops.choicesHint')}</Form.Text>
            <SpinnerButton variant="teal-blue" onClick={saveSettings} loading={savingSettings}>
              {t('admin.workshops.saveSettings')}
            </SpinnerButton>
          </Form>
        </div>

        <SectionHeader title={t('admin.workshops.sectionWorkshops')} count={workshops.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.workshops.colTitle')}</th>
                <th className="table-cells-header">{t('admin.workshops.colSession')}</th>
                <th className="table-cells-header">{t('admin.workshops.colSchedule')}</th>
                <th className="table-cells-header">{t('admin.workshops.colSeats')}</th>
                <th className="table-cells-header">{t('admin.workshops.colPrice')}</th>
                <th className="table-cells-header">{t('admin.workshops.colStatus')}</th>
                <th className="table-cells-header">{t('admin.workshops.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {workshops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-start text-secondary p-4">
                    {t('admin.workshops.empty')}
                  </td>
                </tr>
              ) : (
                workshops.map((workshop) => (
                  <Fragment key={workshop.id}>
                    <tr>
                      <td>
                        <em>{workshop.title}</em>
                        {workshop.description && (
                          <div className="text-secondary small">{workshop.description}</div>
                        )}
                      </td>
                      <td>{workshop.sessionLabel || '—'}</td>
                      <td className="small">
                        {workshop.startsAt ? `${workshop.startsAt.replace('T', ' ')}` : '—'}
                        {workshop.endsAt ? ` → ${workshop.endsAt.replace('T', ' ')}` : ''}
                      </td>
                      <td>{capacityLabel(workshop)}</td>
                      <td>
                        {Number(workshop.price || 0) === 0
                          ? t('admin.workshops.freePrice')
                          : `R$ ${workshop.price}`}
                      </td>
                      <td>
                        {workshop.active ? (
                          <Badge bg="success">{t('admin.workshops.statusActive')}</Badge>
                        ) : (
                          <Badge bg="secondary">{t('admin.workshops.statusInactive')}</Badge>
                        )}
                      </td>
                      <td>
                        <div className="table-action-cell">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => toggleRegistrations(workshop)}
                          >
                            {t('admin.workshops.viewRegistrations')}
                          </Button>
                          <ActionButton
                            action="edit"
                            label={t('admin.workshops.editWorkshop')}
                            onClick={() => handleEditClick(workshop)}
                          />
                          <ActionButton
                            action="delete"
                            label={t('admin.workshops.deleteWorkshop')}
                            onClick={() => {
                              setWorkshopToDelete(workshop);
                              setShowDeleteModal(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedId === workshop.id && (
                      <tr>
                        <td colSpan={7} className="workshops-registrations">
                          {loadingRegistrations && !registrations[workshop.id] ? (
                            <p className="text-secondary mb-0">{t('admin.workshops.loadingRegistrations')}</p>
                          ) : (registrations[workshop.id] || []).length === 0 ? (
                            <p className="text-secondary mb-0">{t('admin.workshops.noRegistrations')}</p>
                          ) : (
                            <Table size="sm" borderless className="mb-0">
                              <thead>
                                <tr>
                                  <th>{t('admin.workshops.regName')}</th>
                                  <th>{t('admin.workshops.regCpf')}</th>
                                  <th>{t('admin.workshops.regStatus')}</th>
                                  <th>{t('admin.workshops.regEmail')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(registrations[workshop.id] || []).map((reg) => (
                                  <tr key={reg.registrationId}>
                                    <td>{reg.name || '—'}</td>
                                    <td>{reg.cpf || '—'}</td>
                                    <td>{reg.paymentStatus || '—'}</td>
                                    <td>{reg.userEmail || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          variant="confirm"
          icon={editingWorkshop ? 'edit' : 'plus'}
          iconFill={editingWorkshop ? '' : '#057c05'}
          title={editingWorkshop ? t('admin.workshops.editModalTitle') : t('admin.workshops.createModalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('admin.workshops.cancel')}
              </Button>
              <SpinnerButton
                className="btn-confirm"
                variant="primary"
                type="submit"
                onClick={handleSubmit}
                loading={saving}
              >
                {editingWorkshop ? t('admin.workshops.saveChanges') : t('admin.workshops.createWorkshop')}
              </SpinnerButton>
            </>
          }
        >
          <Form>
            <Form.Group controlId="workshopTitle">
              <Form.Label>
                <b>{t('admin.workshops.formTitle')}</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('admin.workshops.titlePlaceholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="lg"
              />
            </Form.Group>

            <Form.Group controlId="workshopDescription" className="mt-3">
              <Form.Label>
                <b>{t('admin.workshops.formDescription')}</b>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={t('admin.workshops.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="workshopSession" className="mt-3">
              <Form.Label>
                <b>{t('admin.workshops.formSession')}</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('admin.workshops.sessionPlaceholder')}
                value={formData.sessionLabel}
                onChange={(e) => setFormData({ ...formData, sessionLabel: e.target.value })}
              />
            </Form.Group>

            <div className="workshops-form__row mt-3">
              <Form.Group controlId="workshopStartsAt">
                <Form.Label>
                  <b>{t('admin.workshops.formStartsAt')}</b>
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="workshopEndsAt">
                <Form.Label>
                  <b>{t('admin.workshops.formEndsAt')}</b>
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                />
              </Form.Group>
            </div>

            <div className="workshops-form__row mt-3">
              <Form.Group controlId="workshopCapacity">
                <Form.Label>
                  <b>{t('admin.workshops.formCapacity')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder={t('admin.workshops.capacityPlaceholder')}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
                <Form.Text className="text-muted">{t('admin.workshops.capacityHint')}</Form.Text>
              </Form.Group>
              <Form.Group controlId="workshopPrice">
                <Form.Label>
                  <b>{t('admin.workshops.formPrice')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t('admin.workshops.pricePlaceholder')}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                <Form.Text className="text-muted">{t('admin.workshops.priceHint')}</Form.Text>
              </Form.Group>
            </div>

            <Form.Group controlId="workshopSortOrder" className="mt-3">
              <Form.Label>
                <b>{t('admin.workshops.formSortOrder')}</b>
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="workshopActive" className="mt-3">
              <Form.Check
                type="switch"
                label={t('admin.workshops.activeSwitch')}
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </CustomModal>

        <CustomModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          variant="cancel"
          title={t('admin.workshops.deleteModalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('admin.workshops.cancel')}
              </Button>
              <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDelete} loading={saving}>
                {t('admin.workshops.delete')}
              </SpinnerButton>
            </>
          }
        >
          <Trans
            i18nKey="admin.workshops.deleteConfirm"
            values={{ name: workshopToDelete?.title }}
            components={{ strong: <strong /> }}
          />
        </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminWorkshopManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminWorkshopManagement;
