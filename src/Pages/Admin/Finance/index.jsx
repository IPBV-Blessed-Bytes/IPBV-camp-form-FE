import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import SectionHeader from '@/components/Admin/SectionHeader';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import { getFinanceOverview } from '@/services/finance';
import './style.scss';

const brl = (cents) =>
  Number((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const METHOD_LABEL = { pix: 'Pix', cartao: 'Cartão', boleto: 'Boleto', outros: 'Outros' };
const METHOD_ICON = { pix: 'pix', cartao: 'credit-card', boleto: 'barcode', outros: 'money' };

const AdminFinance = ({ loggedUsername }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinanceOverview()
      .then(setData)
      .catch(() => toast.error('Não foi possível carregar o financeiro.'))
      .finally(() => setLoading(false));
  }, []);

  const statItems = [
    { label: 'Recebido (inscrições pagas)', value: brl(data?.paidCents), tone: 'free' },
    { label: 'Inscrições pagas', value: data?.paidCount ?? 0 },
    { label: 'A receber (pendentes)', value: brl(data?.pendingCents), tone: 'used' },
    { label: 'Inscrições pendentes', value: data?.pendingCount ?? 0 },
  ];

  const balance = data?.balance;
  const byMethod = data?.byMethod || [];

  return (
    <div className="admin-subpage admin-finance">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Financeiro"
        subtitle="Vendas do evento e o dinheiro a receber, tudo em um só lugar."
        typeIcon="money"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <SectionHeader title="Vendas do evento" />
            <StatCards items={statItems} />

            <SectionHeader title="Saldo no provedor de pagamento" />
            {data?.recipientOnboarded && balance ? (
              <div className="admin-finance__balance">
                <div className="admin-finance__balance-card admin-finance__balance-card--available">
                  <span className="admin-finance__balance-label">Disponível para saque</span>
                  <span className="admin-finance__balance-value">{brl(balance.availableCents)}</span>
                </div>
                <div className="admin-finance__balance-card">
                  <span className="admin-finance__balance-label">A liberar</span>
                  <span className="admin-finance__balance-value">{brl(balance.waitingCents)}</span>
                </div>
                <div className="admin-finance__balance-card">
                  <span className="admin-finance__balance-label">Já transferido</span>
                  <span className="admin-finance__balance-value">{brl(balance.transferredCents)}</span>
                </div>
              </div>
            ) : (
              <div className="admin-finance__notice">
                <Icons typeIcon="money" iconSize={26} fill="#8a5300" />
                <div>
                  {data?.recipientOnboarded ? (
                    <span>Não foi possível obter o saldo do provedor de pagamento agora. Tente novamente em instantes.</span>
                  ) : (
                    <span>
                      Configure o <b>Recebimento</b> para ver o saldo disponível e os valores a liberar do provedor de
                      pagamento.
                    </span>
                  )}
                </div>
              </div>
            )}

            <SectionHeader title="Recebido por forma de pagamento" />
            {byMethod.length === 0 ? (
              <p className="text-secondary">Nenhuma inscrição paga ainda.</p>
            ) : (
              <div className="admin-finance__methods">
                {byMethod.map((m) => (
                  <div key={m.method} className="admin-finance__method">
                    <span className="admin-finance__method-icon">
                      <Icons typeIcon={METHOD_ICON[m.method] || 'money'} iconSize={22} fill="#007185" />
                    </span>
                    <div className="admin-finance__method-info">
                      <strong>{METHOD_LABEL[m.method] || m.method}</strong>
                      <span>{m.count} inscrição(ões)</span>
                    </div>
                    <span className="admin-finance__method-value">{brl(m.cents)}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="admin-finance__footnote">
              As vendas vêm das inscrições registradas no sistema. O <b>saldo</b> e os valores a liberar são a fonte
              oficial do dinheiro, direto do provedor de pagamento.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

AdminFinance.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFinance;
