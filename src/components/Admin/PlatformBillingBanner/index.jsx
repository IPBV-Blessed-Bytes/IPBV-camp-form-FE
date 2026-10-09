import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';

import { getPlatformBillingStatus, createPlatformCharge } from '@/services/platformBilling';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const formatBRL = (cents) =>
  ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

const PlatformBillingBanner = ({ canManage }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [kind, setKind] = useState('per_event');
  const [method, setMethod] = useState('pix');
  const [payer, setPayer] = useState({ name: '', document: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [charge, setCharge] = useState(null);

  const load = () => {
    getPlatformBillingStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  };

  useEffect(() => {
    load();
  }, []);

  const perEvent = status ? formatBRL(status.perEventCents) : '—';
  const annual = status ? formatBRL(status.annualCents) : '—';

  const basic = status && status.freeEventAccess === 'BASIC';

  const uncovered = useMemo(
    () =>
      status &&
      !basic &&
      !status.covered &&
      (status.reason === 'trial_ended' || status.reason === 'past_due'),
    [status, basic],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payer.document.trim()) {
      toast.error(t('admin.billing.docRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const data = await createPlatformCharge({
        kind,
        method,
        payerName: payer.name.trim(),
        payerDocument: payer.document.trim(),
        payerEmail: payer.email.trim(),
        payerPhone: payer.phone.trim(),
      });
      setCharge(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.billing.chargeError'));
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCharge(null);
    load();
  };

  if (!status) {
    return null;
  }

  return (
    <>
      {status.reason === 'paid_event' && (
        <div className="platform-billing platform-billing--info">
          <Icons typeIcon="cash" iconSize={26} fill="#0a5f86" />
          <div className="platform-billing__text">
            <strong>{t('admin.billing.paidEventTitle', { fee: '5%' })}</strong>
            <span>{t('admin.billing.paidEventText')}</span>
          </div>
        </div>
      )}

      {status.reason === 'trial' && (
        <div className="platform-billing platform-billing--info">
          <Icons typeIcon="clock" iconSize={26} fill="#0a5f86" />
          <div className="platform-billing__text">
            <strong>
              {t('admin.billing.trialTitle', {
                status:
                  status.daysLeftTrial != null
                    ? t('admin.billing.daysLeft', { count: status.daysLeftTrial })
                    : t('admin.billing.trialActive'),
              })}
            </strong>
            <span>
              <Trans i18nKey="admin.billing.trialText" values={{ fee: '5%' }} components={{ b: <b /> }} />
            </span>
          </div>
        </div>
      )}

      {basic && (
        <div className="platform-billing platform-billing--warn" role="alert">
          <Icons typeIcon="warn" iconSize={28} fill="#8a5300" />
          <div className="platform-billing__text">
            <strong>{t('admin.billing.basicTitle')}</strong>
            <span>
              <Trans i18nKey="admin.billing.basicText" values={{ perEvent, annual }} components={{ b: <b /> }} />
            </span>
          </div>
          {canManage && (
            <Button variant="warning" className="fw-bold platform-billing__btn" onClick={() => setShowModal(true)}>
              {t('admin.billing.unlockEvent')}
            </Button>
          )}
        </div>
      )}

      {uncovered && (
        <div className="platform-billing platform-billing--warn" role="alert">
          <Icons typeIcon="warn" iconSize={28} fill="#8a5300" />
          <div className="platform-billing__text">
            <strong>{t('admin.billing.uncoveredTitle')}</strong>
            <span>
              {status.reason === 'past_due'
                ? t('admin.billing.pastDueText')
                : t('admin.billing.trialEndedText', { perEvent, annual })}
            </span>
          </div>
          {canManage && (
            <Button variant="warning" className="fw-bold platform-billing__btn" onClick={() => setShowModal(true)}>
              {t('admin.billing.publishEvent')}
            </Button>
          )}
        </div>
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('admin.billing.modalTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {charge ? (
            <div className="platform-billing__result">
              <p className="platform-billing__result-note">
                <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('admin.billing.resultNote')}
              </p>
              {charge.pix_qr_code_url && (
                <div className="platform-billing__pix">
                  <img src={charge.pix_qr_code_url} alt={t('admin.billing.pixQrAlt')} />
                </div>
              )}
              {charge.pix_qr_code && (
                <>
                  <Form.Label className="fw-bold">{t('admin.billing.pixLabel')}</Form.Label>
                  <Form.Control as="textarea" rows={3} readOnly value={charge.pix_qr_code} />
                  <Button
                    variant="outline-teal-blue"
                    className="mt-2"
                    onClick={() => {
                      navigator.clipboard?.writeText(charge.pix_qr_code);
                      toast.success(t('admin.billing.pixCopied'));
                    }}
                  >
                    {t('admin.billing.copyCode')}
                  </Button>
                </>
              )}
              {charge.boleto_url && (
                <a className="btn btn-teal-blue fw-bold" href={charge.boleto_url} target="_blank" rel="noreferrer">
                  {t('admin.billing.openBoleto')}
                </a>
              )}
              {charge.payment_url && (
                <a className="btn btn-teal-blue fw-bold" href={charge.payment_url} target="_blank" rel="noreferrer">
                  {t('admin.billing.payCard')}
                </a>
              )}
            </div>
          ) : (
            <Form onSubmit={handleSubmit} className="platform-billing__form">
              <Form.Label className="fw-bold">{t('admin.billing.whatToHire')}</Form.Label>
              <div className="platform-billing__plans">
                <button
                  type="button"
                  className={`platform-billing__plan ${kind === 'per_event' ? 'is-active' : ''}`}
                  onClick={() => setKind('per_event')}
                >
                  <span className="platform-billing__plan-price">{perEvent}</span>
                  <span className="platform-billing__plan-name">{t('admin.billing.thisEvent')}</span>
                </button>
                <button
                  type="button"
                  className={`platform-billing__plan ${kind === 'annual' ? 'is-active' : ''}`}
                  onClick={() => setKind('annual')}
                >
                  <span className="platform-billing__plan-price">{annual}</span>
                  <span className="platform-billing__plan-name">{t('admin.billing.annualPlan')}</span>
                </button>
              </div>

              <Form.Label className="fw-bold mt-3">{t('admin.billing.paymentMethod')}</Form.Label>
              <Form.Select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="pix">{t('admin.billing.optPix')}</option>
                <option value="boleto">{t('admin.billing.optBoleto')}</option>
                <option value="card">{t('admin.billing.optCard')}</option>
              </Form.Select>

              <Form.Label className="fw-bold mt-3">{t('admin.billing.payerName')}</Form.Label>
              <Form.Control
                value={payer.name}
                onChange={(e) => setPayer((p) => ({ ...p, name: e.target.value }))}
                placeholder={t('admin.billing.payerNamePlaceholder')}
              />
              <Form.Label className="fw-bold mt-2">{t('admin.billing.payerDoc')}</Form.Label>
              <Form.Control
                value={payer.document}
                onChange={(e) => setPayer((p) => ({ ...p, document: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
              <Form.Label className="fw-bold mt-2">{t('admin.billing.payerEmail')}</Form.Label>
              <Form.Control
                type="email"
                value={payer.email}
                onChange={(e) => setPayer((p) => ({ ...p, email: e.target.value }))}
                placeholder={t('admin.billing.payerEmailPlaceholder')}
              />
              <Form.Label className="fw-bold mt-2">{t('admin.billing.payerPhone')}</Form.Label>
              <Form.Control
                value={payer.phone}
                onChange={(e) => setPayer((p) => ({ ...p, phone: e.target.value }))}
                placeholder={t('admin.billing.payerPhonePlaceholder')}
              />

              <SpinnerButton type="submit" variant="teal-blue" className="fw-bold mt-3 w-100" loading={submitting}>{t('admin.billing.generateCharge')}</SpinnerButton>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

PlatformBillingBanner.propTypes = {
  canManage: PropTypes.bool,
};

export default PlatformBillingBanner;
