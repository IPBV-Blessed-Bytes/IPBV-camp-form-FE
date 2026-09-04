import { Row, Col, Button, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useState } from 'react';
import CustomModal from '@/components/Global/CustomModal';

const formatCpf = (value) => {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11);
  if (!digits) return '';
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const PAYMENT_LABEL = { paid: 'Pago', pending: 'Pendente', refunded: 'Reembolsado' };

const CheckinReviewModal = ({ show, onHide, orderNumber, submissions = [], onApprove, onApproveAll, approving }) => {
  const [confirmingAll, setConfirmingAll] = useState(false);
  const pending = submissions.filter((submission) => !submission.checkin);

  return (
    <CustomModal show={show} onHide={onHide} variant="info" icon="camera" title={`Check-in do Pedido ${orderNumber}`} size="lg">
      {confirmingAll ? (
        <div className="text-center py-3">
          <p className="mb-3">
            Confirmar check-in de {pending.length} {pending.length === 1 ? 'inscrito pendente' : 'inscritos pendentes'}?
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="outline-secondary" onClick={() => setConfirmingAll(false)} disabled={approving}>
              Cancelar
            </Button>
            <Button
              variant="teal-blue"
              onClick={() => {
                onApproveAll();
                setConfirmingAll(false);
              }}
              disabled={approving}
            >
              Confirmar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-secondary small mb-3">
            Confira quem está presente e aprove o check-in individualmente. Use &quot;Aprovar todos&quot; apenas quando
            todos estiverem presentes.
          </p>

          <Row className="g-3">
            {submissions.map((submission) => (
              <Col xs={12} md={4} key={submission.id}>
                <div className={`border rounded p-3 h-100 ${submission.checkin ? 'border-success' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <strong>{submission.name || 'Sem nome'}</strong>
                    {submission.checkin ? <Badge bg="success">Presente</Badge> : <Badge bg="secondary">Pendente</Badge>}
                  </div>
                  <div className="text-secondary small">{formatCpf(submission.cpf)}</div>
                  {submission.paymentStatus && (
                    <div className="text-secondary small">
                      Pagamento: {PAYMENT_LABEL[submission.paymentStatus] || submission.paymentStatus}
                    </div>
                  )}
                  <Button
                    variant={submission.checkin ? 'success' : 'outline-teal-blue'}
                    size="sm"
                    className="w-100 mt-3"
                    disabled={submission.checkin || approving}
                    onClick={() => onApprove(submission)}
                  >
                    {submission.checkin ? 'Check-in feito' : 'Aprovar'}
                  </Button>
                </div>
              </Col>
            ))}
          </Row>

          <div className="d-grid mt-4">
            <Button variant="teal-blue" size="lg" onClick={() => setConfirmingAll(true)} disabled={approving || pending.length === 0}>
              {pending.length === 0 ? 'Todos com check-in' : `Aprovar todos (${pending.length})`}
            </Button>
          </div>
        </>
      )}
    </CustomModal>
  );
};

CheckinReviewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  orderNumber: PropTypes.string,
  submissions: PropTypes.array,
  onApprove: PropTypes.func.isRequired,
  onApproveAll: PropTypes.func.isRequired,
  approving: PropTypes.bool,
};

export default CheckinReviewModal;
