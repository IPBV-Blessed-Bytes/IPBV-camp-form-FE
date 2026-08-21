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

  const handleApprove = async (request) => {
    setLoading(true);
    try {
      await approveChangeRequest(request.id);
      toast.success('Solicitação aprovada');
      registerLog(`Aprovou alteração da inscrição ${request.camperName || request.camperId}`, loggedUsername);
      fetchRequests();
    } catch (error) {
      toast.error('Erro ao aprovar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (request) => {
    setLoading(true);
    try {
      await rejectChangeRequest(request.id);
      toast.success('Solicitação rejeitada');
      registerLog(`Rejeitou alteração da inscrição ${request.camperName || request.camperId}`, loggedUsername);
      fetchRequests();
    } catch (error) {
      toast.error('Erro ao rejeitar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const proposed = (request) => {
    const p = request.payload?.personalInformation || {};
    const c = request.payload?.contact || {};
    return [
      p.name && `Nome: ${p.name}`,
      p.rg && `RG: ${p.rg}`,
      p.gender && `Gênero: ${p.gender}`,
      c.cellPhone && `Celular: ${c.cellPhone}`,
      c.email && `E-mail: ${c.email}`,
      c.church && `Igreja: ${c.church}`,
      c.allergy && `Alergia: ${c.allergy}`,
    ]
      .filter(Boolean)
      .join(' · ');
  };

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
                        {isPending ? (
                          <>
                            <Button variant="outline-success" className="me-2" onClick={() => handleApprove(request)}>
                              Aprovar
                            </Button>
                            <Button variant="outline-danger" onClick={() => handleReject(request)}>
                              Rejeitar
                            </Button>
                          </>
                        ) : (
                          <span className="text-secondary small">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminChangeRequests.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminChangeRequests;
