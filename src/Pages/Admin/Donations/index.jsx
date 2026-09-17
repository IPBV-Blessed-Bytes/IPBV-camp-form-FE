import { useEffect, useMemo, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { listAllDonations } from '@/services/donations';
import scrollUp from '@/hooks/useScrollUp';
import { downloadSingleSheet } from '@/utils/excelExport';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
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
        const confirmedOnly = list.filter((donation) => donation.status === 'CONFIRMED');
        const sorted = confirmedOnly.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        setDonations(sorted);
      })
      .catch(() => toast.error('Erro ao carregar doações.'))
      .finally(() => setLoading(false));
  }, []);

  const statItems = useMemo(() => {
    const confirmedTotal = donations.reduce((acc, donation) => acc + Number(donation.amount || 0), 0);
    return [
      { label: 'Total confirmado (para o social)', value: formatBRL(confirmedTotal), tone: 'used' },
      { label: 'Doadores confirmados', value: donations.length, tone: 'accent' },
    ];
  }, [donations]);

  const generateExcel = () => {
    const rows = donations.map((donation) => ({
      Pedido: donation.orderNumber,
      Pagador: donation.payerName,
      CPF: donation.cpf,
      'Total do Pacote': Number(donation.packageTotal || 0),
      Doação: Number(donation.amount || 0),
      Data: formatDate(donation.confirmedAt || donation.createdAt),
      Status: (STATUS[donation.status] || {}).label || donation.status,
    }));
    downloadSingleSheet({ filename: 'doacoes.xlsx', sheetName: 'Doações', rows });
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'donations-excel',
      name: 'Baixar Relatório',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
  ];

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
            <AdminToolbar buttons={toolsButtons} />

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
                      <td colSpan={7} className="text-start text-secondary p-4">
                        Nenhuma doação registrada
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
