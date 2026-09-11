import { useState } from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';
import { listWristbands } from '@/services/wristbands';

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

const normalizeText = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .trim();

const paymentLabel = (formPayment) => {
  if (formPayment === 'creditCard') return 'Cartão de Crédito';
  if (formPayment === 'pix') return 'PIX';
  if (formPayment === 'ticket') return 'Boleto Bancário';
  return 'Não Pagante';
};

const buildWristbands = (bands, foodName, teamName) => {
  const active = (bands || []).filter((band) => band.active);
  const teamBands = active.filter((band) => band.type === 'TEAM');
  const foodBands = active.filter((band) => band.type === 'FOOD');
  const wristbands = [];
  if (foodName) {
    const matched = foodBands.find((band) => normalizeText(band.label) === normalizeText(foodName));
    wristbands.push({ id: 'food', label: matched?.label || '', color: matched?.color || '' });
  }
  if (teamName) {
    const matched = teamBands.find((band) => normalizeText(band.label) === normalizeText(teamName));
    wristbands.push({ id: 'team', label: matched?.label || '', color: matched?.color || '' });
  }
  return wristbands;
};

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

const CheckinReviewModal = ({
  show,
  onHide,
  orderNumber,
  campers = [],
  rooms = [],
  onApprove,
  onApproveAll,
  onUndo,
  approving,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [wristbandsByCamper, setWristbandsByCamper] = useState({});

  const pending = campers.filter((camper) => !camper.checkin);

  const roomNameFor = (cpf) => {
    const normalized = onlyDigits(cpf);
    if (!normalized) return '';
    const room = rooms.find((r) => (r.campers || []).some((c) => onlyDigits(c.cpf) === normalized));
    return room?.name || '';
  };

  const toggleExpand = async (camper) => {
    const willExpand = expandedId !== camper.id;
    setExpandedId(willExpand ? camper.id : null);
    if (willExpand && wristbandsByCamper[camper.id] === undefined) {
      try {
        const bands = await listWristbands({ userId: camper.id });
        setWristbandsByCamper((prev) => ({
          ...prev,
          [camper.id]: buildWristbands(bands, camper.package?.foodName, camper.teamName),
        }));
      } catch {
        setWristbandsByCamper((prev) => ({ ...prev, [camper.id]: [] }));
      }
    }
  };

  const detailRow = (label, value) => (
    <div className="d-flex justify-content-between gap-2 py-1 border-bottom">
      <span className="text-secondary">{label}</span>
      <span className="fw-semibold text-end">{value || '—'}</span>
    </div>
  );

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
            Toque em cada inscrito para ver os dados (pagamento, hospedagem, time, pulseira) e aprove o check-in. Use
            &quot;Aprovar todos&quot; apenas quando todos estiverem presentes.
          </p>

          <Row className="g-3">
            {campers.map((camper) => {
              const isExpanded = expandedId === camper.id;
              const bands = wristbandsByCamper[camper.id];
              return (
                <Col xs={12} md={isExpanded ? 12 : 6} key={camper.id}>
                  <div className={`border rounded p-3 h-100 ${camper.checkin ? 'border-success' : ''}`}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpand(camper)}
                      title={isExpanded ? 'Toque para fechar' : 'Toque para ver os dados'}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <strong>{camper.personalInformation?.name || 'Sem nome'}</strong>
                        {camper.checkin ? <Badge bg="success">Presente</Badge> : <Badge bg="secondary">Pendente</Badge>}
                      </div>
                      <div className="text-secondary small">{formatCpf(camper.personalInformation?.cpf)}</div>
                      <div className="text-secondary text-center mt-1" style={{ fontSize: '0.75rem' }}>
                        {isExpanded ? '▲ fechar' : '▼ ver dados'}
                      </div>

                      {isExpanded && (
                        <div className="small mt-2">
                          {bands?.length > 0 && (
                            <div className="checkin-wristbands mb-2">
                              {bands.map((band) => (
                                <div key={band.id} className="checkin-wristbands__item">
                                  <span className="checkin-wristbands__label">
                                    {band.id === 'food' ? 'Pulseira Alimentação' : 'Pulseira Time'}
                                  </span>
                                  <span
                                    className="checkin-wristbands__swatch"
                                    style={{ background: band.color || 'transparent' }}
                                  />
                                  {band.label && <span className="checkin-wristbands__name">{band.label}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          {detailRow('Data de Nascimento', camper.personalInformation?.birthday)}
                          {detailRow('Forma de Pagamento', paymentLabel(camper.formPayment?.formPayment))}
                          {detailRow('Valor do Pagamento', camper.totalPrice)}
                          {detailRow('Hospedagem', camper.package?.accomodationName)}
                          {detailRow('Quarto', roomNameFor(camper.personalInformation?.cpf) || 'Não alocado')}
                          {detailRow('Alimentação', camper.package?.foodName)}
                          {detailRow('Time', camper.teamName || 'Time Não Selecionado')}
                          {detailRow('Observação da Equipe', camper.observation)}
                          {detailRow('Observação do Usuário', camper.finalObservation)}
                        </div>
                      )}
                    </div>
                    {camper.checkin ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100 mt-3"
                        disabled={approving}
                        onClick={() => onUndo?.(camper)}
                      >
                        Desfazer check-in
                      </Button>
                    ) : (
                      <Button
                        variant="outline-teal-blue"
                        size="sm"
                        className="w-100 mt-3"
                        disabled={approving}
                        onClick={() => onApprove(camper)}
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
  campers: PropTypes.array,
  rooms: PropTypes.array,
  onApprove: PropTypes.func.isRequired,
  onApproveAll: PropTypes.func.isRequired,
  onUndo: PropTypes.func,
  approving: PropTypes.bool,
};

export default CheckinReviewModal;
