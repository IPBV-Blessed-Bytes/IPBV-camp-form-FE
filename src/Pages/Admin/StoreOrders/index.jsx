import { useState, useEffect } from 'react';
import { Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { formatBRL } from '@/utils/formatBRL';
import { getStoreOrders } from '@/services/storeOrders';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';

const num = (v) => Number(v) || 0;

const AdminStoreOrders = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState([]);

  scrollUp();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getStoreOrders();
        setOrders(data.orders);
        setSummary(data.summary);
      } catch (error) {
        toast.error('Erro ao buscar pedidos da loja');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalItems = summary.reduce((sum, s) => sum + num(s.totalQuantity), 0);
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s, it) => s + num(it.price) * num(it.quantity), 0),
    0,
  );

  const statItems = [
    { label: 'Pedidos', value: orders.length },
    { label: 'Itens vendidos', value: totalItems, tone: 'accent' },
    { label: 'Tipos de item', value: summary.length, tone: 'free' },
    { label: 'Arrecadado', value: `R$ ${formatBRL(totalRevenue)}`, tone: 'used' },
  ];

  return (
    <div className="admin-subpage admin-subpage--store">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Pedidos da Loja"
        subtitle="O que cada inscrito comprou na loja — para separar e entregar no dia do evento"
        typeIcon="cart"
      />

      <div className="admin-subpage__content">
        <StatCards items={statItems} />

        <SectionHeader title="Total por item (para separar)" count={summary.length} />
        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Item:</th>
                <th className="table-cells-header">Quantidade total:</th>
                <th className="table-cells-header">Pedidos:</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-start text-secondary p-4">
                    Nenhuma compra de loja registrada
                  </td>
                </tr>
              ) : (
                summary.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <em>{s.name}</em>
                    </td>
                    <td>
                      <Badge bg="teal-blue">{s.totalQuantity}</Badge>
                    </td>
                    <td>{s.orders}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <SectionHeader title="Compras por inscrito" count={orders.length} />
        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Inscrito:</th>
                <th className="table-cells-header">CPF:</th>
                <th className="table-cells-header">Pedido:</th>
                <th className="table-cells-header">Itens:</th>
                <th className="table-cells-header">Total:</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-start text-secondary p-4">
                    Nenhuma compra de loja registrada
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const orderTotal = (o.items || []).reduce((s, it) => s + num(it.price) * num(it.quantity), 0);
                  return (
                    <tr key={`${o.cpf}-${o.orderNumber}`}>
                      <td>
                        <em>{o.camperName}</em>
                      </td>
                      <td className="text-secondary small">{o.cpf}</td>
                      <td className="text-secondary small">{o.orderNumber}</td>
                      <td>
                        <ul className="mb-0 ps-3">
                          {(o.items || []).map((it, i) => (
                            <li key={`${it.id}-${i}`}>
                              {it.name}
                              {num(it.quantity) > 1 ? ` (x${it.quantity})` : ''} — R$ {formatBRL(num(it.price) * num(it.quantity))}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>R$ {formatBRL(orderTotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminStoreOrders.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminStoreOrders;
