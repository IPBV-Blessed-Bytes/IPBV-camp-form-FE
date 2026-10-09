import { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import CustomModal from '@/components/Global/CustomModal';
import { refundRegistration } from '@/services/refunds';
import { registerLog } from '@/services/logs';
import Loading from '@/components/Global/Loading';

const emptyBank = {
  holderName: '',
  holderDocument: '',
  bank: '',
  branchNumber: '',
  accountNumber: '',
  accountCheckDigit: '',
  type: 'checking',
};

const RefundModal = ({ submission, onHide, onDone, loggedUsername }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState(emptyBank);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const method = submission?.paymentMethod || '';
  const isBoleto = method === 'boleto';
  const isCredit = !isBoleto && method !== 'pix';
  const deadlineDays = isCredit ? 180 : 90;
  const netValue = Math.round(Number(submission?.totalCents || 0) / 100);
  const payerName = submission?.answers?.nome || submission?.userEmail || '—';
  const methodNote = isCredit ? t('admin.refunds.modal.methodCredit') : t('admin.refunds.modal.methodPixBoleto');
  const methodLabel = method === 'pix' ? 'Pix' : t('admin.refunds.modal.card');

  useEffect(() => {
    if (submission) {
      setAmount(String(Math.round(Number(submission.totalCents || 0) / 100)));
      setBank({
        ...emptyBank,
        holderName: submission.answers?.nome || '',
        holderDocument: submission.answers?.cpf || '',
      });
    }
  }, [submission]);

  const setBankField = (field, value) => setBank((current) => ({ ...current, [field]: value }));

  const handleConfirm = async (deleteAfter) => {
    if (netValue > 0 && Number(amount) > netValue) {
      toast.error(t('admin.refunds.modal.maxError', { netValue }));
      return;
    }
    setLoading(true);
    setSaving(true);
    try {
      const payload = { amount: Number(amount), deleteAfter };
      if (isBoleto) payload.bankAccount = bank;
      const result = await refundRegistration(submission.id, payload);
      registerLog(
        `${deleteAfter ? 'Reembolsou e excluiu' : 'Reembolsou'} R$ ${amount} da inscrição de ${payerName} (pedido ${
          submission.orderNumber || '—'
        })`,
        loggedUsername,
      );
      toast.success(
        deleteAfter
          ? t('admin.refunds.modal.deletedSuccess')
          : t('admin.refunds.modal.requestedSuccess', { count: result.refundedCharges }),
      );
      onDone?.();
      onHide();
    } catch (error) {
      toast.error(error?.response?.data || t('admin.refunds.modal.genericError'));
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <CustomModal
      show={Boolean(submission)}
      onHide={onHide}
      variant="cancel"
      title={t('admin.refunds.modal.title')}
      icon="money"
      iconFill="#dc3545"
      size="lg"
      footer={
        <>
          <Button variant="outline-secondary" onClick={onHide}>
            {t('admin.refunds.modal.back')}
          </Button>
          <Button variant="teal-blue" onClick={() => handleConfirm(false)} disabled={saving}>
            {t('admin.refunds.modal.refund')}
          </Button>
          <Button variant="danger" onClick={() => handleConfirm(true)} disabled={saving}>
            {t('admin.refunds.modal.refundDelete')}
          </Button>
        </>
      }
    >
      {submission && (
        <>
          <p className="mb-2">
            <Trans
              i18nKey="admin.refunds.modal.intro"
              values={{ payer: payerName, order: submission.orderNumber || '—' }}
              components={{ b: <b /> }}
            />
          </p>
          <Alert variant="warning" className="py-2 small">
            <Trans
              i18nKey="admin.refunds.modal.warning"
              values={{ netValue, deadlineDays, methodNote }}
              components={{ b: <b /> }}
            />
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">{t('admin.refunds.modal.amountLabel')}</Form.Label>
            <InputGroup>
              <InputGroup.Text>R$</InputGroup.Text>
              <Form.Control
                type="number"
                min="1"
                max={netValue || undefined}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </InputGroup>
            <Form.Text className="text-muted-italic">{t('admin.refunds.modal.amountHint', { netValue })}</Form.Text>
          </Form.Group>

          {isBoleto ? (
            <>
              <h6 className="fw-bold mt-3">{t('admin.refunds.modal.bankTitle')}</h6>
              <p className="text-secondary small">
                {t('admin.refunds.modal.bankHint')}
              </p>
              <Row className="g-2">
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">{t('admin.refunds.modal.holderName')}</Form.Label>
                  <Form.Control value={bank.holderName} onChange={(e) => setBankField('holderName', e.target.value)} />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">{t('admin.refunds.modal.holderDoc')}</Form.Label>
                  <Form.Control
                    value={bank.holderDocument}
                    onChange={(e) => setBankField('holderDocument', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">{t('admin.refunds.modal.bankNumber')}</Form.Label>
                  <Form.Control
                    placeholder="341"
                    value={bank.bank}
                    onChange={(e) => setBankField('bank', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">{t('admin.refunds.modal.branch')}</Form.Label>
                  <Form.Control
                    value={bank.branchNumber}
                    onChange={(e) => setBankField('branchNumber', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">{t('admin.refunds.modal.account')}</Form.Label>
                  <Form.Control
                    value={bank.accountNumber}
                    onChange={(e) => setBankField('accountNumber', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">{t('admin.refunds.modal.checkDigit')}</Form.Label>
                  <Form.Control
                    value={bank.accountCheckDigit}
                    onChange={(e) => setBankField('accountCheckDigit', e.target.value)}
                  />
                </Col>
                <Col xs={12} md={4}>
                  <Form.Label className="small fw-bold">{t('admin.refunds.modal.accountType')}</Form.Label>
                  <Form.Select value={bank.type} onChange={(e) => setBankField('type', e.target.value)}>
                    <option value="checking">{t('admin.refunds.modal.typeChecking')}</option>
                    <option value="savings">{t('admin.refunds.modal.typeSavings')}</option>
                  </Form.Select>
                </Col>
              </Row>
            </>
          ) : (
            <p className="text-secondary small mb-0">
              <Trans i18nKey="admin.refunds.modal.pixNote" values={{ methodLabel }} components={{ b: <b /> }} />
            </p>
          )}
        </>
      )}
      <Loading loading={loading} />
    </CustomModal>
  );
};

RefundModal.propTypes = {
  submission: PropTypes.object,
  onHide: PropTypes.func,
  onDone: PropTypes.func,
  loggedUsername: PropTypes.string,
};

export default RefundModal;
