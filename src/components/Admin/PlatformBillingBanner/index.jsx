import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { getPlatformBillingStatus, createPlatformCharge } from '@/services/platformBilling';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Icons from '@/components/Global/Icons';
import './style.scss';

const formatBRL = (cents) =>
  ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

const PlatformBillingBanner = ({ canManage }) => {
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

  const uncovered = useMemo(
    () => status && !status.covered && (status.reason === 'trial_ended' || status.reason === 'past_due'),
    [status],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payer.document.trim()) {
      toast.error('Informe o CPF ou CNPJ de quem vai pagar.');
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
      toast.error(getApiErrorMessage(error) || 'Não foi possível gerar a cobrança.');
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
            <strong>Evento pago — taxa de {status && '5%'} por inscrição.</strong>
            <span>A taxa de serviço vale sobre cada inscrição paga, inclusive durante o período de teste grátis.</span>
          </div>
        </div>
      )}

      {status.reason === 'trial' && (
        <div className="platform-billing platform-billing--info">
          <Icons typeIcon="clock" iconSize={26} fill="#0a5f86" />
          <div className="platform-billing__text">
            <strong>
              Teste grátis: {status.daysLeftTrial != null ? `${status.daysLeftTrial} dia(s) restante(s)` : 'ativo'}.
            </strong>
            <span>
              O teste cobre <b>eventos gratuitos</b>. Eventos <b>pagos já cobram os 5%</b> por inscrição desde já, mesmo
              no teste.
            </span>
          </div>
        </div>
      )}

      {uncovered && (
        <div className="platform-billing platform-billing--warn" role="alert">
          <Icons typeIcon="warn" iconSize={28} fill="#8a5300" />
          <div className="platform-billing__text">
            <strong>Este evento gratuito está bloqueado para inscritos.</strong>
            <span>
              {status.reason === 'past_due'
                ? 'Seu plano anual venceu. Regularize para reabrir as inscrições.'
                : `O período de teste terminou. Publique este evento por ${perEvent} ou assine ${annual}/ano para eventos ilimitados.`}
            </span>
          </div>
          {canManage && (
            <Button variant="warning" className="fw-bold platform-billing__btn" onClick={() => setShowModal(true)}>
              Publicar evento
            </Button>
          )}
        </div>
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Publicar evento gratuito</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {charge ? (
            <div className="platform-billing__result">
              <p className="platform-billing__result-note">
                <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Após o pagamento, o evento é liberado
                automaticamente (pode levar alguns minutos).
              </p>
              {charge.pix_qr_code_url && (
                <div className="platform-billing__pix">
                  <img src={charge.pix_qr_code_url} alt="QR Code do PIX" />
                </div>
              )}
              {charge.pix_qr_code && (
                <>
                  <Form.Label className="fw-bold">PIX copia e cola</Form.Label>
                  <Form.Control as="textarea" rows={3} readOnly value={charge.pix_qr_code} />
                  <Button
                    variant="outline-teal-blue"
                    className="mt-2"
                    onClick={() => {
                      navigator.clipboard?.writeText(charge.pix_qr_code);
                      toast.success('Código PIX copiado.');
                    }}
                  >
                    Copiar código
                  </Button>
                </>
              )}
              {charge.boleto_url && (
                <a className="btn btn-teal-blue fw-bold" href={charge.boleto_url} target="_blank" rel="noreferrer">
                  Abrir boleto
                </a>
              )}
              {charge.payment_url && (
                <a className="btn btn-teal-blue fw-bold" href={charge.payment_url} target="_blank" rel="noreferrer">
                  Pagar com cartão
                </a>
              )}
            </div>
          ) : (
            <Form onSubmit={handleSubmit} className="platform-billing__form">
              <Form.Label className="fw-bold">O que você quer contratar?</Form.Label>
              <div className="platform-billing__plans">
                <button
                  type="button"
                  className={`platform-billing__plan ${kind === 'per_event' ? 'is-active' : ''}`}
                  onClick={() => setKind('per_event')}
                >
                  <span className="platform-billing__plan-price">{perEvent}</span>
                  <span className="platform-billing__plan-name">Este evento</span>
                </button>
                <button
                  type="button"
                  className={`platform-billing__plan ${kind === 'annual' ? 'is-active' : ''}`}
                  onClick={() => setKind('annual')}
                >
                  <span className="platform-billing__plan-price">{annual}</span>
                  <span className="platform-billing__plan-name">Plano anual (ilimitado)</span>
                </button>
              </div>

              <Form.Label className="fw-bold mt-3">Meio de pagamento</Form.Label>
              <Form.Select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="card">Cartão de crédito</option>
              </Form.Select>

              <Form.Label className="fw-bold mt-3">Nome do responsável</Form.Label>
              <Form.Control
                value={payer.name}
                onChange={(e) => setPayer((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nome de quem paga"
              />
              <Form.Label className="fw-bold mt-2">CPF ou CNPJ</Form.Label>
              <Form.Control
                value={payer.document}
                onChange={(e) => setPayer((p) => ({ ...p, document: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
              <Form.Label className="fw-bold mt-2">E-mail</Form.Label>
              <Form.Control
                type="email"
                value={payer.email}
                onChange={(e) => setPayer((p) => ({ ...p, email: e.target.value }))}
                placeholder="responsavel@igreja.com"
              />
              <Form.Label className="fw-bold mt-2">Telefone</Form.Label>
              <Form.Control
                value={payer.phone}
                onChange={(e) => setPayer((p) => ({ ...p, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />

              <Button type="submit" variant="teal-blue" className="fw-bold mt-3 w-100" disabled={submitting}>
                {submitting ? 'Gerando...' : 'Gerar cobrança'}
              </Button>
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
