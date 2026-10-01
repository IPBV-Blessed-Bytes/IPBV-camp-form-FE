import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import useEventSchema from '@/hooks/useEventSchema';
import { formatValue } from '@/form/dynamic/formatAnswer';
import { listSubmissions, updateSubmission, deleteSubmission } from '@/services/submissions';
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
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editAnswers, setEditAnswers] = useState({});
  const [editAdminAnswers, setEditAdminAnswers] = useState({});
  const [adminFields, setAdminFields] = useState([]);
  const [editStatus, setEditStatus] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [refundTarget, setRefundTarget] = useState(null);

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
    const term = search.trim().toLowerCase();
    if (!term) return submissions;
    return submissions.filter((submission) => {
      const haystack = [
        submission.userEmail || '',
        ...fields.map((field) => formatValue(field, submission.answers?.[field.key])),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [submissions, fields, search]);

  const isLoading = loading || schemaLoading;

  return (
    <div className="admin-subpage admin-submissions">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.submissions.title')}
        subtitle={t('admin.submissions.subtitle', { event: eventName })}
        typeIcon="add-person"
      />

      <div className="admin-submissions__content">
        <StatCards items={statItems} />

        <div className="admin-submissions__toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.submissions.searchPlaceholder')} />
          <Button variant="teal-blue" onClick={handleExport} disabled={!submissions.length}>
            {t('admin.submissions.exportExcel')}
          </Button>
        </div>

        {isLoading ? (
          <Loading loading />
        ) : submissions.length === 0 ? (
          <p className="admin-submissions__empty">{t('admin.submissions.emptyNone')}</p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="admin-submissions__empty">{t('admin.submissions.emptyFiltered')}</p>
        ) : (
          <div className="admin-submissions__table-wrap">
            <Table hover responsive className="admin-submissions__table">
              <thead>
                <tr>
                  <th>{t('admin.submissions.colData')}</th>
                  <th>{t('admin.submissions.colEmail')}</th>
                  {hasPayment && <th>{t('admin.submissions.colStatus')}</th>}
                  {fields.map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                  {adminFields.map((field) => (
                    <th key={`adm-${field.key}`} className="admin-submissions__admin-col">
                      {field.label}
                    </th>
                  ))}
                  <th>{t('admin.submissions.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
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
                    <td>
                      <div className="admin-submissions__actions">
                        <Button size="sm" variant="outline-teal-blue" onClick={() => setSelected(submission)}>
                          {t('admin.submissions.actionDetails')}
                        </Button>
                        <Button size="sm" variant="outline-success" onClick={() => openEdit(submission)}>
                          {t('admin.submissions.actionEdit')}
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => setToDelete(submission)}>
                          {t('admin.submissions.actionDelete')}
                        </Button>
                        {submission.paymentStatus === 'paid' && Number(submission.totalCents) > 0 && (
                          <Button size="sm" variant="outline-warning" onClick={() => setRefundTarget(submission)}>
                            {t('admin.submissions.actionRefund')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      <CustomModal
        show={Boolean(selected)}
        onHide={() => setSelected(null)}
        variant="info"
        title={t('admin.submissions.detailTitle')}
        icon="add-person"
      >
        {selected && (
          <div className="admin-submissions__detail">
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="fw-bold">{t('admin.submissions.colData')}</span>
              <span>{formatDate(selected.createdAt)}</span>
            </div>
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="fw-bold">{t('admin.submissions.colEmail')}</span>
              <span>{selected.userEmail || '—'}</span>
            </div>
            {hasPayment && (
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-bold">{t('admin.submissions.paymentStatus')}</span>
                <span>{statusLabel(selected.paymentStatus) || selected.paymentStatus || '—'}</span>
              </div>
            )}
            {fields.map((field) => (
              <div key={field.key} className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-bold">{field.label}</span>
                <span>{renderFieldValue(field, selected.answers?.[field.key], t)}</span>
              </div>
            ))}
            {adminFields.map((field) => (
              <div key={`adm-${field.key}`} className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-bold">
                  {field.label} <span className="admin-submissions__admin-tag">{t('admin.submissions.adminTag')}</span>
                </span>
                <span>{formatValue(field, selected.adminAnswers?.[field.key])}</span>
              </div>
            ))}
          </div>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(editing)}
        onHide={() => setEditing(null)}
        variant="confirm"
        icon="edit"
        iconFill="#057c05"
        title={t('admin.submissions.editTitle')}
        centered={false}
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
          <Form className="admin-submissions__edit">
            {hasPayment && (
              <Form.Group className="mb-3">
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
              <Form.Group key={field.key} className="mb-3">
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
            {adminFields.length > 0 && (
              <div className="admin-submissions__admin-section">
                <p className="admin-submissions__admin-section-title">{t('admin.submissions.adminFields')}</p>
                {adminFields.map((field) => (
                  <Form.Group key={`adm-${field.key}`} className="mb-3">
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
