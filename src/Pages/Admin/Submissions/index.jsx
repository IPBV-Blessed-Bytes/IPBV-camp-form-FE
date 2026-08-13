import { useEffect, useMemo, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import useEventSchema from '@/hooks/useEventSchema';
import { listSubmissions } from '@/services/submissions';
import { getEventSlug } from '@/config/eventScope';
import { downloadSingleSheet } from '@/utils/excelExport';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import './style.scss';

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

const AdminSubmissions = ({ loggedUsername }) => {
  const slug = useMemo(() => getEventSlug(), []);
  const { fields, loading: schemaLoading } = useEventSchema();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setSubmissions(await listSubmissions());
      } catch {
        toast.error('Erro ao carregar as inscrições.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExport = () => {
    if (!submissions.length) return;
    const rows = submissions.map((submission) => {
      const row = { Data: formatDate(submission.createdAt), 'E-mail': submission.userEmail || '—' };
      fields.forEach((field) => {
        row[field.label] = formatValue(field, submission.answers?.[field.key]);
      });
      return row;
    });
    const headers = ['Data', 'E-mail', ...fields.map((f) => f.label)];
    downloadSingleSheet({ filename: `inscricoes-${slug}.xlsx`, sheetName: 'Inscrições', rows, headers });
  };

  const isLoading = loading || schemaLoading;

  return (
    <div className="admin-submissions">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Inscrições"
        subtitle={`Respostas do evento: ${slug}`}
        typeIcon="add-person"
      />

      <div className="admin-submissions__content">
        <div className="admin-submissions__toolbar">
          <span className="admin-submissions__count">{submissions.length} inscrições</span>
          <Button variant="teal-blue" onClick={handleExport} disabled={!submissions.length}>
            Exportar Excel
          </Button>
        </div>

        {isLoading ? (
          <Loading loading />
        ) : submissions.length === 0 ? (
          <p className="admin-submissions__empty">Nenhuma inscrição recebida ainda.</p>
        ) : (
          <div className="admin-submissions__table-wrap">
            <Table hover responsive className="admin-submissions__table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>E-mail</th>
                  {fields.map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{formatDate(submission.createdAt)}</td>
                    <td>{submission.userEmail || '—'}</td>
                    {fields.map((field) => (
                      <td key={field.key}>{formatValue(field, submission.answers?.[field.key])}</td>
                    ))}
                    <td>
                      <Button size="sm" variant="outline-teal-blue" onClick={() => setSelected(submission)}>
                        Detalhes
                      </Button>
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
            {fields.map((field) => (
              <div key={field.key} className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-bold">{field.label}</span>
                <span>{formatValue(field, selected.answers?.[field.key])}</span>
              </div>
            ))}
          </div>
        )}
      </CustomModal>
    </div>
  );
};

AdminSubmissions.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminSubmissions;
