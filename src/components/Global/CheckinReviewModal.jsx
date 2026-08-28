import { useState } from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
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

const CheckinReviewModal = ({ show, onHide, orderNumber, campers = [], onApprove, onApproveAll, approving }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [confirmingAll, setConfirmingAll] = useState(false);

  const pending = campers.filter((camper) => !camper.checkin);

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      variant="info"
      icon="camera"
      title={`Check-in do Pedido ${orderNumber}`}
      size="lg"
    >
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
            {campers.map((camper) => {
              const isExpanded = expandedId === camper.id;
              return (
                <Col xs={12} md={4} key={camper.id}>
                  <div className={`border rounded p-3 h-100 ${camper.checkin ? 'border-success' : ''}`}>
                    <div role="button" tabIndex={0} onClick={() => setExpandedId(isExpanded ? null : camper.id)}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <strong>{camper.personalInformation?.name || 'Sem nome'}</strong>
                        {camper.checkin ? <Badge bg="success">Presente</Badge> : <Badge bg="secondary">Pendente</Badge>}
                      </div>
                      <div className="text-secondary small">{formatCpf(camper.personalInformation?.cpf)}</div>
                      {isExpanded && (
                        <div className="small mt-2 text-secondary">
                          <div>Nascimento: {camper.personalInformation?.birthday || '—'}</div>
                          <div>Telefone: {camper.contact?.cellPhone || '—'}</div>
                          <div>Hospedagem: {camper.camperPackage?.accomodationName || '—'}</div>
                          <div>Transporte: {camper.camperPackage?.transportationName || '—'}</div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant={camper.checkin ? 'success' : 'outline-teal-blue'}
                      size="sm"
                      className="w-100 mt-3"
                      disabled={camper.checkin || approving}
                      onClick={() => onApprove(camper)}
                    >
                      {camper.checkin ? 'Check-in feito' : 'Aprovar'}
                    </Button>
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
  campers: PropTypes.array,
  onApprove: PropTypes.func.isRequired,
  onApproveAll: PropTypes.func.isRequired,
  approving: PropTypes.bool,
};

export default CheckinReviewModal;
