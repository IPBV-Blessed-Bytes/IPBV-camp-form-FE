import { useEffect, useMemo, useState } from 'react';
import { Table, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  listSubmissions,
  getSubmissionsByOrder,
  checkinSubmission,
  checkinOrder,
} from '@/services/submissions';
import { parseCheckoutQr } from '@/utils/checkinQr';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import QrScannerModal from '@/components/Global/QrScannerModal';
import CheckinReviewModal from '@/components/Global/CheckinReviewModal';

const mapPerson = (submission) => ({
  id: submission.id,
  name: submission.answers?.nome || '',
  cpf: submission.answers?.cpf || '',
  checkin: submission.checkin,
  paymentStatus: submission.paymentStatus,
});

const AdminCheckinSubmissions = ({ loggedUsername }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderInput, setOrderInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewPeople, setReviewPeople] = useState([]);
  const [approving, setApproving] = useState(false);

  scrollUp();

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

  useEffect(() => {
    load();
  }, []);

  const statItems = useMemo(() => {
    const total = submissions.length;
    const done = submissions.filter((s) => s.checkin).length;
    return [
      { label: 'Inscrições', value: total, tone: 'accent' },
      { label: 'Check-in feito', value: done, tone: 'used' },
      { label: 'Pendentes', value: total - done, tone: 'available' },
    ];
  }, [submissions]);

  const openReview = async (orderNumber) => {
    if (!orderNumber) return;
    try {
      const people = await getSubmissionsByOrder(orderNumber);
      if (!people.length) {
        toast.error(`Nenhuma inscrição encontrada para o pedido ${orderNumber}.`);
        return;
      }
      setReviewOrder(orderNumber);
      setReviewPeople(people.map(mapPerson));
    } catch {
      toast.error('Erro ao buscar o pedido.');
    }
  };

  const handleScan = (text) => {
    setShowScanner(false);
    const orderNumber = parseCheckoutQr(text);
    if (!orderNumber) {
      toast.error('QR inválido para check-in.');
      return;
    }
    openReview(orderNumber);
  };

  const refreshReview = async (orderNumber) => {
    const people = await getSubmissionsByOrder(orderNumber);
    setReviewPeople(people.map(mapPerson));
    await load();
  };

  const approveOne = async (person) => {
    setApproving(true);
    try {
      await checkinSubmission(person.id, true);
      registerLog(`Fez check-in de ${person.name || person.cpf} (pedido ${reviewOrder})`, loggedUsername);
      await refreshReview(reviewOrder);
    } catch {
      toast.error('Erro ao fazer check-in.');
    } finally {
      setApproving(false);
    }
  };

  const approveAll = async () => {
    setApproving(true);
    try {
      await checkinOrder(reviewOrder);
      registerLog(`Fez check-in de todo o pedido ${reviewOrder}`, loggedUsername);
      await refreshReview(reviewOrder);
    } catch {
      toast.error('Erro ao fazer check-in do pedido.');
    } finally {
      setApproving(false);
    }
  };

  const toggleRow = async (submission) => {
    try {
      await checkinSubmission(submission.id, !submission.checkin);
      const name = submission.answers?.nome || submission.answers?.cpf || `#${submission.id}`;
      registerLog(`${submission.checkin ? 'Desfez' : 'Fez'} check-in de ${name}`, loggedUsername);
      await load();
    } catch {
      toast.error('Erro ao atualizar o check-in.');
    }
  };

  return (
    <div className="admin-subpage admin-subpage--checkin">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Check-in"
        subtitle="Escaneie o QR do pedido (família) ou faça check-in individual pela lista."
        typeIcon="camera"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <StatCards items={statItems} />

            <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
              <Button variant="teal-blue" onClick={() => setShowScanner(true)}>
                <Icons typeIcon="camera" iconSize={18} fill="#fff" /> Escanear QR do pedido
              </Button>
              <Form.Group>
                <Form.Label className="small mb-1">Ou informe o nº do pedido</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nº do pedido"
                  />
                  <Button variant="outline-teal-blue" onClick={() => openReview(orderInput)}>
                    Buscar
                  </Button>
                </InputGroup>
              </Form.Group>
            </div>

            <div className="admin-table-card">
              <Table striped bordered hover responsive className="custom-table">
                <thead>
                  <tr>
                    <th className="table-cells-header">Inscrito:</th>
                    <th className="table-cells-header">CPF:</th>
                    <th className="table-cells-header">Pedido:</th>
                    <th className="table-cells-header">Check-in:</th>
                    <th className="table-cells-header">Ação:</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-start text-secondary p-4">
                        Nenhuma inscrição
                      </td>
                    </tr>
                  ) : (
                    submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>{submission.answers?.nome || '—'}</td>
                        <td>{submission.answers?.cpf || '—'}</td>
                        <td>{submission.orderNumber || '—'}</td>
                        <td>
                          {submission.checkin ? (
                            <Badge bg="success">Presente</Badge>
                          ) : (
                            <Badge bg="secondary">Pendente</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={submission.checkin ? 'outline-secondary' : 'outline-teal-blue'}
                            onClick={() => toggleRow(submission)}
                          >
                            {submission.checkin ? 'Desfazer' : 'Check-in'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>

      <QrScannerModal show={showScanner} onHide={() => setShowScanner(false)} onScan={handleScan} />
      <CheckinReviewModal
        show={Boolean(reviewOrder)}
        onHide={() => setReviewOrder(null)}
        orderNumber={reviewOrder}
        submissions={reviewPeople}
        onApprove={approveOne}
        onApproveAll={approveAll}
        approving={approving}
      />
    </div>
  );
};

AdminCheckinSubmissions.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminCheckinSubmissions;
