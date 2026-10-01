import { useMemo, useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';

import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';

import useParticipantsData from '../Participants/hooks/useParticipantsData';
import SpinnerButton from '@/components/Global/SpinnerButton';

const BUS_TRANSPORTATIONS = ['Com Ônibus', 'Com Onibus', 'Ônibus Equipe', 'Onibus Equipe'];

const goesByBus = (camper) => BUS_TRANSPORTATIONS.includes(camper?.package?.transportationName);

const isTeamBus = (camper) => (camper?.package?.transportationName || '').toLowerCase().includes('equipe');

const EDIT_FIELDS = [
  { key: 'name', labelKey: 'admin.bus.fields.name', path: 'personalInformation' },
  { key: 'cpf', labelKey: 'admin.bus.fields.cpf', path: 'personalInformation' },
  { key: 'rg', labelKey: 'admin.bus.fields.rg', path: 'personalInformation' },
  { key: 'rgShipper', labelKey: 'admin.bus.fields.rgShipper', path: 'personalInformation' },
  { key: 'cellPhone', labelKey: 'admin.bus.fields.cellPhone', path: 'contact' },
  { key: 'birthday', labelKey: 'admin.bus.fields.birthday', path: 'personalInformation' },
];

const AdminBus = ({ loggedUsername, userRole }) => {
  const { t } = useTranslation();
  scrollUp();

  const { data, loading, saveEdit } = useParticipantsData({ loggedUsername });

  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState('all'); // 'all' | 'normal' | 'equipe'
  const [sortAsc, setSortAsc] = useState(true); // true = A→Z, false = Z→A
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null); // { camper, originalIndex }
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'collaborator';

  const allBus = useMemo(() => (data || []).filter(goesByBus), [data]);
  const equipeCount = useMemo(() => allBus.filter(isTeamBus).length, [allBus]);
  const normalCount = allBus.length - equipeCount;

  const busCampers = useMemo(() => {
    let list = (data || [])
      .map((camper, originalIndex) => ({ camper, originalIndex }))
      .filter(({ camper }) => goesByBus(camper));

    if (busFilter === 'equipe') list = list.filter(({ camper }) => isTeamBus(camper));
    else if (busFilter === 'normal') list = list.filter(({ camper }) => !isTeamBus(camper));

    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        ({ camper }) =>
          (camper.personalInformation?.name || '').toLowerCase().includes(term) ||
          (camper.personalInformation?.cpf || '').toLowerCase().includes(term),
      );
    }

    list = [...list].sort((a, b) => {
      const cmp = (a.camper.personalInformation?.name || '').localeCompare(
        b.camper.personalInformation?.name || '',
        'pt-BR',
      );
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [data, search, busFilter, sortAsc]);

  const busChips = [
    { value: 'all', label: t('admin.bus.chips.all'), count: allBus.length },
    { value: 'normal', label: t('admin.bus.chips.normal'), count: normalCount },
    { value: 'equipe', label: t('admin.bus.chips.equipe'), count: equipeCount },
  ];

  const statItems = [
    { label: t('admin.bus.stats.passengers'), value: allBus.length, tone: 'info' },
    { label: t('admin.bus.stats.normal'), value: normalCount, tone: 'accent' },
    { label: t('admin.bus.stats.equipe'), value: equipeCount, tone: 'used' },
  ];

  const toggleSort = () => setSortAsc((prev) => !prev);
  const sortLabel = sortAsc ? t('admin.bus.sortAsc') : t('admin.bus.sortDesc');

  const openEdit = ({ camper, originalIndex }) => {
    setEditing({ camper, originalIndex });
    setForm({
      name: camper.personalInformation?.name || '',
      cpf: camper.personalInformation?.cpf || '',
      rg: camper.personalInformation?.rg || '',
      rgShipper: camper.personalInformation?.rgShipper || '',
      cellPhone: camper.contact?.cellPhone || '',
      birthday: camper.personalInformation?.birthday || '',
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { camper, originalIndex } = editing;
    const editFormData = {
      ...camper,
      personalInformation: {
        ...camper.personalInformation,
        name: form.name,
        cpf: form.cpf,
        rg: form.rg,
        rgShipper: form.rgShipper,
        birthday: form.birthday,
      },
      contact: {
        ...camper.contact,
        cellPhone: form.cellPhone,
      },
    };
    const success = await saveEdit({ editFormData, editRowIndex: originalIndex });
    setSaving(false);
    if (success) setShowEditModal(false);
  };

  return (
    <div className="admin-subpage admin-subpage--bus">
      <AdminSubpageHeader
        sessionKey="onibus"
        username={loggedUsername}
        title={t('admin.bus.title')}
        subtitle={t('admin.bus.subtitle')}
        typeIcon="bus"
      />

      <div className="admin-subpage__content">
        <StatCards items={statItems} />

        <div className="bus-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.bus.searchPlaceholder')} />
          <div className="d-flex flex-grow-1 align-items-center gap-2 flex-wrap">
            <FilterChips options={busChips} value={busFilter} onChange={setBusFilter} />
            <Button variant="outline-teal-blue" className="bus-toolbar__sort ms-auto" onClick={toggleSort}>
              <Icons typeIcon="sort" iconSize={18} fill="#007185" />
              &nbsp;{sortLabel}
            </Button>
          </div>
        </div>

        <SectionHeader title={t('admin.bus.sectionTitle')} count={busCampers.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.bus.columns.name')}</th>
                <th className="table-cells-header">{t('admin.bus.columns.transport')}</th>
                <th className="table-cells-header">{t('admin.bus.columns.cpf')}</th>
                <th className="table-cells-header">{t('admin.bus.columns.rg')}</th>
                <th className="table-cells-header">{t('admin.bus.columns.rgShipper')}</th>
                <th className="table-cells-header">{t('admin.bus.columns.phone')}</th>
                <th className="table-cells-header">{t('admin.bus.columns.birthday')}</th>
                {canEdit && <th className="table-cells-header">{t('admin.bus.columns.actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {busCampers.map(({ camper, originalIndex }) => (
                <tr key={camper.id ?? originalIndex}>
                  <td>{camper.personalInformation?.name || '-'}</td>
                  <td>
                    <Badge bg={isTeamBus(camper) ? 'warning' : 'primary'} text={isTeamBus(camper) ? 'dark' : undefined}>
                      {isTeamBus(camper) ? t('admin.bus.teamBus') : t('admin.bus.normalBus')}
                    </Badge>
                  </td>
                  <td>{camper.personalInformation?.cpf || '-'}</td>
                  <td>{camper.personalInformation?.rg || '-'}</td>
                  <td>{camper.personalInformation?.rgShipper || '-'}</td>
                  <td>{camper.contact?.cellPhone || '-'}</td>
                  <td>{camper.personalInformation?.birthday || '-'}</td>
                  {canEdit && (
                    <td>
                      <div className="table-action-cell">
                        <ActionButton
                          action="edit"
                          iconSize={22}
                          label={t('admin.bus.editPassenger')}
                          onClick={() => openEdit({ camper, originalIndex })}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {busCampers.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="text-start text-secondary p-4">
                    {t('admin.bus.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <CustomModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          variant="confirm"
          icon="edit"
          iconFill='none'
          title={t('admin.bus.modalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={saving}>
                {t('admin.bus.cancel')}
              </Button>
              <SpinnerButton variant="confirm" onClick={handleSave} loading={saving}>{t('admin.bus.saveChanges')}</SpinnerButton>
            </>
          }
        >
          <Form>
            {EDIT_FIELDS.map((field) => (
              <Form.Group key={field.key} className="mb-3">
                <Form.Label>
                  <b>{t(field.labelKey)}:</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={form[field.key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              </Form.Group>
            ))}
          </Form>
        </CustomModal>

        <Loading loading={loading || saving} />
      </div>
    </div>
  );
};

AdminBus.propTypes = {
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
};

export default AdminBus;
