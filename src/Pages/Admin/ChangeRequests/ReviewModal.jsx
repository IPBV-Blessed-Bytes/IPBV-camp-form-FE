import { useState, useEffect } from 'react';
import { Button, Form, Badge, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';
import { buildChangeDiff } from './diff';

const STATUS_BG = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const STATUS_KEY = {
  PENDING: 'statusPending',
  APPROVED: 'statusApproved',
  REJECTED: 'statusRejected',
};

const ReviewModal = ({ show, onHide, request, onApprove, onReject, processing }) => {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState(false);

  useEffect(() => {
    setNote('');
    setNoteError(false);
  }, [request?.id]);

  if (!request) return null;

  const status = {
    label: STATUS_KEY[request.status] ? t(`admin.changeRequests.${STATUS_KEY[request.status]}`) : request.status,
    bg: STATUS_BG[request.status] || 'secondary',
  };
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
      title={t('admin.changeRequests.modalTitle', { camper: request.camperName || `#${request.camperId}` })}
      size="lg"
      footer={
        isPending ? (
          <>
            <Button variant="secondary" onClick={onHide} disabled={processing}>
              {t('admin.changeRequests.close')}
            </Button>
            <Button variant="outline-danger" onClick={handleReject} disabled={processing}>
              {t('admin.changeRequests.reject')}
            </Button>
            <Button variant="teal-blue" onClick={handleApprove} disabled={processing}>
              {t('admin.changeRequests.approve')}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onHide}>
            {t('admin.changeRequests.close')}
          </Button>
        )
      }
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="text-secondary small">{t('admin.changeRequests.statusLabel')}</span>
        <Badge bg={status.bg} text={status.bg === 'warning' ? 'dark' : undefined}>
          {status.label}
        </Badge>
      </div>

      <h6 className="account-edit__section">
        <b>{t('admin.changeRequests.justificationHeading')}</b>
      </h6>
      <p className="mb-3">
        <em>
          {request.justification ? request.justification : <span className="text-secondary">{t('admin.changeRequests.noJustification')}</span>}
        </em>
      </p>

      <h6 className="account-edit__section mt-4">
        <b>{t('admin.changeRequests.changesHeading')}</b>
      </h6>
      {diffs.length === 0 ? (
        <p className="text-secondary">{t('admin.changeRequests.noChanges')}</p>
      ) : (
        <div className="change-diff">
          {diffs.map((d) => (
            <div key={d.label} className="change-diff__row">
              <div className="change-diff__label">{d.label}</div>
              <div className="change-diff__values">
                <span className="change-diff__before">{d.before || t('admin.changeRequests.empty')}</span>
                <span className="change-diff__arrow"> → </span>
                <span className="change-diff__after">{d.after || t('admin.changeRequests.empty')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPending ? (
        <>
          <h6 className="account-edit__section mt-3">{t('admin.changeRequests.responseHeading')}</h6>
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
              placeholder={t('admin.changeRequests.notePlaceholder')}
            />
            <Form.Control.Feedback type="invalid">{t('admin.changeRequests.noteRequired')}</Form.Control.Feedback>
          </Form.Group>
        </>
      ) : (
        request.reviewNote && (
          <Alert variant="secondary" className="mt-3 mb-0 py-2 small">
            <strong>{t('admin.changeRequests.responseSentLabel')}</strong> {request.reviewNote}
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
