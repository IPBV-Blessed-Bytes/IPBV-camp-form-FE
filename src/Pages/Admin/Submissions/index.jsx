import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import useEventSchema from '@/hooks/useEventSchema';
import { formatValue } from '@/form/dynamic/formatAnswer';
import { listSubmissions, updateSubmission, deleteSubmission, createManualSubmission } from '@/services/submissions';
import { listAdminFields, updateSubmissionAdminAnswers } from '@/services/adminFields';
import { registrationFileUrl } from '@/services/uploads';
import { getEventSlug } from '@/config/eventScope';
import useEventName from '@/hooks/useEventName';
import { downloadSingleSheet } from '@/utils/excelExport';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import RefundModal from '@/components/Admin/RefundModal';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';
import ActionButton from '@/components/Global/ActionButton';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import { computeAge } from '@/form/dynamic/packagePricing';

const PAYMENT_STATUS = [
  { value: 'pending', labelKey: 'admin.submissions.statusPending', bg: 'warning', text: 'dark' },
  { value: 'paid', labelKey: 'admin.submissions.statusPaid', bg: 'success' },
  { value: 'cancelled', labelKey: 'admin.submissions.statusCancelled', bg: 'secondary' },
];

const paymentMeta = (value) => PAYMENT_STATUS.find((s) => s.value === value);

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR');
};

const renderFieldValue = (field, value, t) => {
  if (field.type === 'file' && value?.id) {
    return (
      <a href={registrationFileUrl(value.id)} target="_blank" rel="noopener noreferrer">
        {value.name || t('admin.submissions.fileLabel')}
      </a>
    );
  }
  return formatValue(field, value);
};

const EditField = ({ field, value, onChange }) => {
  const { t } = useTranslation();
  if (field.type === 'textarea') {
    return <Form.Control as="textarea" rows={2} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === 'number') {
    return <Form.Control type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === 'select' || field.type === 'radio') {
    return (
      <Form.Select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t('admin.submissions.selectPlaceholder')}</option>
        {(field.options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    );
  }
  if (field.type === 'checkbox') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div>
        {(field.options || []).map((o) => (
          <Form.Check
            key={o.value}
            type="checkbox"
            label={o.label}
            checked={arr.includes(o.value)}
            onChange={(e) => onChange(e.target.checked ? [...arr, o.value] : arr.filter((v) => v !== o.value))}
          />
        ))}
      </div>
    );
  }
  if (field.type === 'consent') {
    return (
      <Form.Check
        type="switch"
        label={t('admin.submissions.accept')}
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }
  if (field.type === 'file') {
    return value?.id ? (
      <a href={registrationFileUrl(value.id)} target="_blank" rel="noopener noreferrer">
        {value.name || t('admin.submissions.fileLabel')}
      </a>
    ) : (
      <span className="text-muted">{t('admin.submissions.noFileUploaded')}</span>
    );
  }
  return <Form.Control type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
};

EditField.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

const AdminSubmissions = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const slug = useMemo(() => getEventSlug(), []);
  const eventName = useEventName();
  const statusLabel = (value) => {
    const meta = paymentMeta(value);
    return meta ? t(meta.labelKey) : null;
  };
  const { fields, loading: schemaLoading } = useEventSchema();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editAnswers, setEditAnswers] = useState({});
  const [editAdminAnswers, setEditAdminAnswers] = useState({});
  const [adminFields, setAdminFields] = useState([]);
  const [editStatus, setEditStatus] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [refundTarget, setRefundTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newAnswers, setNewAnswers] = useState({});
  const [newStatus, setNewStatus] = useState('');
  const [childrenFilter, setChildrenFilter] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      setSubmissions(await listSubmissions());
    } catch {
      toast.error(t('admin.submissions.toastLoadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
    listAdminFields()
      .then(setAdminFields)
      .catch(() => setAdminFields([]));
  }, []);

  const hasPayment = useMemo(() => submissions.some((s) => s.paymentStatus != null), [submissions]);

  const openEdit = (submission) => {
    setEditing(submission);
    setEditAnswers({ ...(submission.answers || {}) });
    setEditAdminAnswers({ ...(submission.adminAnswers || {}) });
    setEditStatus(submission.paymentStatus || '');
  };

  const handleEditChange = (key, value) => setEditAnswers((prev) => ({ ...prev, [key]: value }));

  const handleAdminEditChange = (key, value) => setEditAdminAnswers((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const payload = { answers: editAnswers };
      if (hasPayment || editStatus) payload.paymentStatus = editStatus || null;
      await updateSubmission(editing.id, payload);
      if (adminFields.length) {
        await updateSubmissionAdminAnswers(editing.id, editAdminAnswers);
      }
      toast.success(t('admin.submissions.toastUpdateSuccess'));
      setEditing(null);
      await loadSubmissions();
    } catch {
      toast.error(t('admin.submissions.toastUpdateError'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteSubmission(toDelete.id);
      toast.success(t('admin.submissions.toastDeleteSuccess'));
      setToDelete(null);
      await loadSubmissions();
    } catch {
      toast.error(t('admin.submissions.toastDeleteError'));
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    if (!submissions.length) return;
    const colData = t('admin.submissions.exportColData');
    const colEmail = t('admin.submissions.exportColEmail');
    const colStatus = t('admin.submissions.exportColStatus');
    const rows = submissions.map((submission) => {
      const row = { [colData]: formatDate(submission.createdAt), [colEmail]: submission.userEmail || '—' };
      if (hasPayment) row[colStatus] = statusLabel(submission.paymentStatus) || submission.paymentStatus || '—';
      fields.forEach((field) => {
        row[field.label] = formatValue(field, submission.answers?.[field.key]);
      });
      adminFields.forEach((field) => {
        row[field.label] = formatValue(field, submission.adminAnswers?.[field.key]);
      });
      return row;
    });
    const headers = [
      colData,
      colEmail,
      ...(hasPayment ? [colStatus] : []),
      ...fields.map((f) => f.label),
      ...adminFields.map((f) => f.label),
    ];
    downloadSingleSheet({
      filename: `inscricoes-${slug}.xlsx`,
      sheetName: t('admin.submissions.exportSheetName'),
      rows,
      headers,
    });
  };

  const statItems = useMemo(() => {
    const identified = submissions.filter((submission) => submission.userEmail).length;
    const today = new Date().toDateString();
    const todayCount = submissions.filter((submission) => {
      const date = new Date(submission.createdAt);
      return !Number.isNaN(date.getTime()) && date.toDateString() === today;
    }).length;
    const items = [
      { label: t('admin.submissions.statTotal'), value: submissions.length },
      { label: t('admin.submissions.statIdentified'), value: identified, tone: 'info' },
      { label: t('admin.submissions.statToday'), value: todayCount, tone: 'accent' },
    ];
    if (hasPayment) {
      const paid = submissions.filter((s) => s.paymentStatus === 'paid').length;
      items.push({ label: t('admin.submissions.statPaid'), value: paid, tone: 'free' });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions, hasPayment]);

  const filteredSubmissions = useMemo(() => {
    const colValue = (submission, colId) => {
      if (colId === 'createdAt') return formatDate(submission.createdAt);
      if (colId === 'userEmail') return submission.userEmail || '';
      if (colId === 'paymentStatus') return statusLabel(submission.paymentStatus) || submission.paymentStatus || '';
      if (colId.startsWith('adm-')) {
        const field = adminFields.find((item) => `adm-${item.key}` === colId);
        return field ? String(formatValue(field, submission.adminAnswers?.[field.key]) ?? '') : '';
      }
      const field = fields.find((item) => item.key === colId);
      return field ? String(formatValue(field, submission.answers?.[field.key]) ?? '') : '';
    };

    const term = search.trim().toLowerCase();
    const activeColFilters = Object.entries(columnFilters).filter(([, value]) => value && value.trim());
    return submissions.filter((submission) => {
      if (childrenFilter) {
        const age = computeAge(submission.answers?.nascimento);
        if (age == null || age < 2 || age > 10) return false;
      }
      if (term) {
        const haystack = [
          submission.userEmail || '',
          ...fields.map((field) => formatValue(field, submission.answers?.[field.key])),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return activeColFilters.every(([colId, value]) => {
        if (colId === 'paymentStatus') return (submission.paymentStatus || '') === value;
        return colValue(submission, colId).toLowerCase().includes(value.trim().toLowerCase());
      });
    });
  }, [submissions, fields, adminFields, search, columnFilters, childrenFilter]);

  const isLoading = loading || schemaLoading;

  const hasBirthday = fields.some((field) => field.key === 'nascimento');

  const toolsButtons = [
    {
      id: 'filters',
      name: showFilters ? t('admin.submissions.hideFilters') : t('admin.submissions.filter'),
      onClick: () => setShowFilters((prev) => !prev),
      typeButton: 'outline-teal-blue',
      typeIcon: 'filter',
      fill: '#007185',
      iconSize: 22,
    },
    {
      id: 'children-filter',
      name: childrenFilter ? t('admin.submissions.showAll') : t('admin.submissions.childrenFilter'),
      onClick: () => setChildrenFilter((prev) => !prev),
      typeButton: childrenFilter ? 'teal-blue' : 'outline-teal-blue',
      typeIcon: 'family',
      fill: childrenFilter ? '#ffffff' : '#007185',
      iconSize: 22,
      condition: hasBirthday,
    },
    {
      id: 'export',
      name: t('admin.submissions.exportExcel'),
      onClick: handleExport,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
      fill: '#007185',
      iconSize: 22,
      condition: submissions.length > 0,
    },
    {
      id: 'bulk-delete',
      name: t('admin.submissions.bulkDelete'),
      onClick: () => setShowBulkDelete(true),
      typeButton: 'outline-danger',
      typeIcon: 'delete',
      fill: '#dc3545',
      iconSize: 22,
      condition: selectedIds.length > 0,
    },
    {
      id: 'new-registration',
      name: t('admin.submissions.newRegistration'),
      onClick: () => {
        setNewAnswers({});
        setNewStatus('');
        setShowNew(true);
      },
      typeButton: 'teal-blue',
      typeIcon: 'add-person',
      fill: '#ffffff',
      iconSize: 22,
    },
  ];

  const filterInput = (colId) => (
    <Form.Control
      size="sm"
      placeholder={t('admin.submissions.filterPlaceholder')}
      value={columnFilters[colId] || ''}
      onChange={(event) => setColumnFilters((prev) => ({ ...prev, [colId]: event.target.value }))}
    />
  );

  const filterStatusSelect = () => (
    <Form.Select
      size="sm"
      value={columnFilters.paymentStatus || ''}
      onChange={(event) => setColumnFilters((prev) => ({ ...prev, paymentStatus: event.target.value }))}
    >
      <option value="">{t('admin.submissions.filterAll')}</option>
      {PAYMENT_STATUS.map((s) => (
        <option key={s.value} value={s.value}>
          {t(s.labelKey)}
        </option>
      ))}
    </Form.Select>
  );

  const visibleIds = filteredSubmissions.map((item) => item.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const toggleRow = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : visibleIds);

  const handleBulkDelete = async () => {
    setBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteSubmission(id)));
      toast.success(t('admin.submissions.toastDeleteSuccess'));
      setSelectedIds([]);
      setShowBulkDelete(false);
      await loadSubmissions();
    } catch {
      toast.error(t('admin.submissions.toastDeleteError'));
    } finally {
      setBusy(false);
    }
  };

  const handleCreateManual = async () => {
    setBusy(true);
    try {
      const payload = { answers: newAnswers };
      if (hasPayment || newStatus) payload.paymentStatus = newStatus || null;
      await createManualSubmission(payload);
      toast.success(t('admin.submissions.toastCreateSuccess'));
      setShowNew(false);
      await loadSubmissions();
    } catch (error) {
      toast.error(error?.response?.data?.message || t('admin.submissions.toastCreateError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-subpage admin-submissions">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.submissions.title')}
        subtitle={t('admin.submissions.subtitle', { event: eventName })}
        typeIcon="add-person"
      />

      <div className="admin-submissions__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="admin-submissions__toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.submissions.searchPlaceholder')} />
        </div>

        {isLoading ? (
          <Loading loading />
        ) : submissions.length === 0 ? (
          <p className="admin-submissions__empty">{t('admin.submissions.emptyNone')}</p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="admin-submissions__empty">{t('admin.submissions.emptyFiltered')}</p>
        ) : (
          <div className="admin-submissions__table-wrap">
            <Table striped bordered hover responsive className="admin-submissions__table custom-table">
              <thead>
                <tr>
                  <th className="table-cells-header admin-submissions__select-col">
                    <div className="admin-submissions__select-head">
                      <Form.Check
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        aria-label={t('admin.submissions.selectAll')}
                      />
                      <span>
                        {selectedIds.length > 0
                          ? t('admin.submissions.selectedCount', { count: selectedIds.length })
                          : t('admin.submissions.selectAll')}
                      </span>
                    </div>
                  </th>
                  <th className="table-cells-header">{t('admin.submissions.colOrder')}</th>
                  <th className="table-cells-header">{t('admin.submissions.colData')}</th>
                  <th className="table-cells-header">{t('admin.submissions.colEmail')}</th>
                  {hasPayment && <th className="table-cells-header">{t('admin.submissions.colStatus')}</th>}
                  {fields.map((field) => (
                    <th className="table-cells-header" key={field.key}>{field.label}</th>
                  ))}
                  {adminFields.map((field) => (
                    <th key={`adm-${field.key}`} className="table-cells-header admin-submissions__admin-col">
                      {field.label}
                    </th>
                  ))}
                </tr>
                {showFilters && (
                  <tr className="filter">
                    <th />
                    <th />
                    <th>{filterInput('createdAt')}</th>
                    <th>{filterInput('userEmail')}</th>
                    {hasPayment && <th>{filterStatusSelect()}</th>}
                    {fields.map((field) => (
                      <th key={field.key}>{filterInput(field.key)}</th>
                    ))}
                    {adminFields.map((field) => (
                      <th key={`adm-${field.key}`}>{filterInput(`adm-${field.key}`)}</th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredSubmissions.map((submission, index) => (
                  <tr key={submission.id} className={selectedIds.includes(submission.id) ? 'selected-row' : ''}>
                    <td className="admin-submissions__select-col">
                      <div className="admin-submissions__row-head">
                        <Form.Check
                          type="checkbox"
                          checked={selectedIds.includes(submission.id)}
                          onChange={() => toggleRow(submission.id)}
                          aria-label={`${index + 1}`}
                        />
                        <div className="admin-submissions__actions table-action-cell">
                          <ActionButton
                            action="edit"
                            title={t('admin.submissions.actionEdit')}
                            onClick={() => openEdit(submission)}
                          />
                          <ActionButton
                            action="delete"
                            title={t('admin.submissions.actionDelete')}
                            onClick={() => setToDelete(submission)}
                          />
                          {submission.paymentStatus === 'paid' && Number(submission.totalCents) > 0 && (
                            <ActionButton
                              action="refund"
                              title={t('admin.submissions.actionRefund')}
                              onClick={() => setRefundTarget(submission)}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{index + 1}</td>
                    <td>{formatDate(submission.createdAt)}</td>
                    <td>{submission.userEmail || '—'}</td>
                    {hasPayment && (
                      <td>
                        {submission.paymentStatus ? (
                          <Badge
                            bg={paymentMeta(submission.paymentStatus)?.bg || 'light'}
                            text={paymentMeta(submission.paymentStatus)?.text}
                          >
                            {statusLabel(submission.paymentStatus) || submission.paymentStatus}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    {fields.map((field) => (
                      <td key={field.key}>{renderFieldValue(field, submission.answers?.[field.key], t)}</td>
                    ))}
                    {adminFields.map((field) => (
                      <td key={`adm-${field.key}`} className="admin-submissions__admin-col">
                        {formatValue(field, submission.adminAnswers?.[field.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      <CustomModal
        show={Boolean(editing)}
        onHide={() => setEditing(null)}
        variant="confirm"
        icon="edit"
        iconFill="#057c05"
        title={t('admin.submissions.editTitle')}
        centered={false}
        size="xl"
        dialogClassName="camper-form-modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={busy}>
              {t('admin.submissions.cancel')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleSave} loading={busy}>
              {t('admin.submissions.saveChanges')}
            </SpinnerButton>
          </>
        }
      >
        {editing && (
          <Form>
            <div className="admin-submissions__new-grid">
              {hasPayment && (
                <Form.Group>
                  <Form.Label>
                    <b>{t('admin.submissions.paymentStatus')}</b>
                  </Form.Label>
                  <Form.Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="">—</option>
                    {PAYMENT_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {t(s.labelKey)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              {fields.map((field) => (
                <Form.Group key={field.key}>
                  <Form.Label>
                    <b>{field.label}</b>
                    {field.required && <span className="text-danger"> *</span>}
                  </Form.Label>
                  <EditField
                    field={field}
                    value={editAnswers[field.key]}
                    onChange={(value) => handleEditChange(field.key, value)}
                  />
                </Form.Group>
              ))}
            </div>
            {adminFields.length > 0 && (
              <div className="admin-submissions__admin-section">
                <p className="admin-submissions__admin-section-title">{t('admin.submissions.adminFields')}</p>
                <div className="admin-submissions__new-grid">
                  {adminFields.map((field) => (
                    <Form.Group key={`adm-${field.key}`}>
                      <Form.Label>
                        <b>{field.label}</b>
                      </Form.Label>
                      <EditField
                        field={field}
                        value={editAdminAnswers[field.key]}
                        onChange={(value) => handleAdminEditChange(field.key, value)}
                      />
                    </Form.Group>
                  ))}
                </div>
              </div>
            )}
          </Form>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title={t('admin.submissions.deleteTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)} disabled={busy}>
              {t('admin.submissions.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleDelete} loading={busy}>
              {t('admin.submissions.actionDelete')}
            </SpinnerButton>
          </>
        }
      >
        {t('admin.submissions.deleteConfirm', {
          suffix: toDelete?.userEmail ? ` (${toDelete.userEmail})` : '',
        })}
      </CustomModal>

      <CustomModal
        show={showBulkDelete}
        onHide={() => setShowBulkDelete(false)}
        variant="cancel"
        title={t('admin.submissions.deleteTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowBulkDelete(false)} disabled={busy}>
              {t('admin.submissions.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleBulkDelete} loading={busy}>
              {t('admin.submissions.bulkDelete')}
            </SpinnerButton>
          </>
        }
      >
        {t('admin.submissions.deleteConfirm', { suffix: ` (${selectedIds.length})` })}
      </CustomModal>

      <CustomModal
        show={showNew}
        onHide={() => setShowNew(false)}
        variant="confirm"
        icon="plus"
        iconFill="#057c05"
        title={t('admin.submissions.newRegistration')}
        centered={false}
        size="xl"
        dialogClassName="camper-form-modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)} disabled={busy}>
              {t('admin.submissions.cancel')}
            </Button>
            <SpinnerButton variant="confirm" onClick={handleCreateManual} loading={busy}>
              {t('admin.submissions.create')}
            </SpinnerButton>
          </>
        }
      >
        <Form className="admin-submissions__new-grid">
          {hasPayment && (
            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.submissions.paymentStatus')}</b>
              </Form.Label>
              <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="">—</option>
                {PAYMENT_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {t(s.labelKey)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
          {fields.map((field) => (
            <Form.Group key={field.key} className="mb-3">
              <Form.Label>
                <b>{field.label}</b>
                {field.required && <span className="text-danger"> *</span>}
              </Form.Label>
              <EditField
                field={field}
                value={newAnswers[field.key]}
                onChange={(value) => setNewAnswers((prev) => ({ ...prev, [field.key]: value }))}
              />
            </Form.Group>
          ))}
        </Form>
      </CustomModal>

      <RefundModal
        submission={refundTarget}
        onHide={() => setRefundTarget(null)}
        onDone={loadSubmissions}
        loggedUsername={loggedUsername}
      />

      <Loading loading={busy} />
    </div>
  );
};

AdminSubmissions.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminSubmissions;
