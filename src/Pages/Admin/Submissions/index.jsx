import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import useEventSchema from '@/hooks/useEventSchema';
import { listSubmissions, updateSubmission, deleteSubmission } from '@/services/submissions';
import { getEventSlug } from '@/config/eventScope';
import { downloadSingleSheet } from '@/utils/excelExport';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import './style.scss';

const PAYMENT_STATUS = [
  { value: 'pending', label: 'Pendente', bg: 'warning', text: 'dark' },
  { value: 'paid', label: 'Pago', bg: 'success' },
  { value: 'cancelled', label: 'Cancelado', bg: 'secondary' },
];

const paymentMeta = (value) => PAYMENT_STATUS.find((s) => s.value === value);

const formatValue = (field, value) => {
  if (value == null || value === '') return '—';
  if (field.type === 'consent') return value ? 'Sim' : 'Não';
  if (field.type === 'checkbox') {
    const labels = (field.options || []).filter((o) => (value || []).includes(o.value)).map((o) => o.label);
    return labels.length ? labels.join(', ') : '—';
  }
  if (field.type === 'select' || field.type === 'radio') {
    return (field.options || []).find((o) => o.value === value)?.label || value;
  }
  return String(value);
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR');
};

const EditField = ({ field, value, onChange }) => {
  if (field.type === 'textarea') {
    return <Form.Control as="textarea" rows={2} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === 'number') {
    return <Form.Control type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === 'select' || field.type === 'radio') {
    return (
      <Form.Select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecione</option>
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
      <Form.Check type="switch" label="Aceito" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
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
  const slug = useMemo(() => getEventSlug(), []);
  const { fields, loading: schemaLoading } = useEventSchema();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editAnswers, setEditAnswers] = useState({});
  const [editStatus, setEditStatus] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      setSubmissions(await listSubmissions());
    } catch {
      toast.error('Erro ao carregar as inscrições.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const hasPayment = useMemo(() => submissions.some((s) => s.paymentStatus != null), [submissions]);

  const openEdit = (submission) => {
    setEditing(submission);
    setEditAnswers({ ...(submission.answers || {}) });
    setEditStatus(submission.paymentStatus || '');
  };

  const handleEditChange = (key, value) => setEditAnswers((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const payload = { answers: editAnswers };
      if (hasPayment || editStatus) payload.paymentStatus = editStatus || null;
      await updateSubmission(editing.id, payload);
      toast.success('Inscrição atualizada com sucesso.');
      setEditing(null);
      await loadSubmissions();
    } catch {
      toast.error('Erro ao atualizar a inscrição.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteSubmission(toDelete.id);
      toast.success('Inscrição excluída com sucesso.');
      setToDelete(null);
      await loadSubmissions();
    } catch {
      toast.error('Erro ao excluir a inscrição.');
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    if (!submissions.length) return;
    const rows = submissions.map((submission) => {
      const row = { Data: formatDate(submission.createdAt), 'E-mail': submission.userEmail || '—' };
      if (hasPayment) row['Status'] = paymentMeta(submission.paymentStatus)?.label || submission.paymentStatus || '—';
      fields.forEach((field) => {
        row[field.label] = formatValue(field, submission.answers?.[field.key]);
      });
      return row;
    });
    const headers = [
      'Data',
      'E-mail',
      ...(hasPayment ? ['Status'] : []),
      ...fields.map((f) => f.label),
    ];
    downloadSingleSheet({ filename: `inscricoes-${slug}.xlsx`, sheetName: 'Inscrições', rows, headers });
  };

  const statItems = useMemo(() => {
    const identified = submissions.filter((submission) => submission.userEmail).length;
    const today = new Date().toDateString();
    const todayCount = submissions.filter((submission) => {
      const date = new Date(submission.createdAt);
      return !Number.isNaN(date.getTime()) && date.toDateString() === today;
    }).length;
    const items = [
      { label: 'Total de inscrições', value: submissions.length },
      { label: 'Identificadas (e-mail)', value: identified, tone: 'info' },
      { label: 'Recebidas hoje', value: todayCount, tone: 'accent' },
    ];
    if (hasPayment) {
      const paid = submissions.filter((s) => s.paymentStatus === 'paid').length;
      items.push({ label: 'Pagas', value: paid, tone: 'free' });
    }
    return items;
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
        title="Inscrições"
        subtitle={`Respostas do evento: ${slug}`}
        typeIcon="add-person"
      />

      <div className="admin-submissions__content">
        <StatCards items={statItems} />

        <div className="admin-submissions__toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar inscrições..." />
          <Button variant="teal-blue" onClick={handleExport} disabled={!submissions.length}>
            Exportar Excel
          </Button>
        </div>

        {isLoading ? (
          <Loading loading />
        ) : submissions.length === 0 ? (
          <p className="admin-submissions__empty">Nenhuma inscrição recebida ainda.</p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="admin-submissions__empty">Nenhuma inscrição encontrada.</p>
        ) : (
          <div className="admin-submissions__table-wrap">
            <Table hover responsive className="admin-submissions__table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>E-mail</th>
                  {hasPayment && <th>Status</th>}
                  {fields.map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                  <th>Ações</th>
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
                            {paymentMeta(submission.paymentStatus)?.label || submission.paymentStatus}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    {fields.map((field) => (
                      <td key={field.key}>{formatValue(field, submission.answers?.[field.key])}</td>
                    ))}
                    <td>
                      <div className="admin-submissions__actions">
                        <Button size="sm" variant="outline-teal-blue" onClick={() => setSelected(submission)}>
                          Detalhes
                        </Button>
                        <Button size="sm" variant="outline-success" onClick={() => openEdit(submission)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => setToDelete(submission)}>
                          Excluir
                        </Button>
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
        title="Detalhes da inscrição"
        icon="add-person"
      >
        {selected && (
          <div className="admin-submissions__detail">
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="fw-bold">Data</span>
              <span>{formatDate(selected.createdAt)}</span>
            </div>
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="fw-bold">E-mail</span>
              <span>{selected.userEmail || '—'}</span>
            </div>
            {hasPayment && (
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-bold">Status de pagamento</span>
                <span>{paymentMeta(selected.paymentStatus)?.label || selected.paymentStatus || '—'}</span>
              </div>
            )}
            {fields.map((field) => (
              <div key={field.key} className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-bold">{field.label}</span>
                <span>{formatValue(field, selected.answers?.[field.key])}</span>
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
        title="Editar inscrição"
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSave} disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </>
        }
      >
        {editing && (
          <Form className="admin-submissions__edit">
            {hasPayment && (
              <Form.Group className="mb-3">
                <Form.Label>
                  <b>Status de pagamento</b>
                </Form.Label>
                <Form.Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="">—</option>
                  {PAYMENT_STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
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
          </Form>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title="Confirmar exclusão"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              {busy ? 'Excluindo…' : 'Excluir'}
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir esta inscrição{toDelete?.userEmail ? ` (${toDelete.userEmail})` : ''}? Esta ação
        não pode ser desfeita.
      </CustomModal>

      <Loading loading={busy} />
    </div>
  );
};

AdminSubmissions.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminSubmissions;
