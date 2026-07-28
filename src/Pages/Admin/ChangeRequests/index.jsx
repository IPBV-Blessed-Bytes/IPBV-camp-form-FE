import { useState, useEffect } from 'react';
import { Button, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { registerLog } from '@/services/logs';
import { getChangeRequests, approveChangeRequest, rejectChangeRequest } from '@/services/changeRequests';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import SectionHeader from '@/components/Admin/SectionHeader';

const AdminChangeRequests = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

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

  return (
    <div className="admin-subpage admin-subpage--change-requests">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Solicitações de Alteração"
        subtitle="Aprove ou rejeite alterações solicitadas pelos usuários"
        typeIcon="edit"
      />

      <div className="admin-subpage__content">
        <SectionHeader title="Pendentes" count={requests.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Campista:</th>
                <th className="table-cells-header">Alterações solicitadas:</th>
                <th className="table-cells-header">Enviada em:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-secondary">
                    Nenhuma solicitação pendente.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <em>{request.camperName || `#${request.camperId}`}</em>
                    </td>
                    <td className="small">{proposed(request) || <span className="text-secondary">—</span>}</td>
                    <td className="small">
                      {request.createdAt ? new Date(request.createdAt).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td>
                      <Button variant="outline-success" className="me-2" onClick={() => handleApprove(request)}>
                        Aprovar
                      </Button>
                      <Button variant="outline-danger" onClick={() => handleReject(request)}>
                        Rejeitar
                      </Button>
                    </td>
                  </tr>
                ))
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
