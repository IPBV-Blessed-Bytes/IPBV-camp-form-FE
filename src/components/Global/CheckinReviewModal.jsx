import { Row, Col, Button, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useState } from 'react';
import CustomModal from '@/components/Global/CustomModal';
import { formatValue } from '@/form/dynamic/formatAnswer';

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

const PAYMENT_LABEL = { paid: 'Pago', pending: 'Pendente', refunded: 'Reembolsado', cancelled: 'Cancelado' };
const PAYMENT_METHOD_LABEL = { credit_card: 'Cartão de Crédito', creditCard: 'Cartão de Crédito', pix: 'PIX', boleto: 'Boleto', ticket: 'Boleto' };

const formatBrl = (cents) =>
  cents == null ? null : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DetailRow = ({ label, value }) => (
  <div className="d-flex justify-content-between gap-3 py-1 border-bottom">
    <span className="text-secondary small">{label}</span>
    <span className="small text-end fw-medium">{value}</span>
  </div>
);

DetailRow.propTypes = { label: PropTypes.string, value: PropTypes.node };

const CheckinReviewModal = ({
  show,
  onHide,
  orderNumber,
  submissions = [],
  fields = [],
  onApprove,
  onApproveAll,
  onUndo,
  approving,
}) => {
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const pending = submissions.filter((submission) => !submission.checkin);

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
            Clique em cada inscrito para ver os dados. Aprove individualmente ou use &quot;Aprovar todos&quot; quando
            todos estiverem presentes.
          </p>

          <Row className="g-3">
            {submissions.map((submission) => {
              const isExpanded = expanded.has(submission.id);
              return (
                <Col xs={12} md={isExpanded ? 12 : 6} key={submission.id}>
                  <div className={`border rounded p-3 h-100 ${submission.checkin ? 'border-success' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <strong>{submission.name || 'Sem nome'}</strong>
                      {submission.checkin ? <Badge bg="success">Presente</Badge> : <Badge bg="secondary">Pendente</Badge>}
                    </div>
                    <div className="text-secondary small">{formatCpf(submission.cpf)}</div>

                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 mt-1 text-decoration-none"
                      onClick={() => toggle(submission.id)}
                    >
                      {isExpanded ? '▲ fechar' : '▼ ver dados'}
                    </button>

                    {isExpanded && (
                      <div className="mt-2">
                        {fields.map((field) => (
                          <DetailRow
                            key={field.key}
                            label={field.label}
                            value={formatValue(field, submission.answers?.[field.key])}
                          />
                        ))}
                        {submission.paymentStatus && (
                          <DetailRow
                            label="Pagamento"
                            value={PAYMENT_LABEL[submission.paymentStatus] || submission.paymentStatus}
                          />
                        )}
                        {submission.paymentMethod && (
                          <DetailRow
                            label="Forma de pagamento"
                            value={PAYMENT_METHOD_LABEL[submission.paymentMethod] || submission.paymentMethod}
                          />
                        )}
                        {formatBrl(submission.totalCents) && (
                          <DetailRow label="Valor" value={formatBrl(submission.totalCents)} />
                        )}
                      </div>
                    )}

                    {submission.checkin ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100 mt-3"
                        disabled={approving}
                        onClick={() => onUndo(submission)}
                      >
                        Desfazer check-in
                      </Button>
                    ) : (
                      <Button
                        variant="outline-teal-blue"
                        size="sm"
                        className="w-100 mt-3"
                        disabled={approving}
                        onClick={() => onApprove(submission)}
                      >
                        Aprovar
                      </Button>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>

          <div className="d-grid mt-4">
            <Button
              variant="teal-blue"
              size="lg"
              onClick={() => setConfirmingAll(true)}
              disabled={approving || pending.length === 0}
            >
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
  fields: PropTypes.array,
  onApprove: PropTypes.func.isRequired,
  onApproveAll: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  approving: PropTypes.bool,
};

export default CheckinReviewModal;
