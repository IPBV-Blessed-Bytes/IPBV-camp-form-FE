import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { listFormFields, createFormField, updateFormField, deleteFormField } from '@/services/formFields';
import { listFormSections, createFormSection, updateFormSection, deleteFormSection } from '@/services/formSections';
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
  { value: 'cpf', label: 'CPF (inscrição única)' },
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

const emptyField = (sectionId) => ({
  id: null,
  sectionId: sectionId || null,
  key: '',
  keyTouched: false,
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
  helpText: '',
  options: [],
  consentText: '',
  consentLink: '',
});

const AdminFormBuilder = ({ loggedUsername }) => {
  const slug = useMemo(() => getEventSlug(), []);
  const [sections, setSections] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionDraft, setSectionDraft] = useState({ id: null, name: '' });

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [fieldDraft, setFieldDraft] = useState(emptyField());

  const [toDelete, setToDelete] = useState(null); // { kind: 'section' | 'field', item }

  const load = async () => {
    setLoading(true);
    try {
      const [sectionsData, fieldsData] = await Promise.all([listFormSections(), listFormFields()]);
      setSections(sectionsData);
      setFields(fieldsData);
    } catch {
      toast.error('Erro ao carregar o formulário.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sectionsWithFields = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        fields: fields.filter((field) => field.sectionId === section.id),
      })),
    [sections, fields],
  );

  // ---- sections ----
  const openCreateSection = () => {
    setSectionDraft({ id: null, name: '' });
    setShowSectionModal(true);
  };

  const openEditSection = (section) => {
    setSectionDraft({ id: section.id, name: section.name });
    setShowSectionModal(true);
  };

  const saveSection = async () => {
    if (!sectionDraft.name.trim()) {
      toast.error('Informe o nome da seção.');
      return;
    }
    setSaving(true);
    try {
      if (sectionDraft.id) {
        await updateFormSection(sectionDraft.id, { name: sectionDraft.name.trim() });
      } else {
        await createFormSection({ name: sectionDraft.name.trim(), order: sections.length });
      }
      setShowSectionModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao salvar a seção.');
    } finally {
      setSaving(false);
    }
  };

  const moveSection = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSaving(true);
    try {
      await Promise.all(reordered.map((section, i) => updateFormSection(section.id, { name: section.name, order: i })));
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao reordenar.');
    } finally {
      setSaving(false);
    }
  };

  const changeSectionColumns = async (section, columns) => {
    setSaving(true);
    try {
      await updateFormSection(section.id, { name: section.name, order: section.order, columns });
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao atualizar as colunas.');
    } finally {
      setSaving(false);
    }
  };

  // ---- fields ----
  const openCreateField = (sectionId) => {
    setFieldDraft(emptyField(sectionId));
    setShowFieldModal(true);
  };

  const openEditField = (field) => {
    setFieldDraft({
      id: field.id,
      sectionId: field.sectionId,
      key: field.key || '',
      keyTouched: true,
      label: field.label || '',
      type: field.type || 'text',
      required: field.required ?? false,
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      options: Array.isArray(field.options) ? field.options : [],
      consentText: field.config?.text || '',
      consentLink: field.config?.link || '',
    });
    setShowFieldModal(true);
  };

  const patchField = (patch) => setFieldDraft((prev) => ({ ...prev, ...patch }));

  const setFieldLabel = (label) =>
    patchField({ label, key: fieldDraft.keyTouched ? fieldDraft.key : slugifyKey(label) });

  const addOption = () => patchField({ options: [...fieldDraft.options, { label: '', value: '' }] });
  const updateOption = (index, patch) =>
    patchField({ options: fieldDraft.options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)) });
  const removeOption = (index) => patchField({ options: fieldDraft.options.filter((_, i) => i !== index) });

  const isOptionType = OPTION_TYPES.includes(fieldDraft.type);
  const isConsent = fieldDraft.type === 'consent';

  const fieldPayload = (order) => ({
    sectionId: fieldDraft.sectionId,
    key: fieldDraft.key,
    label: fieldDraft.label.trim(),
    type: fieldDraft.type,
    required: fieldDraft.required,
    placeholder: isOptionType || isConsent ? null : fieldDraft.placeholder.trim() || null,
    helpText: fieldDraft.helpText.trim() || null,
    order,
    options: isOptionType
      ? fieldDraft.options
          .filter((opt) => opt.label.trim())
          .map((opt) => ({ label: opt.label.trim(), value: (opt.value || opt.label).trim() }))
      : null,
    config: isConsent ? { text: fieldDraft.consentText.trim(), link: fieldDraft.consentLink.trim() || null } : null,
  });

  const validateField = () => {
    if (!fieldDraft.sectionId) return 'Selecione uma seção.';
    if (!fieldDraft.label.trim()) return 'O rótulo do campo é obrigatório.';
    if (!fieldDraft.key.trim()) return 'O identificador do campo é obrigatório.';
    if (isOptionType && !fieldDraft.options.some((opt) => opt.label.trim())) return 'Adicione ao menos uma opção.';
    if (isConsent && !fieldDraft.consentText.trim()) return 'Informe o texto do consentimento.';
    return null;
  };

  const saveField = async () => {
    const error = validateField();
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      if (fieldDraft.id) {
        const existing = fields.find((f) => f.id === fieldDraft.id);
        await updateFormField(fieldDraft.id, fieldPayload(existing?.order ?? fields.length));
      } else {
        await createFormField(fieldPayload(fields.length));
      }
      setShowFieldModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao salvar o campo.');
    } finally {
      setSaving(false);
    }
  };

  const moveField = async (sectionFields, index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sectionFields.length) return;
    const current = sectionFields[index];
    const neighbor = sectionFields[target];
    setSaving(true);
    try {
      await Promise.all([
        updateFormField(current.id, rawFieldPayload(current, neighbor.order)),
        updateFormField(neighbor.id, rawFieldPayload(neighbor, current.order)),
      ]);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao reordenar.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      if (toDelete.kind === 'section') await deleteFormSection(toDelete.item.id);
      else await deleteFormField(toDelete.item.id);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao excluir.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage form-builder ">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Construtor de Formulário"
        subtitle={`Campos do evento: ${slug}`}
        typeIcon="form-context"
      />

      <div className="form-builder__content">
        <div className="form-builder__toolbar">
          <Button variant="teal-blue" onClick={openCreateSection}>
            + Nova seção
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : sections.length === 0 ? (
          <p className="form-builder__empty">Crie uma seção para começar a adicionar campos.</p>
        ) : (
          <div className="form-builder__sections">
            {sectionsWithFields.map((section, sectionIndex) => (
            <div key={section.id} className="form-builder__section">
              <div className="form-builder__section-head">
                <span className="form-builder__section-num">{sectionIndex + 1}</span>
                <div className="form-builder__item-order">
                  <button
                    type="button"
                    className="form-builder__move form-builder__move--up"
                    disabled={sectionIndex === 0 || saving}
                    onClick={() => moveSection(sectionIndex, -1)}
                    aria-label="Mover seção para cima"
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                  <button
                    type="button"
                    className="form-builder__move form-builder__move--down"
                    disabled={sectionIndex === sections.length - 1 || saving}
                    onClick={() => moveSection(sectionIndex, 1)}
                    aria-label="Mover seção para baixo"
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                </div>
                <h5 className="form-builder__section-title">{section.name}</h5>
                <div className="form-builder__section-actions">
                  <Form.Select
                    size="sm"
                    className="form-builder__columns"
                    value={section.columns || 1}
                    onChange={(e) => changeSectionColumns(section, Number(e.target.value))}
                    disabled={saving}
                    aria-label="Colunas por linha da seção"
                    title="Quantos campos por linha nesta seção"
                  >
                    <option value={1}>1 coluna</option>
                    <option value={2}>2 colunas</option>
                    <option value={3}>3 colunas</option>
                  </Form.Select>
                  <Button size="sm" variant="teal-blue" onClick={() => openEditSection(section)}>
                    Renomear
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setToDelete({ kind: 'section', item: section })}>
                    Excluir
                  </Button>
                </div>
              </div>

              {section.fields.length === 0 ? (
                <p className="form-builder__section-empty">Nenhum campo nesta seção.</p>
              ) : (
                <ul className="form-builder__list">
                  {section.fields.map((field, index) => (
                    <li key={field.id} className="form-builder__item">
                      <span className="form-builder__ordinal">{index + 1}</span>
                      <div className="form-builder__item-order">
                        <button
                          type="button"
                          className="form-builder__move form-builder__move--up"
                          disabled={index === 0 || saving}
                          onClick={() => moveField(section.fields, index, -1)}
                          aria-label="Mover para cima"
                        >
                          <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                        </button>
                        <button
                          type="button"
                          className="form-builder__move form-builder__move--down"
                          disabled={index === section.fields.length - 1 || saving}
                          onClick={() => moveField(section.fields, index, 1)}
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
                        </div>
                      </div>
                      <div className="form-builder__item-actions">
                        <Button size="sm" variant="outline-teal-blue" onClick={() => openEditField(field)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => setToDelete({ kind: 'field', item: field })}>
                          Excluir
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <Button size="sm" variant="teal-blue" className="mt-2" onClick={() => openCreateField(section.id)}>
                + Adicionar campo
              </Button>
            </div>
            ))}
          </div>
        )}
      </div>

      <CustomModal
        show={showSectionModal}
        onHide={() => setShowSectionModal(false)}
        variant="info"
        title={sectionDraft.id ? 'Renomear seção' : 'Nova seção'}
        icon="form-context"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowSectionModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={saveSection} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form.Group>
          <Form.Label>Nome da seção</Form.Label>
          <Form.Control
            value={sectionDraft.name}
            onChange={(e) => setSectionDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex.: Dados pessoais"
          />
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={showFieldModal}
        onHide={() => setShowFieldModal(false)}
        variant="info"
        title={fieldDraft.id ? 'Editar campo' : 'Novo campo'}
        icon="form-context"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowFieldModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={saveField} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="form-builder__form">
          <Form.Group className="mb-3">
            <Form.Label>Seção</Form.Label>
            <Form.Select
              value={fieldDraft.sectionId || ''}
              onChange={(e) => patchField({ sectionId: Number(e.target.value) })}
            >
              <option value="">Selecione...</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={fieldDraft.type} onChange={(e) => patchField({ type: e.target.value })}>
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rótulo</Form.Label>
            <Form.Control
              value={fieldDraft.label}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="Ex.: Tamanho da camiseta"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Identificador</Form.Label>
            <Form.Control
              value={fieldDraft.key}
              onChange={(e) => patchField({ key: slugifyKey(e.target.value), keyTouched: true })}
              placeholder="tamanho_camiseta"
            />
            <Form.Text className="text-muted">Usado como chave da resposta. Único por evento.</Form.Text>
          </Form.Group>

          {!isOptionType && !isConsent && (
            <Form.Group className="mb-3">
              <Form.Label>Placeholder</Form.Label>
              <Form.Control
                value={fieldDraft.placeholder}
                onChange={(e) => patchField({ placeholder: e.target.value })}
                placeholder="Texto de exemplo dentro do campo"
              />
            </Form.Group>
          )}

          {isOptionType && (
            <Form.Group className="mb-3">
              <Form.Label>Opções</Form.Label>
              {fieldDraft.options.map((opt, index) => (
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
                  value={fieldDraft.consentText}
                  onChange={(e) => patchField({ consentText: e.target.value })}
                  placeholder="Declaro que li e concordo com..."
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Link (opcional)</Form.Label>
                <Form.Control
                  value={fieldDraft.consentLink}
                  onChange={(e) => patchField({ consentLink: e.target.value })}
                  placeholder="https://..."
                />
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Texto de ajuda (opcional)</Form.Label>
            <Form.Control
              value={fieldDraft.helpText}
              onChange={(e) => patchField({ helpText: e.target.value })}
              placeholder="Instrução exibida abaixo do campo"
            />
          </Form.Group>

          <Form.Check
            type="switch"
            id="field-required-switch"
            label="Campo obrigatório"
            checked={fieldDraft.required}
            onChange={(e) => patchField({ required: e.target.checked })}
          />
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title={toDelete?.kind === 'section' ? 'Excluir seção' : 'Excluir campo'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir <b>{toDelete?.item?.name || toDelete?.item?.label}</b>?
          {toDelete?.kind === 'section' && ' A seção precisa estar sem campos.'}
        </p>
      </CustomModal>
    </div>
  );
};

const rawFieldPayload = (field, order) => ({
  sectionId: field.sectionId,
  key: field.key,
  label: field.label,
  type: field.type,
  required: field.required,
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
