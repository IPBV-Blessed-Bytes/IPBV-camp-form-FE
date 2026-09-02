import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Icons from '@/components/Global/Icons';
import './style.scss';

const STATUS = {
  PENDING: { label: 'Pendente', className: 'is-pending' },
  PAID: { label: 'Pago', className: 'is-paid' },
  OVERDUE: { label: 'Vencido', className: 'is-overdue' },
  CANCELED: { label: 'Cancelado', className: 'is-canceled' },
};

const formatBRL = (centavos) =>
  (Number(centavos || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

const pdfLink = (url) => (url ? `${url}?format=pdf` : '');

const BoletoList = ({ boletos, showProgress }) => {
  const total = boletos.length;
  const paidCount = boletos.filter((boleto) => boleto.status === 'PAID').length;

  const copyLine = (line) => {
    if (!navigator.clipboard || !line) return;
    navigator.clipboard
      .writeText(line)
      .then(() => toast.success('Código de barras copiado.'))
      .catch(() => {});
  };

  if (total === 0) return null;

  return (
    <div className="boleto-list">
      {showProgress && (
        <div className="boleto-list__progress">
          <div className="boleto-list__progress-track">
            <div
              className="boleto-list__progress-fill"
              style={{ width: `${total ? (paidCount / total) * 100 : 0}%` }}
            />
          </div>
          <span className="boleto-list__progress-label">
            {paidCount} de {total} boletos pagos
          </span>
        </div>
      )}

      <div className="boleto-list__grid">
        {boletos.map((boleto) => {
          const status = STATUS[boleto.status] || { label: boleto.status || 'Pendente', className: 'is-pending' };
          return (
            <div className={`boleto-card ${status.className}`} key={boleto.installmentNumber}>
              <div className="boleto-card__top">
                <span className="boleto-card__seq">
                  Boleto {boleto.installmentNumber}/{boleto.totalInstallments}
                </span>
                <span className={`boleto-card__badge ${status.className}`}>{status.label}</span>
              </div>

              <div className="boleto-card__amount">R$ {formatBRL(boleto.amount)}</div>
              <div className="boleto-card__due">
                <Icons typeIcon="calendar-alt" iconSize={15} fill="#6c757d" />
                <span>Vencimento em {formatDate(boleto.dueDate)}</span>
              </div>

              {boleto.barcode && (
                <button
                  type="button"
                  className="boleto-card__line"
                  onClick={() => copyLine(boleto.barcode)}
                  title="Copiar código de barras"
                >
                  <span className="boleto-card__line-text">{boleto.barcode}</span>
                  <span className="boleto-card__line-copy">Copiar</span>
                </button>
              )}

              <div className="boleto-card__actions">
                {boleto.boletoUrl && (
                  <a
                    className="boleto-card__btn boleto-card__btn--primary"
                    href={boleto.boletoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icons typeIcon="barcode" iconSize={16} fill="#fff" />
                    Ver boleto
                  </a>
                )}
                
                {boleto.boletoUrl && (
                  <a
                    className="boleto-card__btn boleto-card__btn--ghost"
                    href={pdfLink(boleto.boletoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icons typeIcon="arrow-down-double" iconSize={16} fill="#007185" />
                    Baixar PDF
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

BoletoList.propTypes = {
  boletos: PropTypes.array,
  showProgress: PropTypes.bool,
};

BoletoList.defaultProps = {
  boletos: [],
  showProgress: false,
};

export default BoletoList;
