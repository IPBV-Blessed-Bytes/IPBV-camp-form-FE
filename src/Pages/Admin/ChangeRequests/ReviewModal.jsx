import { useState, useEffect } from 'react';
import { Button, Form, Badge, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';
import { buildChangeDiff } from './diff';

const REQ_STATUS = {
  PENDING: { label: 'Pendente', bg: 'warning' },
  APPROVED: { label: 'Aprovada', bg: 'success' },
  REJECTED: { label: 'Rejeitada', bg: 'danger' },
};

const ReviewModal = ({ show, onHide, request, onApprove, onReject, processing }) => {
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState(false);

  useEffect(() => {
    setNote('');
    setNoteError(false);
  }, [request?.id]);

  if (!request) return null;

  const status = REQ_STATUS[request.status] || { label: request.status, bg: 'secondary' };
  const isPending = request.status === 'PENDING';
  const diffs = buildChangeDiff(request);

  const handleApprove = () => onApprove(note.trim());
  const handleReject = () => {
    if (!note.trim()) {
      setNoteError(true);
      return;
    }
    onReject(note.trim());
  };

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      variant="info"
      icon="edit"
      iconFill="none"
      title={`Revisar alteração — ${request.camperName || `#${request.camperId}`}`}
      size="lg"
      footer={
        isPending ? (
          <>
            <Button variant="secondary" onClick={onHide} disabled={processing}>
              Fechar
            </Button>
            <Button variant="outline-danger" onClick={handleReject} disabled={processing}>
              Rejeitar
            </Button>
            <Button variant="teal-blue" onClick={handleApprove} disabled={processing}>
              Aprovar
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onHide}>
            Fechar
          </Button>
        )
      }
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="text-secondary small">Status:</span>
        <Badge bg={status.bg} text={status.bg === 'warning' ? 'dark' : undefined}>
          {status.label}
        </Badge>
      </div>

      <h6 className="account-edit__section">
        <b>Justificativa do usuário:</b>
      </h6>
      <p className="mb-3">
        <em>
          {request.justification ? request.justification : <span className="text-secondary">— (não informada)</span>}
        </em>
      </p>

      <h6 className="account-edit__section mt-4"><b>Alterações solicitadas:</b></h6>
      {diffs.length === 0 ? (
        <p className="text-secondary">Nenhuma alteração de campo detectada.</p>
      ) : (
        <div className="change-diff">
          {diffs.map((d) => (
            <div key={d.label} className="change-diff__row">
              <div className="change-diff__label">{d.label}</div>
              <div className="change-diff__values">
                <span className="change-diff__before">{d.before || '(vazio)'}</span>
                <span className="change-diff__arrow"> → </span>
                <span className="change-diff__after">{d.after || '(vazio)'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPending ? (
        <>
          <h6 className="account-edit__section mt-3">Resposta ao usuário</h6>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={2}
              value={note}
              isInvalid={noteError}
              onChange={(e) => {
                setNote(e.target.value);
                if (e.target.value.trim()) setNoteError(false);
              }}
              placeholder="Mensagem enviada ao usuário. Obrigatória ao rejeitar (ex.: motivo da recusa); opcional ao aprovar."
            />
            <Form.Control.Feedback type="invalid">Informe o motivo da recusa para rejeitar.</Form.Control.Feedback>
          </Form.Group>
        </>
      ) : (
        request.reviewNote && (
          <Alert variant="secondary" className="mt-3 mb-0 py-2 small">
            <strong>Resposta enviada ao usuário:</strong> {request.reviewNote}
          </Alert>
        )
      )}
    </CustomModal>
  );
};

ReviewModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  request: PropTypes.object,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  processing: PropTypes.bool,
};

export default ReviewModal;
