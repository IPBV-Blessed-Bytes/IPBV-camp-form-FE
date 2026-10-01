import { useState } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import {
  createWristband,
  updateWristband,
  deleteWristband,
} from '@/services/wristbands';
import { registerLog } from '@/services/logs';
import { useWristbandsList } from '@/hooks/useWristbandsList';
import scrollUp from '@/hooks/useScrollUp';
import { FOOD_NAME_OPTIONS } from '@/utils/constants';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';

const AdminWristbandsManagement = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const { wristbands, isLoading: loadingWristbands, refetch: refetchWristbands } = useWristbandsList();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    type: '',
    label: '',
    color: '#000000',
    active: true,
  });
  const [editingWristband, setEditingWristband] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wristbandToDelete, setWristbandToDelete] = useState(null);

  scrollUp();

  const validateForm = () => {
    const { type, label, color } = formData;

    if (!type || !label || !color) {
      toast.error(t('admin.wristbands.toast.allFieldsRequired'));
      return false;
    }

    if (type === 'FOOD') {
      const duplicatedFood = wristbands.find(
        (band) =>
          band.type === 'FOOD' && band.label === label && (!editingWristband || band.id !== editingWristband.id),
      );

      if (duplicatedFood) {
        toast.error(t('admin.wristbands.toast.duplicateFood', { label }));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingWristband) {
        await updateWristband(editingWristband.id, formData);
        toast.success(t('admin.wristbands.toast.wristbandUpdated'));
        registerLog(`Editou pulseira ${formData.label}`, loggedUsername);
      } else {
        await createWristband(formData);
        toast.success(t('admin.wristbands.toast.wristbandCreated'));
        registerLog(`Criou pulseira ${formData.label}`, loggedUsername);
      }

      setFormData({ type: '', label: '', color: '#000000', active: true });
      setEditingWristband(null);
      setShowModal(false);
      refetchWristbands();
    } catch (error) {
      toast.error(t('admin.wristbands.toast.wristbandSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteWristband(wristbandToDelete.id);
      toast.success(t('admin.wristbands.toast.wristbandRemoved'));
      registerLog(`Removeu pulseira ${wristbandToDelete.label}`, loggedUsername);
      refetchWristbands();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error(t('admin.wristbands.toast.wristbandRemoveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({ type: '', label: '', color: '#000000', active: true });
    setEditingWristband(null);
    setShowModal(true);
  };

  const handleEditClick = (wristband) => {
    setFormData(wristband);
    setEditingWristband(wristband);
    setShowModal(true);
  };

  const handleDeleteClick = (wristband) => {
    setWristbandToDelete(wristband);
    setShowDeleteModal(true);
  };

  const activeCount = wristbands.filter((b) => b.active).length;
  const teamCount = wristbands.filter((b) => b.type === 'TEAM').length;
  const foodCount = wristbands.filter((b) => b.type === 'FOOD').length;
  const statItems = [
    { label: t('admin.wristbands.stats.wristbands'), value: wristbands.length },
    { label: t('admin.wristbands.stats.active'), value: activeCount, tone: 'free' },
    { label: t('admin.wristbands.stats.inactive'), value: wristbands.length - activeCount, tone: 'used' },
    { label: t('admin.wristbands.stats.teams'), value: teamCount, tone: 'accent' },
    { label: t('admin.wristbands.stats.food'), value: foodCount, tone: 'info' },
  ];
  const typeChips = [
    { value: 'all', label: t('admin.wristbands.chips.all'), count: wristbands.length },
    { value: 'TEAM', label: t('admin.wristbands.chips.team'), count: teamCount },
    { value: 'FOOD', label: t('admin.wristbands.chips.food'), count: foodCount },
  ];
  const term = search.trim().toLowerCase();
  const filtered = wristbands.filter(
    (b) => (typeFilter === 'all' || b.type === typeFilter) && (!term || (b.label || '').toLowerCase().includes(term)),
  );

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-wristband',
      name: t('admin.wristbands.createWristband'),
      onClick: handleCreateClick,
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--wristbands">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.wristbands.title')}
        subtitle={t('admin.wristbands.subtitle')}
        typeIcon="wristband"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="wristbands-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.wristbands.searchPlaceholder')} />
          <FilterChips options={typeChips} value={typeFilter} onChange={setTypeFilter} />
        </div>

        <SectionHeader title={t('admin.wristbands.sectionTitle')} count={filtered.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.wristbands.columns.type')}</th>
                <th className="table-cells-header">{t('admin.wristbands.columns.name')}</th>
                <th className="table-cells-header">{t('admin.wristbands.columns.color')}</th>
                <th className="table-cells-header">{t('admin.wristbands.columns.status')}</th>
                <th className="table-cells-header">{t('admin.wristbands.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-start text-secondary p-4">
                    {t('admin.wristbands.empty')}
                  </td>
                </tr>
              ) : (
                filtered.map((band) => (
                <tr key={band.id}>
                  <td>
                    <Badge bg={band.type === 'FOOD' ? 'warning' : 'primary'} text={band.type === 'FOOD' ? 'dark' : undefined}>
                      {band.type === 'FOOD' ? t('admin.wristbands.badgeFood') : t('admin.wristbands.badgeTeam')}
                    </Badge>
                  </td>
                  <td>{band.label}</td>
                  <td>
                    <span className="wristband-color-chip">
                      <span className="wristband-color-chip__dot" style={{ background: band.color }} />
                      {band.color}
                    </span>
                  </td>
                  <td>
                    <Badge bg={band.active ? 'success' : 'secondary'}>{band.active ? t('admin.wristbands.statusActive') : t('admin.wristbands.statusInactive')}</Badge>
                  </td>
                  <td>
                    <div className="table-action-cell">
                      <ActionButton action="edit" label={t('admin.wristbands.editWristband')} onClick={() => handleEditClick(band)} />
                      <ActionButton action="delete" label={t('admin.wristbands.deleteWristband')} onClick={() => handleDeleteClick(band)} />
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </Table>
        </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="confirm"
        icon={editingWristband ? 'edit' : 'plus'}
        iconFill={editingWristband ? '' : '#057c05'}
        title={editingWristband ? t('admin.wristbands.editTitle') : t('admin.wristbands.createTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('admin.wristbands.cancel')}
            </Button>
            <SpinnerButton className="btn-confirm" variant="primary" onClick={handleSubmit} loading={saving}>
              {editingWristband ? t('admin.wristbands.saveChanges') : t('admin.wristbands.createWristbandBtn')}
            </SpinnerButton>
          </>
        }
      >
        <Form>
            <Form.Group>
              <Form.Label>
                <b>{t('admin.wristbands.typeLabel')}</b>
              </Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, label: '' })}
              >
                <option disabled value="">
                  {t('admin.wristbands.selectOption')}
                </option>
                <option value="TEAM">{t('admin.wristbands.typeTeam')}</option>
                <option value="FOOD">{t('admin.wristbands.typeFood')}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>{t('admin.wristbands.nameLabel')}</b>
              </Form.Label>

              {formData.type === 'FOOD' ? (
                <Form.Select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                >
                  <option value="" disabled>
                    {t('admin.wristbands.selectOption')}
                  </option>
                  {FOOD_NAME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  placeholder={t('admin.wristbands.namePlaceholder')}
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              )}
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>{t('admin.wristbands.colorLabel')}</b>
              </Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="color"
                  className="color-input"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />

                <Form.Control
                  type="text"
                  placeholder="#000000"
                  value={formData.color}
                  maxLength={7}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Check
                checked={formData.active}
                className="d-flex justify-content-end gap-2"
                label={t('admin.wristbands.activeSwitch')}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                type="switch"
              />
            </Form.Group>
          </Form>
      </CustomModal>

      <CustomModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        variant="cancel"
        title={t('admin.wristbands.confirmDeleteTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('admin.wristbands.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleDelete} loading={saving}>
              {t('admin.wristbands.delete')}
            </SpinnerButton>
          </>
        }
      >
        <Trans
          i18nKey="admin.wristbands.deleteConfirm"
          components={{ strong: <strong /> }}
          values={{ label: wristbandToDelete?.label }}
        />
      </CustomModal>

        <Loading loading={loadingWristbands} />
      </div>
    </div>
  );
};

AdminWristbandsManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminWristbandsManagement;
