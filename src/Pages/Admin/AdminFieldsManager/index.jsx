import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { listAdminFields, createAdminField, updateAdminField, deleteAdminField } from '@/services/adminFields';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import useEventName from '@/hooks/useEventName';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const FIELD_TYPES = [
  { value: 'text' },
  { value: 'textarea' },
  { value: 'number' },
  { value: 'date' },
  { value: 'select' },
  { value: 'radio' },
  { value: 'checkbox' },
  { value: 'consent' },
];

const HAS_OPTIONS = ['select', 'radio', 'checkbox'];

const EMPTY_FIELD = { id: null, label: '', type: 'text', optionsText: '' };

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');

const optionsToText = (options) =>
  Array.isArray(options) ? options.map((option) => option.label ?? option.value ?? '').join('\n') : '';

const textToOptions = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ value: slugify(line) || line, label: line }));

const AdminFieldsManager = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const eventName = useEventName();
  const typeLabel = (type) => (FIELD_TYPES.some((ft) => ft.value === type) ? t(`admin.adminFields.types.${type}`) : type);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(EMPTY_FIELD);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setFields(await listAdminFields());
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.adminFields.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_FIELD);
    setShowModal(true);
  };

  const openEdit = (field) => {
    setDraft({
      id: field.id,
      label: field.label || '',
      type: field.type || 'text',
      optionsText: optionsToText(field.options),
    });
    setShowModal(true);
  };

  const buildPayload = (order) => ({
    label: draft.label.trim(),
    type: draft.type,
    options: HAS_OPTIONS.includes(draft.type) ? textToOptions(draft.optionsText) : null,
    order,
  });

  const handleSave = async () => {
    if (!draft.label.trim()) {
      toast.error(t('admin.adminFields.labelRequired'));
      return;
    }
    if (HAS_OPTIONS.includes(draft.type) && textToOptions(draft.optionsText).length === 0) {
      toast.error(t('admin.adminFields.addOneOption'));
      return;
    }
    setSaving(true);
    try {
      if (draft.id) {
        await updateAdminField(draft.id, buildPayload(fields.findIndex((f) => f.id === draft.id)));
        toast.success(t('admin.adminFields.updated'));
      } else {
        await createAdminField(buildPayload(fields.length));
        toast.success(t('admin.adminFields.created'));
      }
      registerLog(draft.id ? 'Editou um campo administrativo' : 'Criou um campo administrativo', loggedUsername);
      setShowModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.adminFields.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await deleteAdminField(toDelete.id);
      registerLog('Excluiu um campo administrativo', loggedUsername);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.adminFields.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const withOptions = useMemo(() => fields.filter((f) => HAS_OPTIONS.includes(f.type)).length, [fields]);
  const statItems = [
    { label: t('admin.adminFields.statFields'), value: fields.length },
    { label: t('admin.adminFields.statWithOptions'), value: withOptions, tone: 'info' },
  ];

  return (
    <div className="admin-subpage admin-fields">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.adminFields.title')}
        subtitle={t('admin.adminFields.subtitle', { eventName })}
        typeIcon="edit"
      />

      <div className="admin-fields__content">
        <StatCards items={statItems} />

        <p className="admin-fields__hint">{t('admin.adminFields.hint')}</p>

        <div className="admin-fields__toolbar">
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
            {t('admin.adminFields.newField')}&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : fields.length === 0 ? (
          <p className="admin-fields__empty">{t('admin.adminFields.empty')}</p>
        ) : (
          <ul className="admin-fields__list">
            {fields.map((field, index) => (
              <li key={field.id} className="admin-fields__item">
                <span className="admin-fields__num">{index + 1}</span>
                <span className="admin-fields__label">{field.label}</span>
                <Badge bg="light" text="dark" className="admin-fields__type">
                  {typeLabel(field.type)}
                </Badge>
                <div className="admin-fields__actions">
                  <Button size="sm" variant="outline-teal-blue" onClick={() => openEdit(field)}>
                    {t('admin.adminFields.edit')}
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setToDelete(field)}>
                    <Icons typeIcon="delete" iconSize={20} fill="#dc3545" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="info"
        title={draft.id ? t('admin.adminFields.editTitle') : t('admin.adminFields.newTitle')}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              {t('admin.adminFields.cancel')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleSave} loading={saving}>{t('admin.adminFields.save')}</SpinnerButton>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>{t('admin.adminFields.labelLabel')}</b>
            </Form.Label>
            <Form.Control
              value={draft.label}
              onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
              placeholder={t('admin.adminFields.labelPlaceholder')}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>{t('admin.adminFields.typeLabel')}</b>
            </Form.Label>
            <Form.Select
              value={draft.type}
              onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(`admin.adminFields.types.${type.value}`)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {HAS_OPTIONS.includes(draft.type) && (
            <Form.Group>
              <Form.Label>
                <b>{t('admin.adminFields.optionsLabel')}</b>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={draft.optionsText}
                onChange={(e) => setDraft((prev) => ({ ...prev, optionsText: e.target.value }))}
                placeholder={t('admin.adminFields.optionsPlaceholder')}
              />
              <Form.Text className="text-muted">{t('admin.adminFields.optionsHelp')}</Form.Text>
            </Form.Group>
          )}
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title={t('admin.adminFields.deleteTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              {t('admin.adminFields.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={confirmDelete} loading={saving}>{t('admin.adminFields.delete')}</SpinnerButton>
          </>
        }
      >
        <p>
          <Trans
            i18nKey="admin.adminFields.deleteConfirm"
            components={{ b: <b /> }}
            values={{ label: toDelete?.label }}
          />
        </p>
      </CustomModal>
    </div>
  );
};

AdminFieldsManager.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFieldsManager;
