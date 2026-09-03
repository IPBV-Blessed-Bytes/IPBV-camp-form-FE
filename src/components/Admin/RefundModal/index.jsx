import { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import CustomModal from '@/components/Global/CustomModal';
import { refundCamper } from '@/services/campers';
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

const RefundModal = ({ camper, onHide, onDone, loggedUsername }) => {
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState(emptyBank);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const method = camper?.formPayment?.formPayment || '';
  const isBoleto = method === 'ticket';

  useEffect(() => {
    if (camper) {
      setAmount(String(Math.round(Number(camper.totalPrice || 0))));
      setBank({
        ...emptyBank,
        holderName: camper.personalInformation?.name || '',
        holderDocument: camper.personalInformation?.cpf || '',
      });
    }
  }, [camper]);

  const setBankField = (field, value) => setBank((current) => ({ ...current, [field]: value }));

  const handleConfirm = async (deleteAfter) => {
    setLoading(true);
    setSaving(true);
    try {
      const payload = { amount, deleteAfter };
      if (isBoleto) payload.bankAccount = bank;
      const result = await refundCamper(camper.id, payload);
      registerLog(
        `${deleteAfter ? 'Reembolsou e excluiu' : 'Reembolsou'} R$ ${amount} da inscrição de ${
          camper.personalInformation?.name
        } (pedido ${camper.orderNumber || '—'})`,
        loggedUsername,
      );
      toast.success(
        deleteAfter
          ? 'Reembolso feito e inscrição excluída.'
          : `Reembolso solicitado ao PagarMe (${result.refundedCharges} cobrança(s)).`,
      );
      onDone?.();
      onHide();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível concluir o reembolso.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <CustomModal
      show={Boolean(camper)}
      onHide={onHide}
      variant="cancel"
      title="Reembolsar Inscrição"
      icon="money"
      iconFill="#dc3545"
      size="lg"
      footer={
        <>
          <Button variant="outline-secondary" onClick={onHide}>
            Voltar
          </Button>
          <Button variant="teal-blue" onClick={() => handleConfirm(false)} disabled={saving}>
            Reembolsar
          </Button>
          <Button variant="danger" onClick={() => handleConfirm(true)} disabled={saving}>
            Reembolsar e excluir
          </Button>
        </>
      }
    >
      {camper && (
        <>
          <p className="mb-2">
            Reembolsar a inscrição de <b>{camper.personalInformation?.name}</b> (pedido{' '}
            <b>{camper.orderNumber || '—'}</b>).
          </p>
          <Alert variant="warning" className="py-2 small">
            A <b>taxa do PagarMe não é devolvida</b>. Os reembolsos são do valor líquido pago pelo cliente, então o
            usuário absorve o custo e não recebe a taxa que pagou.
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Valor do Reembolso:</Form.Label>
            <InputGroup>
              <InputGroup.Text>R$</InputGroup.Text>
              <Form.Control
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </InputGroup>
            <Form.Text className="text-muted-italic">
              Padrão: valor total da inscrição. Ajuste se quiser reembolsar algum valor parcial.
            </Form.Text>
          </Form.Group>

          {isBoleto ? (
            <>
              <h6 className="fw-bold mt-3">Conta bancária de destino (obrigatória p/ boleto)</h6>
              <p className="text-secondary small">
                O boleto não tem cartão/origem pra devolver, então o PagarMe exige a conta que receberá o valor.
              </p>
              <Row className="g-2">
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">Nome do titular</Form.Label>
                  <Form.Control value={bank.holderName} onChange={(e) => setBankField('holderName', e.target.value)} />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">CPF do titular</Form.Label>
                  <Form.Control
                    value={bank.holderDocument}
                    onChange={(e) => setBankField('holderDocument', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">Banco (nº)</Form.Label>
                  <Form.Control
                    placeholder="341"
                    value={bank.bank}
                    onChange={(e) => setBankField('bank', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">Agência</Form.Label>
                  <Form.Control
                    value={bank.branchNumber}
                    onChange={(e) => setBankField('branchNumber', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">Conta</Form.Label>
                  <Form.Control
                    value={bank.accountNumber}
                    onChange={(e) => setBankField('accountNumber', e.target.value)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-bold">Dígito</Form.Label>
                  <Form.Control
                    value={bank.accountCheckDigit}
                    onChange={(e) => setBankField('accountCheckDigit', e.target.value)}
                  />
                </Col>
                <Col xs={12} md={4}>
                  <Form.Label className="small fw-bold">Tipo</Form.Label>
                  <Form.Select value={bank.type} onChange={(e) => setBankField('type', e.target.value)}>
                    <option value="checking">Corrente</option>
                    <option value="savings">Poupança</option>
                  </Form.Select>
                </Col>
              </Row>
            </>
          ) : (
            <p className="text-secondary small mb-0">
              Pagamento por <b>{method === 'pix' ? 'Pix' : 'cartão'}</b> — o valor volta automaticamente para a origem
              (Pix de origem ou o cartão do inscrito).
            </p>
          )}
        </>
      )}
      <Loading loading={loading} />
    </CustomModal>
  );
};

RefundModal.propTypes = {
  camper: PropTypes.object,
  onHide: PropTypes.func,
  onDone: PropTypes.func,
  loggedUsername: PropTypes.string,
};

export default RefundModal;
