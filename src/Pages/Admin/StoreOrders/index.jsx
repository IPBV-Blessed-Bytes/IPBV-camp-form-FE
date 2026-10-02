import { useState, useEffect, useMemo } from 'react';
import { Table, Badge, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { listStoreOrders, getProductSales } from '@/services/storeOrders';
import { downloadSingleSheet } from '@/utils/excelExport';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';

const LOW_STOCK_THRESHOLD = 5;

const formatBRL = (cents) =>
  typeof cents === 'number'
    ? (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—';

const statusTone = (status) => {
  if (!status || status === 'paid' || status === 'free') return 'success';
  if (status === 'pending') return 'warning';
  return 'secondary';
};

const AdminStoreOrders = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;
    Promise.all([listStoreOrders(), getProductSales()])
      .then(([o, s]) => {
        if (!active) return;
        setOrders(o);
        setSales(s);
      })
      .catch(() => {
        if (!active) return;
        setOrders([]);
        setSales([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const statusLabel = (status) => {
    if (!status || status === 'free') return t('admin.storeOrders.status.confirmed');
    return t(`admin.storeOrders.status.${status}`, { defaultValue: status });
  };

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'confirmed' && (!o.paymentStatus || o.paymentStatus === 'paid' || o.paymentStatus === 'free')) ||
        o.paymentStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        (o.name || '').toLowerCase().includes(term) ||
        (o.cpf || '').includes(term) ||
        (o.orderNumber || '').toLowerCase().includes(term)
      );
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const totalSold = sales.reduce((sum, p) => sum + (p.soldConfirmed || 0), 0);
    const outOfStock = sales.filter((p) => p.initialStock != null && p.remaining === 0).length;
    const lowStock = sales.filter(
      (p) => p.initialStock != null && p.remaining > 0 && p.remaining <= LOW_STOCK_THRESHOLD,
    ).length;
    return [
      { label: t('admin.storeOrders.stats.orders'), value: orders.length },
      { label: t('admin.storeOrders.stats.itemsSold'), value: totalSold, tone: 'free' },
      { label: t('admin.storeOrders.stats.lowStock'), value: lowStock, tone: lowStock > 0 ? 'accent' : undefined },
      { label: t('admin.storeOrders.stats.outOfStock'), value: outOfStock, tone: outOfStock > 0 ? 'used' : undefined },
    ];
  }, [orders, sales, t]);

  const handleExport = () => {
    const rows = filteredOrders.map((o) => ({
      [t('admin.storeOrders.col.date')]: o.createdAt || '',
      [t('admin.storeOrders.col.name')]: o.name || '',
      [t('admin.storeOrders.col.cpf')]: o.cpf || '',
      [t('admin.storeOrders.col.order')]: o.orderNumber || '',
      [t('admin.storeOrders.col.status')]: statusLabel(o.paymentStatus),
      [t('admin.storeOrders.col.products')]: (o.products || []).map((p) => p.name).join(', '),
      [t('admin.storeOrders.col.total')]: formatBRL(o.totalCents),
    }));
    downloadSingleSheet({ filename: 'pedidos-loja.xlsx', sheetName: 'Pedidos', rows });
  };

  const toolbarButtons = [
    {
      id: 'export',
      name: t('admin.storeOrders.export'),
      onClick: handleExport,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
      iconSize: 22,
      fill: '#007185',
    },
  ];

  return (
    <div className="admin-subpage store-orders">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.storeOrders.title')}
        subtitle={t('admin.storeOrders.subtitle')}
        typeIcon="cart"
        iconSize={44}
        sessionKey="pedidos-loja"
      />

      <StatCards items={stats} />

      <section className="store-orders__section">
        <SectionHeader title={t('admin.storeOrders.salesTitle')} count={sales.length} />
        <div className="admin-table-card">
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>{t('admin.storeOrders.col.product')}</th>
                <th>{t('admin.storeOrders.col.price')}</th>
                <th className="text-center">{t('admin.storeOrders.col.sold')}</th>
                <th className="text-center">{t('admin.storeOrders.col.pending')}</th>
                <th className="text-center">{t('admin.storeOrders.col.stock')}</th>
                <th className="text-center">{t('admin.storeOrders.col.remaining')}</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    {t('admin.storeOrders.empty')}
                  </td>
                </tr>
              )}
              {sales.map((p) => (
                <tr key={p.productId}>
                  <td>{p.name}</td>
                  <td>{formatBRL(p.priceCents)}</td>
                  <td className="text-center">{p.soldConfirmed}</td>
                  <td className="text-center">{p.soldPending > 0 ? p.soldPending : '—'}</td>
                  <td className="text-center">{p.initialStock != null ? p.initialStock : '—'}</td>
                  <td className="text-center">
                    {p.initialStock == null ? (
                      '—'
                    ) : p.remaining === 0 ? (
                      <Badge bg="danger">{t('admin.storeOrders.outOfStock')}</Badge>
                    ) : p.remaining <= LOW_STOCK_THRESHOLD ? (
                      <Badge bg="warning" text="dark">
                        {p.remaining}
                      </Badge>
                    ) : (
                      p.remaining
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <section className="store-orders__section">
        <SectionHeader title={t('admin.storeOrders.ordersTitle')} count={filteredOrders.length} />
        <AdminToolbar buttons={toolbarButtons} />
        <div className="store-orders__filters">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.storeOrders.searchPlaceholder')} />
          <Form.Select
            className="store-orders__status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('admin.storeOrders.filter.all')}</option>
            <option value="confirmed">{t('admin.storeOrders.status.confirmed')}</option>
            <option value="pending">{t('admin.storeOrders.status.pending')}</option>
            <option value="refunded">{t('admin.storeOrders.status.refunded')}</option>
            <option value="canceled">{t('admin.storeOrders.status.canceled')}</option>
          </Form.Select>
        </div>
        <div className="admin-table-card">
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>{t('admin.storeOrders.col.date')}</th>
                <th>{t('admin.storeOrders.col.name')}</th>
                <th>{t('admin.storeOrders.col.order')}</th>
                <th>{t('admin.storeOrders.col.status')}</th>
                <th>{t('admin.storeOrders.col.products')}</th>
                <th>{t('admin.storeOrders.col.total')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    {t('admin.storeOrders.noOrders')}
                  </td>
                </tr>
              )}
              {filteredOrders.map((o) => (
                <tr key={o.registrationId}>
                  <td className="text-nowrap">{o.createdAt}</td>
                  <td>
                    {o.name || '—'}
                    {o.cpf ? <div className="text-muted small">{o.cpf}</div> : null}
                  </td>
                  <td className="text-nowrap">{o.orderNumber || '—'}</td>
                  <td>
                    <Badge bg={statusTone(o.paymentStatus)}>{statusLabel(o.paymentStatus)}</Badge>
                  </td>
                  <td>
                    <div className="store-orders__products">
                      {(o.products || []).map((p) => (
                        <span className="store-orders__chip" key={p.id}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-nowrap">{formatBRL(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <Loading loading={loading} />
    </div>
  );
};

AdminStoreOrders.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminStoreOrders;
