import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { listFormFields, createFormField, updateFormField, deleteFormField } from '@/services/formFields';
import { listFormSections, createFormSection, updateFormSection, deleteFormSection } from '@/services/formSections';
import { getApiErrorMessage } from '@/fetchers/helpers';
import useEventName from '@/hooks/useEventName';
import { EVENT_TEMPLATES } from '@/config/eventTemplates';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import FormSection from '@/components/Admin/FormSection';
import MinorTemplateCard from '@/components/Admin/MinorTemplateCard';
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
  { value: 'email' },
  { value: 'phone' },
  { value: 'cpf' },
  { value: 'consent' },
  { value: 'file' },
];

const OPTION_TYPES = ['select', 'radio', 'checkbox'];

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
  source: '',
  consentText: '',
  consentLink: '',
});

const AdminFormBuilder = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const eventName = useEventName();
  const typeLabel = (type) => (FIELD_TYPES.some((ft) => ft.value === type) ? t(`admin.formBuilder.types.${type}`) : type);
  const [sections, setSections] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(null);

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
      toast.error(t('admin.formBuilder.loadError'));
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
      toast.error(t('admin.formBuilder.sectionNameRequired'));
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
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.sectionSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const hasModule = (type) => sections.some((section) => section.moduleType === type);

  const applyTemplate = async (template) => {
    if (sections.length > 0) {
      toast.error(t('admin.formBuilder.templateOnlyEmpty'));
      return;
    }
    setApplyingTemplate(template.key);
    try {
      const createdSections = await Promise.all(
        template.sections.map((blueprint, order) =>
          createFormSection({ name: blueprint.name, order, moduleType: blueprint.moduleType || null }).then(
            (created) => ({ created, blueprint }),
          ),
        ),
      );
      let fieldOrder = 0;
      const fieldPayloads = [];
      createdSections.forEach(({ created, blueprint }) => {
        (blueprint.fields || []).forEach((field) => {
          fieldPayloads.push({
            sectionId: created.id,
            key: field.key,
            label: field.label,
            type: field.type,
            required: Boolean(field.required),
            placeholder: null,
            helpText: field.helpText || null,
            order: fieldOrder,
            options: field.options || null,
            config: field.config || null,
          });
          fieldOrder += 1;
        });
      });
      await Promise.all(fieldPayloads.map((payload) => createFormField(payload)));
      toast.success(t('admin.formBuilder.templateApplied', { label: template.label }));
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.templateApplyError'));
      await load();
    } finally {
      setApplyingTemplate(null);
    }
  };

  const createModule = async (type, name, displayName) => {
    if (hasModule(type)) {
      toast.error(t('admin.formBuilder.moduleExists', { name: displayName }));
      return;
    }
    setSaving(true);
    try {
      await createFormSection({ name, order: sections.length, moduleType: type });
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.moduleAddError', { name: displayName }));
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
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.reorderError'));
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
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.columnsError'));
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
      source: field.config?.source || '',
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
    options:
      isOptionType && !fieldDraft.source
        ? fieldDraft.options
            .filter((opt) => opt.label.trim())
            .map((opt) => ({ label: opt.label.trim(), value: (opt.value || opt.label).trim() }))
        : null,
    config: isConsent
      ? { text: fieldDraft.consentText.trim(), link: fieldDraft.consentLink.trim() || null }
      : isOptionType && fieldDraft.source
        ? { source: fieldDraft.source }
        : null,
  });

  const validateField = () => {
    if (!fieldDraft.sectionId) return t('admin.formBuilder.selectSection');
    if (!fieldDraft.label.trim()) return t('admin.formBuilder.labelRequired');
    if (!fieldDraft.key.trim()) return t('admin.formBuilder.keyRequired');
    if (isOptionType && !fieldDraft.source && !fieldDraft.options.some((opt) => opt.label.trim()))
      return t('admin.formBuilder.addOneOption');
    if (isConsent && !fieldDraft.consentText.trim()) return t('admin.formBuilder.consentTextRequired');
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
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.fieldSaveError'));
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
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.reorderError'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      if (toDelete.kind === 'section-all') {
        const sectionFields = fields.filter((field) => field.sectionId === toDelete.item.id);
        await Promise.all(sectionFields.map((field) => deleteFormField(field.id)));
        await deleteFormSection(toDelete.item.id);
      } else if (toDelete.kind === 'section') {
        await deleteFormSection(toDelete.item.id);
      } else {
        await deleteFormField(toDelete.item.id);
      }
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const requiredCount = fields.filter((field) => field.required).length;
  const statItems = [
    { label: t('admin.formBuilder.statSections'), value: sections.length },
    { label: t('admin.formBuilder.statFields'), value: fields.length, tone: 'accent' },
    { label: t('admin.formBuilder.statRequired'), value: requiredCount, tone: 'info' },
  ];

  return (
    <div className="admin-subpage admin-subpage--settings form-builder">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.formBuilder.title')}
        subtitle={t('admin.formBuilder.subtitle', { eventName })}
        typeIcon="form-context"
      />

      <div className="form-builder__content">
        {!loading && sections.length > 0 && <StatCards items={statItems} />}

        <MinorTemplateCard />

        <div className="form-builder__toolbar">
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreateSection}>
            {t('admin.formBuilder.newSection')}&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
          {!hasModule('package') && (
            <Button
              className="d-flex align-items-center"
              variant="outline-teal-blue"
              onClick={() => createModule('package', 'Pacote', t('admin.formBuilder.moduleNamePackage'))}
              disabled={saving}
            >
              {t('admin.formBuilder.btnModulePackage')}&nbsp;&nbsp;
              <Icons typeIcon="plus" iconSize={16} fill="#007185" />
            </Button>
          )}
          {!hasModule('ride') && (
            <Button
              className="d-flex align-items-center"
              variant="outline-teal-blue"
              onClick={() => createModule('ride', 'Carona', t('admin.formBuilder.moduleNameRide'))}
              disabled={saving}
            >
              {t('admin.formBuilder.btnModuleRide')}&nbsp;&nbsp;
              <Icons typeIcon="plus" iconSize={16} fill="#007185" />
            </Button>
          )}
        </div>

        {loading ? (
          <Loading loading />
        ) : sections.length === 0 ? (
          <FormSection
            title={t('admin.formBuilder.templatesTitle')}
            description={t('admin.formBuilder.templatesHint')}
          >
            <div className="form-builder__templates-grid">
              {EVENT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.key}
                  type="button"
                  className="form-builder__template-card"
                  disabled={Boolean(applyingTemplate)}
                  onClick={() => applyTemplate(tpl)}
                >
                  <span className="form-builder__template-name">{tpl.label}</span>
                  <span className="form-builder__template-desc">{tpl.description}</span>
                  {applyingTemplate === tpl.key && (
                    <span className="form-builder__template-status">{t('admin.formBuilder.applying')}</span>
                  )}
                </button>
              ))}
            </div>
            <p className="form-builder__empty">{t('admin.formBuilder.emptyManual')}</p>
          </FormSection>
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
                      aria-label={t('admin.formBuilder.moveSectionUp')}
                    >
                      <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                    </button>
                    <button
                      type="button"
                      className="form-builder__move form-builder__move--down"
                      disabled={sectionIndex === sections.length - 1 || saving}
                      onClick={() => moveSection(sectionIndex, 1)}
                      aria-label={t('admin.formBuilder.moveSectionDown')}
                    >
                      <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                    </button>
                  </div>
                  <h5 className="form-builder__section-title">{section.name}</h5>
                  <div className="form-builder__section-actions">
                    {!section.moduleType && (
                      <Form.Select
                        size="sm"
                        className="form-builder__columns"
                        value={section.columns || 1}
                        onChange={(e) => changeSectionColumns(section, Number(e.target.value))}
                        disabled={saving}
                        aria-label={t('admin.formBuilder.columnsAria')}
                        title={t('admin.formBuilder.columnsTitle')}
                      >
                        <option value={1}>{t('admin.formBuilder.col1')}</option>
                        <option value={2}>{t('admin.formBuilder.col2')}</option>
                        <option value={3}>{t('admin.formBuilder.col3')}</option>
                      </Form.Select>
                    )}
                    <Button size="sm" variant="teal-blue" onClick={() => openEditSection(section)}>
                      {t('admin.formBuilder.rename')}
                    </Button>
                    {section.fields.length > 0 ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setToDelete({ kind: 'section-all', item: section })}
                      >
                        {t('admin.formBuilder.deleteAll')}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setToDelete({ kind: 'section', item: section })}
                      >
                        {t('admin.formBuilder.delete')}
                      </Button>
                    )}
                  </div>
                </div>

                {section.moduleType ? (
                  <p className="form-builder__section-empty">
                    {section.moduleType === 'package' ? (
                      <Trans i18nKey="admin.formBuilder.modulePackageDesc" components={{ b: <b /> }} />
                    ) : section.moduleType === 'ride' ? (
                      <Trans i18nKey="admin.formBuilder.moduleRideDesc" components={{ b: <b /> }} />
                    ) : (
                      <Trans
                        i18nKey="admin.formBuilder.moduleGenericDesc"
                        components={{ b: <b /> }}
                        values={{ type: section.moduleType }}
                      />
                    )}{' '}
                    <Trans i18nKey="admin.formBuilder.modulePositionNote" components={{ b: <b /> }} />
                  </p>
                ) : section.fields.length === 0 ? (
                  <p className="form-builder__section-empty">{t('admin.formBuilder.sectionEmpty')}</p>
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
                            aria-label={t('admin.formBuilder.moveUp')}
                          >
                            <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                          </button>
                          <button
                            type="button"
                            className="form-builder__move form-builder__move--down"
                            disabled={index === section.fields.length - 1 || saving}
                            onClick={() => moveField(section.fields, index, 1)}
                            aria-label={t('admin.formBuilder.moveDown')}
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
                            {t('admin.formBuilder.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => setToDelete({ kind: 'field', item: field })}
                          >
                            {t('admin.formBuilder.delete')}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {!section.moduleType && (
                  <Button size="sm" variant="teal-blue" className="mt-2" onClick={() => openCreateField(section.id)}>
                    {t('admin.formBuilder.addField')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomModal
        show={showSectionModal}
        onHide={() => setShowSectionModal(false)}
        variant="info"
        title={sectionDraft.id ? t('admin.formBuilder.sectionModalEditTitle') : t('admin.formBuilder.sectionModalNewTitle')}
        icon={sectionDraft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowSectionModal(false)} disabled={saving}>
              {t('admin.formBuilder.cancel')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={saveSection} loading={saving}>{t('admin.formBuilder.save')}</SpinnerButton>
          </>
        }
      >
        <Form.Group>
          <Form.Label>
            <b>{t('admin.formBuilder.sectionNameLabel')}</b>
          </Form.Label>
          <Form.Control
            value={sectionDraft.name}
            onChange={(e) => setSectionDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={t('admin.formBuilder.sectionNamePlaceholder')}
          />
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={showFieldModal}
        onHide={() => setShowFieldModal(false)}
        variant="info"
        title={fieldDraft.id ? t('admin.formBuilder.fieldModalEditTitle') : t('admin.formBuilder.fieldModalNewTitle')}
        icon={fieldDraft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowFieldModal(false)} disabled={saving}>
              {t('admin.formBuilder.cancel')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={saveField} loading={saving}>{t('admin.formBuilder.save')}</SpinnerButton>
          </>
        }
      >
        <Form className="form-builder__form">
          <Form.Group className="mb-3">
            <Form.Label>{t('admin.formBuilder.fieldSectionLabel')}</Form.Label>
            <Form.Select
              value={fieldDraft.sectionId || ''}
              onChange={(e) => patchField({ sectionId: Number(e.target.value) })}
            >
              <option value="">{t('admin.formBuilder.selectEllipsis')}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('admin.formBuilder.fieldTypeLabel')}</Form.Label>
            <Form.Select value={fieldDraft.type} onChange={(e) => patchField({ type: e.target.value })}>
              {FIELD_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {t(`admin.formBuilder.types.${ft.value}`)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('admin.formBuilder.fieldLabelLabel')}</Form.Label>
            <Form.Control
              value={fieldDraft.label}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder={t('admin.formBuilder.fieldLabelPlaceholder')}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('admin.formBuilder.fieldKeyLabel')}</Form.Label>
            <Form.Control
              value={fieldDraft.key}
              onChange={(e) => patchField({ key: slugifyKey(e.target.value), keyTouched: true })}
              placeholder={t('admin.formBuilder.fieldKeyPlaceholder')}
            />
            <Form.Text className="text-muted">{t('admin.formBuilder.fieldKeyHelp')}</Form.Text>
          </Form.Group>

          {!isOptionType && !isConsent && (
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.formBuilder.placeholderLabel')}</Form.Label>
              <Form.Control
                value={fieldDraft.placeholder}
                onChange={(e) => patchField({ placeholder: e.target.value })}
                placeholder={t('admin.formBuilder.placeholderPlaceholder')}
              />
            </Form.Group>
          )}

          {isOptionType && (
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.formBuilder.optionSourceLabel')}</Form.Label>
              <Form.Select value={fieldDraft.source} onChange={(e) => patchField({ source: e.target.value })}>
                <option value="">{t('admin.formBuilder.sourceManual')}</option>
                <option value="products">{t('admin.formBuilder.sourceProducts')}</option>
                <option value="lots">{t('admin.formBuilder.sourceLots')}</option>
                <option value="package_categories">{t('admin.formBuilder.sourcePackageCategories')}</option>
              </Form.Select>
              {fieldDraft.source && (
                <Form.Text className="text-muted-italic">
                  {t('admin.formBuilder.sourceHelp')}
                </Form.Text>
              )}
            </Form.Group>
          )}

          {isOptionType && !fieldDraft.source && (
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.formBuilder.optionsLabel')}</Form.Label>
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
                    placeholder={t('admin.formBuilder.optionLabelPlaceholder')}
                  />
                  <Form.Control
                    value={opt.value}
                    onChange={(e) => updateOption(index, { value: e.target.value, valueTouched: true })}
                    placeholder={t('admin.formBuilder.optionValuePlaceholder')}
                  />
                  <Button variant="outline-danger" size="sm" onClick={() => removeOption(index)}>
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline-teal-blue" size="sm" onClick={addOption} className="mt-2">
                {t('admin.formBuilder.addOption')}
              </Button>
            </Form.Group>
          )}

          {isConsent && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>{t('admin.formBuilder.consentTextLabel')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={fieldDraft.consentText}
                  onChange={(e) => patchField({ consentText: e.target.value })}
                  placeholder={t('admin.formBuilder.consentTextPlaceholder')}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>{t('admin.formBuilder.consentLinkLabel')}</Form.Label>
                <Form.Control
                  value={fieldDraft.consentLink}
                  onChange={(e) => patchField({ consentLink: e.target.value })}
                  placeholder={t('admin.formBuilder.consentLinkPlaceholder')}
                />
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>{t('admin.formBuilder.helpTextLabel')}</Form.Label>
            <Form.Control
              value={fieldDraft.helpText}
              onChange={(e) => patchField({ helpText: e.target.value })}
              placeholder={t('admin.formBuilder.helpTextPlaceholder')}
            />
          </Form.Group>

          <Form.Check
            type="switch"
            id="field-required-switch"
            label={t('admin.formBuilder.requiredSwitch')}
            checked={fieldDraft.required}
            onChange={(e) => patchField({ required: e.target.checked })}
          />
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title={
          toDelete?.kind === 'section-all'
            ? t('admin.formBuilder.deleteSectionAllTitle')
            : toDelete?.kind === 'section'
              ? t('admin.formBuilder.deleteSectionTitle')
              : t('admin.formBuilder.deleteFieldTitle')
        }
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              {t('admin.formBuilder.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={confirmDelete} loading={saving}>{t('admin.formBuilder.delete')}</SpinnerButton>
          </>
        }
      >
        <p>
          <Trans
            i18nKey="admin.formBuilder.deleteConfirmQuestion"
            components={{ b: <b /> }}
            values={{ name: toDelete?.item?.name || toDelete?.item?.label }}
          />
          {toDelete?.kind === 'section' && t('admin.formBuilder.deleteSectionSuffix')}
          {toDelete?.kind === 'section-all' &&
            t('admin.formBuilder.deleteSectionAllSuffix', {
              count: fields.filter((f) => f.sectionId === toDelete.item.id).length,
            })}
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
