import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { listFormFields, createFormField, updateFormField, deleteFormField } from '@/services/formFields';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getEventSlug } from '@/config/eventScope';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Lista suspensa' },
  { value: 'radio', label: 'Escolha única' },
  { value: 'checkbox', label: 'Múltipla escolha' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'consent', label: 'Consentimento (LGPD)' },
];

const OPTION_TYPES = ['select', 'radio', 'checkbox'];

const typeLabel = (type) => FIELD_TYPES.find((t) => t.value === type)?.label || type;

const slugifyKey = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');

const EMPTY_FIELD = {
  id: null,
  key: '',
  keyTouched: false,
  label: '',
  type: 'text',
  required: false,
  sensitive: false,
  section: '',
  placeholder: '',
  helpText: '',
  options: [],
  consentText: '',
  consentLink: '',
};

const AdminFormBuilder = ({ loggedUsername }) => {
  const slug = useMemo(() => getEventSlug(), []);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(EMPTY_FIELD);

  const loadFields = async () => {
    setLoading(true);
    try {
      setFields(await listFormFields());
    } catch {
      toast.error('Erro ao carregar os campos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_FIELD);
    setShowModal(true);
  };

  const openEdit = (field) => {
    setDraft({
      id: field.id,
      key: field.key || '',
      keyTouched: true,
      label: field.label || '',
      type: field.type || 'text',
      required: field.required ?? false,
      sensitive: field.sensitive ?? false,
      section: field.section || '',
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      options: Array.isArray(field.options) ? field.options : [],
      consentText: field.config?.text || '',
      consentLink: field.config?.link || '',
    });
    setShowModal(true);
  };

  const patchDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const setLabel = (label) =>
    patchDraft({ label, key: draft.keyTouched ? draft.key : slugifyKey(label) });

  const addOption = () => patchDraft({ options: [...draft.options, { label: '', value: '' }] });

  const updateOption = (index, patch) =>
    patchDraft({
      options: draft.options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)),
    });

  const removeOption = (index) =>
    patchDraft({ options: draft.options.filter((_, i) => i !== index) });

  const buildPayload = (order) => ({
    key: draft.key,
    label: draft.label.trim(),
    type: draft.type,
    required: draft.required,
    sensitive: draft.sensitive,
    section: draft.section.trim() || null,
    placeholder: OPTION_TYPES.includes(draft.type) || draft.type === 'consent' ? null : draft.placeholder.trim() || null,
    helpText: draft.helpText.trim() || null,
    order,
    options: OPTION_TYPES.includes(draft.type)
      ? draft.options
          .filter((opt) => opt.label.trim())
          .map((opt) => ({ label: opt.label.trim(), value: (opt.value || opt.label).trim() }))
      : null,
    config: draft.type === 'consent' ? { text: draft.consentText.trim(), link: draft.consentLink.trim() || null } : null,
  });

  const validateDraft = () => {
    if (!draft.label.trim()) return 'O rótulo do campo é obrigatório.';
    if (!draft.key.trim()) return 'O identificador do campo é obrigatório.';
    if (OPTION_TYPES.includes(draft.type) && !draft.options.some((opt) => opt.label.trim())) {
      return 'Adicione ao menos uma opção.';
    }
    if (draft.type === 'consent' && !draft.consentText.trim()) return 'Informe o texto do consentimento.';
    return null;
  };

  const handleSave = async () => {
    const error = validateDraft();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      if (draft.id) {
        const existing = fields.find((f) => f.id === draft.id);
        await updateFormField(draft.id, buildPayload(existing?.order ?? fields.length));
        toast.success('Campo atualizado com sucesso.');
      } else {
        await createFormField(buildPayload(fields.length));
        toast.success('Campo criado com sucesso.');
      }
      setShowModal(false);
      await loadFields();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao salvar o campo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteFormField(selected.id);
      toast.success('Campo excluído com sucesso.');
      setShowDelete(false);
      setSelected(null);
      await loadFields();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao excluir o campo.');
    } finally {
      setSaving(false);
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;

    const current = fields[index];
    const neighbor = fields[target];

    setSaving(true);
    try {
      await Promise.all([
        updateFormField(current.id, fieldToPayload(current, neighbor.order)),
        updateFormField(neighbor.id, fieldToPayload(neighbor, current.order)),
      ]);
      await loadFields();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao reordenar.');
    } finally {
      setSaving(false);
    }
  };

  const isOptionType = OPTION_TYPES.includes(draft.type);
  const isConsent = draft.type === 'consent';

  return (
    <div className="form-builder">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Construtor de Formulário"
        subtitle={`Campos do evento: ${slug}`}
        typeIcon="form-context"
      />

      <div className="form-builder__content">
        <div className="form-builder__toolbar">
          <Button variant="teal-blue" onClick={openCreate}>
            + Adicionar campo
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : fields.length === 0 ? (
          <p className="form-builder__empty">Nenhum campo cadastrado. Comece adicionando o primeiro.</p>
        ) : (
          <ul className="form-builder__list">
            {fields.map((field, index) => (
              <li key={field.id} className="form-builder__item">
                <div className="form-builder__item-order">
                  <button
                    type="button"
                    className="form-builder__move form-builder__move--up"
                    disabled={index === 0 || saving}
                    onClick={() => move(index, -1)}
                    aria-label="Mover para cima"
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                  <button
                    type="button"
                    className="form-builder__move form-builder__move--down"
                    disabled={index === fields.length - 1 || saving}
                    onClick={() => move(index, 1)}
                    aria-label="Mover para baixo"
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                </div>

                <div className="form-builder__item-main">
                  <div className="form-builder__item-title">
                    {field.label}
                    {field.required && <span className="form-builder__req">*</span>}
                  </div>
                  <div className="form-builder__item-meta">
                    <Badge bg="light" text="dark">
                      {typeLabel(field.type)}
                    </Badge>
                    <code>{field.key}</code>
                    {field.section && <span className="form-builder__section">{field.section}</span>}
                    {field.sensitive && (
                      <Badge bg="warning" text="dark">
                        sensível
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="form-builder__item-actions">
                  <Button size="sm" variant="outline-teal-blue" onClick={() => openEdit(field)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => {
                      setSelected(field);
                      setShowDelete(true);
                    }}
                  >
                    Excluir
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
        icon="form-context"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="form-builder__form">
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={draft.type} onChange={(e) => patchDraft({ type: e.target.value })}>
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rótulo</Form.Label>
            <Form.Control value={draft.label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex.: Tamanho da camiseta" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Identificador</Form.Label>
            <Form.Control
              value={draft.key}
              onChange={(e) => patchDraft({ key: slugifyKey(e.target.value), keyTouched: true })}
              placeholder="tamanho_camiseta"
            />
            <Form.Text className="text-muted">Usado como chave da resposta. Único por evento.</Form.Text>
          </Form.Group>

          {!isOptionType && !isConsent && (
            <Form.Group className="mb-3">
              <Form.Label>Placeholder</Form.Label>
              <Form.Control
                value={draft.placeholder}
                onChange={(e) => patchDraft({ placeholder: e.target.value })}
                placeholder="Texto de exemplo dentro do campo"
              />
            </Form.Group>
          )}

          {isOptionType && (
            <Form.Group className="mb-3">
              <Form.Label>Opções</Form.Label>
              {draft.options.map((opt, index) => (
                <div key={index} className="form-builder__option-row">
                  <Form.Control
                    value={opt.label}
                    onChange={(e) =>
                      updateOption(index, {
                        label: e.target.value,
                        value: opt.valueTouched ? opt.value : slugifyKey(e.target.value),
                      })
                    }
                    placeholder="Rótulo da opção"
                  />
                  <Form.Control
                    value={opt.value}
                    onChange={(e) => updateOption(index, { value: e.target.value, valueTouched: true })}
                    placeholder="valor"
                  />
                  <Button variant="outline-danger" size="sm" onClick={() => removeOption(index)}>
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline-teal-blue" size="sm" onClick={addOption} className="mt-2">
                + Opção
              </Button>
            </Form.Group>
          )}

          {isConsent && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Texto do consentimento</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={draft.consentText}
                  onChange={(e) => patchDraft({ consentText: e.target.value })}
                  placeholder="Declaro que li e concordo com..."
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Link (opcional)</Form.Label>
                <Form.Control
                  value={draft.consentLink}
                  onChange={(e) => patchDraft({ consentLink: e.target.value })}
                  placeholder="https://..."
                />
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Seção (opcional)</Form.Label>
            <Form.Control
              value={draft.section}
              onChange={(e) => patchDraft({ section: e.target.value })}
              placeholder="Ex.: Dados pessoais"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Texto de ajuda (opcional)</Form.Label>
            <Form.Control
              value={draft.helpText}
              onChange={(e) => patchDraft({ helpText: e.target.value })}
              placeholder="Instrução exibida abaixo do campo"
            />
          </Form.Group>

          <Form.Check
            type="switch"
            id="field-required-switch"
            label="Campo obrigatório"
            checked={draft.required}
            onChange={(e) => patchDraft({ required: e.target.checked })}
          />
          <Form.Check
            type="switch"
            id="field-sensitive-switch"
            className="mt-2"
            label="Dado sensível (LGPD)"
            checked={draft.sensitive}
            onChange={(e) => patchDraft({ sensitive: e.target.checked })}
          />
        </Form>
      </CustomModal>

      <CustomModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        variant="cancel"
        title="Excluir campo"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowDelete(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir o campo <b>{selected?.label}</b>?
        </p>
      </CustomModal>
    </div>
  );
};

const fieldToPayload = (field, order) => ({
  key: field.key,
  label: field.label,
  type: field.type,
  required: field.required,
  sensitive: field.sensitive,
  section: field.section,
  placeholder: field.placeholder,
  helpText: field.helpText,
  order,
  options: field.options ?? null,
  config: field.config ?? null,
});

AdminFormBuilder.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFormBuilder;
