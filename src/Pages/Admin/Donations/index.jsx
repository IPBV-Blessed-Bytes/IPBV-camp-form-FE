import { useEffect, useMemo, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { listAllDonations } from '@/services/donations';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import Loading from '@/components/Global/Loading';

const formatBRL = (reais) => (Number(reais) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR');
};

const STATUS = {
  PENDING: { label: 'Aguardando pagamento', bg: 'warning' },
  CONFIRMED: { label: 'Confirmada', bg: 'success' },
};

const AdminDonations = ({ loggedUsername }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  scrollUp();

  useEffect(() => {
    listAllDonations()
      .then((list) => {
        const sorted = [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        setDonations(sorted);
      })
      .catch(() => toast.error('Erro ao carregar doações.'))
      .finally(() => setLoading(false));
  }, []);

  const statItems = useMemo(() => {
    const confirmed = donations.filter((donation) => donation.status === 'CONFIRMED');
    const pending = donations.filter((donation) => donation.status === 'PENDING');
    const confirmedTotal = confirmed.reduce((acc, donation) => acc + Number(donation.amount || 0), 0);
    const pendingTotal = pending.reduce((acc, donation) => acc + Number(donation.amount || 0), 0);
    return [
      { label: 'Total confirmado (para o social)', value: formatBRL(confirmedTotal), tone: 'used' },
      { label: 'Doadores confirmados', value: confirmed.length, tone: 'accent' },
      { label: 'Aguardando pagamento', value: formatBRL(pendingTotal), tone: 'available' },
    ];
  }, [donations]);

  return (
    <div className="admin-subpage admin-subpage--donations">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Doações"
        subtitle="Contribuições para ajuda a pessoas necessitadas feitas no carrinho, separadas do valor dos pacotes."
        typeIcon="couple"
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
                    <th className="table-cells-header">Pedido:</th>
                    <th className="table-cells-header">Doador:</th>
                    <th className="table-cells-header">CPF:</th>
                    <th className="table-cells-header">Status:</th>
                    <th className="table-cells-header">Valor do pacote:</th>
                    <th className="table-cells-header">Doação:</th>
                    <th className="table-cells-header">Data:</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-secondary py-4">
                        Nenhuma doação registrada.
                      </td>
                    </tr>
                  ) : (
                    donations.map((donation) => {
                      const status = STATUS[donation.status] || { label: donation.status, bg: 'secondary' };
                      return (
                        <tr key={donation.id}>
                          <td>{donation.orderNumber}</td>
                          <td>{donation.payerName}</td>
                          <td>{donation.cpf}</td>
                          <td>
                            <Badge bg={status.bg}>{status.label}</Badge>
                          </td>
                          <td>{formatBRL(donation.packageTotal)}</td>
                          <td className="fw-bold">{formatBRL(donation.amount)}</td>
                          <td>{formatDate(donation.confirmedAt || donation.createdAt)}</td>
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

AdminDonations.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminDonations;
