import { useEffect, useMemo, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { listAllRefunds } from '@/services/refunds';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import Loading from '@/components/Global/Loading';

const formatBRL = (reais) => (Number(reais) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('pt-BR');
};

const METHOD_LABEL = { boleto: 'Boleto', pix: 'Pix', cartão: 'Cartão' };

const AdminRefunds = ({ loggedUsername }) => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  scrollUp();

  useEffect(() => {
    listAllRefunds()
      .then(setRefunds)
      .catch(() => toast.error('Erro ao carregar reembolsos.'))
      .finally(() => setLoading(false));
  }, []);

  const statItems = useMemo(() => {
    const total = refunds.reduce((acc, refund) => acc + Number(refund.amount || 0), 0);
    const deleted = refunds.filter((refund) => refund.deleted).length;
    return [
      { label: 'Total reembolsado', value: formatBRL(total), tone: 'danger' },
      { label: 'Reembolsos', value: refunds.length, tone: 'accent' },
      { label: 'Com exclusão da inscrição', value: deleted, tone: 'used' },
    ];
  }, [refunds]);

  return (
    <div className="admin-subpage admin-subpage--refunds">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Reembolsos"
        subtitle="Histórico de reembolsos feitos pelo admin (cartão, pix e boleto)."
        typeIcon="money"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <StatCards items={statItems} />

            <div className="admin-table-card">
              <Table striped bordered hover responsive className="custom-table">
                <thead>
                  <tr>
                    <th className="table-cells-header">Data:</th>
                    <th className="table-cells-header">Inscrito:</th>
                    <th className="table-cells-header">CPF:</th>
                    <th className="table-cells-header">Pedido:</th>
                    <th className="table-cells-header">Forma:</th>
                    <th className="table-cells-header">Valor:</th>
                    <th className="table-cells-header">Inscrição excluída:</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-secondary py-4">
                        Nenhum reembolso registrado.
                      </td>
                    </tr>
                  ) : (
                    refunds.map((refund) => (
                      <tr key={refund.id}>
                        <td>{formatDate(refund.refundedAt)}</td>
                        <td>{refund.camperName}</td>
                        <td>{refund.cpf}</td>
                        <td>{refund.orderNumber || '—'}</td>
                        <td>{METHOD_LABEL[refund.paymentMethod] || refund.paymentMethod}</td>
                        <td className="fw-bold">{formatBRL(refund.amount)}</td>
                        <td>
                          {refund.deleted ? <Badge bg="danger">Sim</Badge> : <Badge bg="secondary">Não</Badge>}
                        </td>
                      </tr>
                    ))
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

AdminRefunds.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminRefunds;
