import { useState, useEffect } from 'react';
import { Button, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getChangeRequests, approveChangeRequest, rejectChangeRequest } from '@/services/changeRequests';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';
import ReviewModal from './ReviewModal';
import { buildChangeDiff } from './diff';

const REQ_STATUS = {
  PENDING: { label: 'Pendente', bg: 'warning' },
  APPROVED: { label: 'Aprovada', bg: 'success' },
  REJECTED: { label: 'Rejeitada', bg: 'danger' },
};

const AdminChangeRequests = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  scrollUp();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      setRequests(await getChangeRequests());
    } catch (error) {
      toast.error('Erro ao buscar solicitações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (note) => {
    if (!reviewTarget) return;
    setProcessing(true);
    try {
      await approveChangeRequest(reviewTarget.id, note);
      toast.success('Solicitação aprovada');
      registerLog(`Aprovou alteração da inscrição ${reviewTarget.camperName || reviewTarget.camperId}`, loggedUsername);
      setReviewTarget(null);
      fetchRequests();
    } catch (error) {
      toast.error('Erro ao aprovar solicitação');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (note) => {
    if (!reviewTarget) return;
    setProcessing(true);
    try {
      await rejectChangeRequest(reviewTarget.id, note);
      toast.success('Solicitação rejeitada');
      registerLog(`Rejeitou alteração da inscrição ${reviewTarget.camperName || reviewTarget.camperId}`, loggedUsername);
      setReviewTarget(null);
      fetchRequests();
    } catch (error) {
      toast.error('Erro ao rejeitar solicitação');
    } finally {
      setProcessing(false);
    }
  };

  const proposed = (request) =>
    buildChangeDiff(request)
      .map((d) => `${d.label}: ${d.after || '(vazio)'}`)
      .join(' · ');

  const statusOf = (request) => (request.status || 'PENDING').toUpperCase();
  const countBy = (status) => requests.filter((r) => statusOf(r) === status).length;
  const pendingCount = countBy('PENDING');
  const approvedCount = countBy('APPROVED');
  const rejectedCount = countBy('REJECTED');

  const statItems = [
    { label: 'Total de solicitações', value: requests.length },
    { label: 'Pendentes', value: pendingCount, tone: 'used' },
    { label: 'Aprovadas', value: approvedCount, tone: 'free' },
    { label: 'Rejeitadas', value: rejectedCount, tone: 'danger' },
  ];

  const statusChips = [
    { value: 'all', label: 'Todas', count: requests.length },
    { value: 'PENDING', label: 'Pendentes', count: pendingCount },
    { value: 'APPROVED', label: 'Aprovadas', count: approvedCount },
    { value: 'REJECTED', label: 'Rejeitadas', count: rejectedCount },
  ];

  const term = search.trim().toLowerCase();
  const filtered = requests.filter(
    (r) =>
      (statusFilter === 'all' || statusOf(r) === statusFilter) &&
      (!term || (r.camperName || `#${r.camperId}` || '').toLowerCase().includes(term)),
  );

  return (
    <div className="admin-subpage admin-subpage--change-requests">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Solicitações de Alteração"
        subtitle="Aprove ou rejeite alterações solicitadas pelos usuários"
        typeIcon="refresh"
      />

      <div className="admin-subpage__content">
        <StatCards items={statItems} />

        <div className="change-requests-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome do campista..." />
          <FilterChips options={statusChips} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <SectionHeader title="Solicitações" count={filtered.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Campista:</th>
                <th className="table-cells-header">Alterações solicitadas:</th>
                <th className="table-cells-header">Enviada em:</th>
                <th className="table-cells-header">Status:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-secondary">
                    Nenhuma solicitação encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((request) => {
                  const status = REQ_STATUS[statusOf(request)] || { label: statusOf(request), bg: 'secondary' };
                  const isPending = statusOf(request) === 'PENDING';
                  return (
                    <tr key={request.id}>
                      <td>
                        <em>{request.camperName || `#${request.camperId}`}</em>
                      </td>
                      <td className="small">{proposed(request) || <span className="text-secondary">—</span>}</td>
                      <td className="small">
                        {request.createdAt ? new Date(request.createdAt).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td>
                        <Badge bg={status.bg} text={status.bg === 'warning' ? 'dark' : undefined}>
                          {status.label}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant={isPending ? 'outline-teal-blue' : 'outline-secondary'}
                          onClick={() => setReviewTarget(request)}
                        >
                          {isPending ? 'Revisar' : 'Ver detalhes'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Loading loading={loading || processing} />
      </div>

      <ReviewModal
        show={Boolean(reviewTarget)}
        onHide={() => setReviewTarget(null)}
        request={reviewTarget}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={processing}
      />
    </div>
  );
};

AdminChangeRequests.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminChangeRequests;
