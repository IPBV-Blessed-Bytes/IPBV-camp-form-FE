import { useEffect, useMemo, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { listAllBoletos } from '@/services/boletos';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const formatBRL = (centavos) =>
  (Number(centavos || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR');
};

const daysOverdue = (dueDate) => {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
};

const waLink = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
};

const STATUS = {
  PENDING: { label: 'Pendente', bg: 'warning' },
  PAID: { label: 'Pago', bg: 'success' },
  OVERDUE: { label: 'Vencido', bg: 'danger' },
  CANCELED: { label: 'Cancelado', bg: 'secondary' },
};

const ContactLinks = ({ cellPhone, email, whatsApp }) => (
  <div className="boleto-contact">
    {cellPhone &&
      (whatsApp ? (
        <a className="boleto-contact__wa" href={waLink(cellPhone)} target="_blank" rel="noopener noreferrer">
          <Icons typeIcon="whatsapp" iconSize={15} fill="#25D366" />
          {cellPhone}
        </a>
      ) : (
        <span className="boleto-contact__phone">
          <Icons typeIcon="phone" iconSize={14} fill="#6c757d" />
          {cellPhone}
        </span>
      ))}
    {email && (
      <a className="boleto-contact__email" href={`mailto:${email}`}>
        {email}
      </a>
    )}
    {!cellPhone && !email && <span className="text-secondary">—</span>}
  </div>
);

ContactLinks.propTypes = {
  cellPhone: PropTypes.string,
  email: PropTypes.string,
  whatsApp: PropTypes.bool,
};

const AdminBoletos = ({ loggedUsername }) => {
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(true);

  scrollUp();

  useEffect(() => {
    listAllBoletos()
      .then((list) => {
        const sorted = [...list].sort((a, b) => {
          if (a.orderNumber === b.orderNumber) return a.installmentNumber - b.installmentNumber;
          return String(a.orderNumber).localeCompare(String(b.orderNumber));
        });
        setBoletos(sorted);
      })
      .catch(() => toast.error('Erro ao carregar boletos.'))
      .finally(() => setLoading(false));
  }, []);

  const statItems = useMemo(() => {
    const paid = boletos.filter((boleto) => boleto.status === 'PAID').length;
    const overdue = boletos.filter((boleto) => boleto.status === 'OVERDUE').length;
    const pending = boletos.filter((boleto) => boleto.status === 'PENDING').length;
    const orders = new Set(boletos.map((boleto) => boleto.orderNumber)).size;
    return [
      { label: 'Pedidos parcelados', value: orders, tone: 'info' },
      { label: 'Total de boletos', value: boletos.length, tone: 'accent' },
      { label: 'Boletos pagos', value: paid, tone: 'used' },
      { label: 'Boletos pendentes', value: pending, tone: 'available' },
      { label: 'Boletos vencidos', value: overdue, tone: 'danger' },
    ];
  }, [boletos]);

  const inadimplentes = useMemo(() => {
    const map = new Map();
    boletos
      .filter((boleto) => boleto.status === 'OVERDUE')
      .forEach((boleto) => {
        const key = boleto.orderNumber || boleto.cpf;
        if (!map.has(key)) {
          map.set(key, {
            key,
            orderNumber: boleto.orderNumber,
            payerName: boleto.payerName,
            cpf: boleto.cpf,
            cellPhone: boleto.cellPhone,
            email: boleto.email,
            whatsApp: boleto.whatsApp,
            count: 0,
            totalAmount: 0,
            maxDays: 0,
          });
        }
        const group = map.get(key);
        group.count += 1;
        group.totalAmount += Number(boleto.amount || 0);
        group.maxDays = Math.max(group.maxDays, daysOverdue(boleto.dueDate));
      });
    return Array.from(map.values()).sort((a, b) => b.maxDays - a.maxDays);
  }, [boletos]);

  return (
    <div className="admin-subpage admin-subpage--boletos">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Boletos"
        subtitle="Parcelas de boleto por pedido."
        typeIcon="barcode"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <StatCards items={statItems} />

            {inadimplentes.length > 0 && (
              <div className="inadimplentes-panel">
                <div className="inadimplentes-panel__header">
                  <span className="inadimplentes-panel__icon">
                    <Icons typeIcon="danger" iconSize={22} fill="#c62828" />
                  </span>
                  <div>
                    <h5 className="inadimplentes-panel__title">
                      Inadimplentes — {inadimplentes.length}{' '}
                      {inadimplentes.length === 1 ? 'pedido com boleto vencido' : 'pedidos com boletos vencidos'}
                    </h5>
                    <span className="inadimplentes-panel__subtitle">
                      Boletos com vencimento já passado. Entre em contato para regularizar o pagamento.
                    </span>
                  </div>
                </div>

                <div className="inadimplentes-panel__table-wrap">
                  <Table className="inadimplentes-table" responsive>
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Pagador</th>
                        <th>CPF</th>
                        <th>Contato</th>
                        <th>Parcelas vencidas</th>
                        <th>Valor vencido</th>
                        <th>Atraso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inadimplentes.map((item) => (
                        <tr key={item.key}>
                          <td>{item.orderNumber}</td>
                          <td>{item.payerName}</td>
                          <td>{item.cpf}</td>
                          <td>
                            <ContactLinks cellPhone={item.cellPhone} email={item.email} whatsApp={item.whatsApp} />
                          </td>
                          <td>
                            <Badge bg="danger">{item.count} vencida{item.count > 1 ? 's' : ''}</Badge>
                          </td>
                          <td className="fw-bold">R$ {formatBRL(item.totalAmount)}</td>
                          <td>
                            {item.maxDays} {item.maxDays === 1 ? 'dia' : 'dias'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            <div className="admin-table-card">
              <Table striped bordered hover responsive className="custom-table">
                <thead>
                  <tr>
                    <th className="table-cells-header">Pedido:</th>
                    <th className="table-cells-header">Pagador:</th>
                    <th className="table-cells-header">CPF:</th>
                    <th className="table-cells-header">Status:</th>
                    <th className="table-cells-header">Contato:</th>
                    <th className="table-cells-header">Parcela:</th>
                    <th className="table-cells-header">Valor:</th>
                    <th className="table-cells-header">Vencimento:</th>
                    <th className="table-cells-header">Pago em:</th>
                  </tr>
                </thead>
                <tbody>
                  {boletos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-secondary py-4">
                        Nenhum boleto parcelado gerado.
                      </td>
                    </tr>
                  ) : (
                    boletos.map((boleto) => {
                      const status = STATUS[boleto.status] || { label: boleto.status, bg: 'secondary' };
                      return (
                        <tr key={boleto.id} className={boleto.status === 'OVERDUE' ? 'boleto-row-overdue' : ''}>
                          <td>{boleto.orderNumber}</td>
                          <td>{boleto.payerName}</td>
                          <td>{boleto.cpf}</td>
                          <td>
                            <Badge bg={status.bg}>{status.label}</Badge>
                          </td>
                          <td>
                            <ContactLinks
                              cellPhone={boleto.cellPhone}
                              email={boleto.email}
                              whatsApp={boleto.whatsApp}
                            />
                          </td>
                          <td>
                            {boleto.installmentNumber}/{boleto.totalInstallments}
                          </td>
                          <td>R$ {formatBRL(boleto.amount)}</td>
                          <td>{formatDate(boleto.dueDate)}</td>
                          <td>{boleto.paidAt ? formatDate(boleto.paidAt) : '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

AdminBoletos.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminBoletos;
