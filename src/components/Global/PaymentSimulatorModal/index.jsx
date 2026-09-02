import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import CustomModal from '@/components/Global/CustomModal';
import { simulatePayments } from '@/utils/paymentFees';
import './style.scss';

const formatBRL = (value) =>
  (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PaymentSimulatorModal = ({ show, onHide, base, fees, maxBoletoInstallments }) => {
  const { pix, boleto, card, boletoInstallments } = simulatePayments(base, fees, maxBoletoInstallments);

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      variant="info"
      title="Simulação de Taxas"
      icon="money"
      iconFill="#2E5AAC"
      size="lg"
    >
      <div className="fees-simulator">
        <p className="fees-simulator__intro">
          Veja quanto você pagaria em cada forma de pagamento, já com a taxa incluída. Sobre o valor da inscrição de{' '}
          <b>{formatBRL(base)}</b>. Valores estimados — o total exato aparece no checkout.
        </p>

        <div className="fees-simulator__highlights">
          <div className="fees-simulator__highlight">
            <span className="fees-simulator__highlight-icon">
              <Icons typeIcon="cash" iconSize={22} fill="#1a8a45" />
            </span>
            <div>
              <span className="fees-simulator__highlight-label">PIX</span>
              <span className="fees-simulator__highlight-value">{formatBRL(pix)}</span>
            </div>
          </div>
          <div className="fees-simulator__highlight">
            <span className="fees-simulator__highlight-icon">
              <Icons typeIcon="barcode" iconSize={22} fill="#d39e00" />
            </span>
            <div>
              <span className="fees-simulator__highlight-label">Boleto</span>
              <span className="fees-simulator__highlight-value">{formatBRL(boleto)}</span>
            </div>
          </div>
        </div>

        {boletoInstallments.length > 0 && (
          <>
            <h6 className="fees-simulator__card-title">
              <Icons typeIcon="barcode" iconSize={18} fill="#d39e00" /> Boleto parcelado
            </h6>
            <div className="fees-simulator__table-wrap">
              <Table className="fees-simulator__table">
                <thead>
                  <tr>
                    <th>Boletos</th>
                    <th>Valor de cada boleto</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {boletoInstallments.map((row) => (
                    <tr key={row.installments}>
                      <td>{row.installments}x</td>
                      <td>{formatBRL(row.perInstallment)}</td>
                      <td className="fw-bold">{formatBRL(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}

        <h6 className="fees-simulator__card-title">
          <Icons typeIcon="credit-card" iconSize={18} fill="#007185" /> Cartão de crédito
        </h6>
        <div className="fees-simulator__table-wrap">
          <Table className="fees-simulator__table">
            <thead>
              <tr>
                <th>Parcelas</th>
                <th>Valor da parcela</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {card.map((row) => (
                <tr key={row.installments}>
                  <td>{row.installments}x</td>
                  <td>{formatBRL(row.perInstallment)}</td>
                  <td className="fw-bold">{formatBRL(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </CustomModal>
  );
};

PaymentSimulatorModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  base: PropTypes.number,
  fees: PropTypes.object,
  maxBoletoInstallments: PropTypes.number,
};

PaymentSimulatorModal.defaultProps = {
  maxBoletoInstallments: 1,
};

export default PaymentSimulatorModal;
