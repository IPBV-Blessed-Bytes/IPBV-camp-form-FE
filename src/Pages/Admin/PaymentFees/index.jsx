import { useEffect, useState } from 'react';
import { Alert, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { getSetting, updateSetting } from '@/services/settings';
import { registerLog } from '@/services/logs';
import { parseFees, DEFAULT_FEES } from '@/utils/paymentFees';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const FEES_KEY = 'payment_fees';
const INSTALLMENTS = Array.from({ length: 12 }, (_, i) => i + 1);

const AdminPaymentFees = ({ loggedUsername }) => {
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  scrollUp();

  useEffect(() => {
    getSetting(FEES_KEY)
      .then((value) => setFees(parseFees(value)))
      .catch(() => toast.error('Erro ao carregar as taxas.'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (field, value) => setFees((current) => ({ ...current, [field]: value }));

  const setInstallment = (installment, value) =>
    setFees((current) => ({
      ...current,
      cardInstallmentPercent: { ...current.cardInstallmentPercent, [installment]: value },
    }));

  const handleSave = async () => {
    setSaving(true);
    setLoading(true);

    try {
      const payload = {
        pixPercent: Number(fees.pixPercent) || 0,
        boletoFixed: Number(fees.boletoFixed) || 0,
        cardFixed: Number(fees.cardFixed) || 0,
        transactionFixed: Number(fees.transactionFixed) || 0,
        cardInstallmentPercent: Object.fromEntries(
          INSTALLMENTS.map((n) => [n, Number(fees.cardInstallmentPercent[n]) || 0]),
        ),
      };
      await updateSetting(FEES_KEY, JSON.stringify(payload));
      registerLog('Atualizou as taxas de pagamento', loggedUsername);
      setFees(payload);
      toast.success('Taxas atualizadas.');
    } catch {
      toast.error('Erro ao salvar as taxas.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <div className="admin-subpage payment-fees">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Taxas de Pagamento"
        subtitle="Taxas usadas no simulador do carrinho. O cliente vê o total com a taxa repassada."
        typeIcon="money"
      />

      <div className="payment-fees__content">
        <Alert variant="warning" className="d-flex gap-3 align-items-start">
          <Icons typeIcon="danger" iconSize={24} fill="#997404" />
          <div>
            <Alert.Heading className="h6 fw-bold mb-1">Estes valores são só para o simulador</Alert.Heading>
            <span className="small">
              As taxas abaixo alimentam <b>apenas o simulador de taxas do carrinho</b> — uma estimativa mostrada ao
              cliente. Elas <b>não alteram o valor efetivamente cobrado</b>: a cobrança real é fixa no sistema. Editar
              aqui muda só o que o simulador exibe, não o que o cliente paga.
            </span>
          </div>
        </Alert>
        <Form>
          <Row className="g-3">
            <Col xs={12} lg={5}>
              <div className="fees-card h-100">
                <div className="fees-card__header">
                  <span className="fees-card__icon">
                    <Icons typeIcon="money" iconSize={20} fill="#007185" />
                  </span>
                  <span>Taxas Gerais</span>
                </div>
                <div className="fees-card__body">
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <b>Pix (percentual):</b>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={fees.pixPercent}
                        onChange={(e) => setField('pixPercent', e.target.value)}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                    <Form.Text className="text-muted-italic">
                      Percentual que o PagarMe cobra sobre cada pagamento via Pix.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <b>Boleto (valor fixo):</b>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>R$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={fees.boletoFixed}
                        onChange={(e) => setField('boletoFixed', e.target.value)}
                      />
                    </InputGroup>
                    <Form.Text className="text-muted-italic">
                      Valor fixo do PagarMe por boleto pago. Somado à &quot;Taxa por transação&quot; abaixo, cada boleto
                      sai por R$ 4,48 (3,49 + 0,99).
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <b>Taxa por transação - Pix e Boleto (valor fixo):</b>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>R$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={fees.transactionFixed ?? DEFAULT_FEES.transactionFixed}
                        onChange={(e) => setField('transactionFixed', e.target.value)}
                      />
                    </InputGroup>
                    <Form.Text className="text-muted-italic">
                      Valor fixo cobrado pelo PagarMe em cada transação de Pix e boleto (ex.: R$0,99). Por isso o boleto
                      sai por valor + boleto + esta taxa.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label>
                      <b>Cartão (valor fixo por transação):</b>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>R$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={fees.cardFixed}
                        onChange={(e) => setField('cardFixed', e.target.value)}
                      />
                    </InputGroup>
                    <Form.Text className="text-muted-italic">
                      Valor fixo somado ao percentual da parcela (ex.: 1x = % da tabela + este valor fixo).
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={7}>
              <div className="fees-card h-100">
                <div className="fees-card__header">
                  <span className="fees-card__icon">
                    <Icons typeIcon="credit-card" iconSize={20} fill="#007185" />
                  </span>
                  <span>Percentual do Cartão por Parcela</span>
                </div>
                <div className="fees-card__body">
                  <Form.Text className="text-muted-italic d-block mb-3">
                    Percentual que o PagarMe cobra conforme o número de parcelas no cartão. Quanto mais parcelas, maior
                    a taxa. Aplicado sobre o valor da inscrição, somado ao valor fixo do cartão.
                  </Form.Text>
                  <Row className="g-2">
                    {INSTALLMENTS.map((n) => (
                      <Col xs={6} sm={4} key={n} className="mb-3">
                        <Form.Label className="fees-card__installment-label">• {n}x</Form.Label>
                        <InputGroup size="sm">
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            value={fees.cardInstallmentPercent[n]}
                            onChange={(e) => setInstallment(n, e.target.value)}
                          />
                          <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="teal-blue" size="lg" className="mt-3" onClick={handleSave} disabled={saving}>
              Salvar Taxas
            </Button>
          </div>

          <Loading loading={loading} />
        </Form>
      </div>
    </div>
  );
};

AdminPaymentFees.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminPaymentFees;
