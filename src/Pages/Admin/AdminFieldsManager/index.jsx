import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { listAdminFields, createAdminField, updateAdminField, deleteAdminField } from '@/services/adminFields';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getEventSlug } from '@/config/eventScope';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Seleção (lista)' },
  { value: 'radio', label: 'Escolha única' },
  { value: 'checkbox', label: 'Múltipla escolha' },
  { value: 'consent', label: 'Sim / Não' },
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

const typeLabel = (type) => FIELD_TYPES.find((t) => t.value === type)?.label || type;

const optionsToText = (options) =>
  Array.isArray(options) ? options.map((option) => option.label ?? option.value ?? '').join('\n') : '';

const textToOptions = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ value: slugify(line) || line, label: line }));

const AdminFieldsManager = ({ loggedUsername }) => {
  const slug = useMemo(() => getEventSlug(), []);
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
      toast.error(getApiErrorMessage(err) || 'Erro ao carregar os campos.');
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
      toast.error('O rótulo do campo é obrigatório.');
      return;
    }
    if (HAS_OPTIONS.includes(draft.type) && textToOptions(draft.optionsText).length === 0) {
      toast.error('Adicione ao menos uma opção.');
      return;
    }
    setSaving(true);
    try {
      if (draft.id) {
        await updateAdminField(draft.id, buildPayload(fields.findIndex((f) => f.id === draft.id)));
        toast.success('Campo atualizado.');
      } else {
        await createAdminField(buildPayload(fields.length));
        toast.success('Campo criado.');
      }
      registerLog(draft.id ? 'Editou um campo administrativo' : 'Criou um campo administrativo', loggedUsername);
      setShowModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao salvar o campo.');
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
      toast.error(getApiErrorMessage(err) || 'Erro ao excluir.');
    } finally {
      setSaving(false);
    }
  };

  const withOptions = useMemo(() => fields.filter((f) => HAS_OPTIONS.includes(f.type)).length, [fields]);
  const statItems = [
    { label: 'Campos administrativos', value: fields.length },
    { label: 'Com opções', value: withOptions, tone: 'info' },
  ];

  return (
    <div className="admin-subpage admin-fields">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Campos administrativos"
        subtitle={`Campos preenchidos só pelo admin — evento: ${slug}`}
        typeIcon="edit"
      />

      <div className="admin-fields__content">
        <StatCards items={statItems} />

        <p className="admin-fields__hint">
          Colunas extras na tabela de inscritos que apenas a administração preenche após a inscrição, separadas do
          formulário público.
        </p>

        <div className="admin-fields__toolbar">
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
            Novo campo&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : fields.length === 0 ? (
          <p className="admin-fields__empty">Nenhum campo administrativo cadastrado. Crie o primeiro acima.</p>
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
                    Editar
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
        title={draft.id ? 'Editar campo' : 'Novo campo'}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleSave} loading={saving}>Salvar</SpinnerButton>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>Rótulo:</b>
            </Form.Label>
            <Form.Control
              value={draft.label}
              onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Ex.: Equipe, Observações internas..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>Tipo:</b>
            </Form.Label>
            <Form.Select
              value={draft.type}
              onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {HAS_OPTIONS.includes(draft.type) && (
            <Form.Group>
              <Form.Label>
                <b>Opções:</b>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={draft.optionsText}
                onChange={(e) => setDraft((prev) => ({ ...prev, optionsText: e.target.value }))}
                placeholder="Uma opção por linha"
              />
              <Form.Text className="text-muted">Uma opção por linha.</Form.Text>
            </Form.Group>
          )}
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title="Excluir campo"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              Cancelar
            </Button>
            <SpinnerButton variant="danger" onClick={confirmDelete} loading={saving}>Excluir</SpinnerButton>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir o campo <b>{toDelete?.label}</b>? Os valores já preenchidos nas inscrições
          serão perdidos.
        </p>
      </CustomModal>
    </div>
  );
};

AdminFieldsManager.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFieldsManager;
