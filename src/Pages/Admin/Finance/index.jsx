import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import SectionHeader from '@/components/Admin/SectionHeader';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import { getFinanceOverview } from '@/services/finance';
import './style.scss';

const brl = (cents) =>
  Number((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const METHOD_ICON = { pix: 'pix', cartao: 'credit-card', boleto: 'barcode', outros: 'money' };

const AdminFinance = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinanceOverview()
      .then(setData)
      .catch(() => toast.error(t('admin.finance.loadError')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statItems = [
    { label: t('admin.finance.statReceived'), value: brl(data?.paidCents), tone: 'free' },
    { label: t('admin.finance.statPaidCount'), value: data?.paidCount ?? 0 },
    { label: t('admin.finance.statPending'), value: brl(data?.pendingCents), tone: 'used' },
    { label: t('admin.finance.statPendingCount'), value: data?.pendingCount ?? 0 },
  ];

  const balance = data?.balance;
  const byMethod = data?.byMethod || [];

  return (
    <div className="admin-subpage admin-finance">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.finance.title')}
        subtitle={t('admin.finance.subtitle')}
        typeIcon="money"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <SectionHeader title={t('admin.finance.sectionSales')} />
            <StatCards items={statItems} />

            <SectionHeader title={t('admin.finance.sectionBalance')} />
            {data?.recipientOnboarded && balance ? (
              <div className="admin-finance__balance">
                <div className="admin-finance__balance-card admin-finance__balance-card--available">
                  <span className="admin-finance__balance-label">{t('admin.finance.balanceAvailable')}</span>
                  <span className="admin-finance__balance-value">{brl(balance.availableCents)}</span>
                </div>
                <div className="admin-finance__balance-card">
                  <span className="admin-finance__balance-label">{t('admin.finance.balanceWaiting')}</span>
                  <span className="admin-finance__balance-value">{brl(balance.waitingCents)}</span>
                </div>
                <div className="admin-finance__balance-card">
                  <span className="admin-finance__balance-label">{t('admin.finance.balanceTransferred')}</span>
                  <span className="admin-finance__balance-value">{brl(balance.transferredCents)}</span>
                </div>
              </div>
            ) : (
              <div className="admin-finance__notice">
                <Icons typeIcon="money" iconSize={26} fill="#8a5300" />
                <div>
                  {data?.recipientOnboarded ? (
                    <span>{t('admin.finance.balanceErrorNotice')}</span>
                  ) : (
                    <span>
                      <Trans i18nKey="admin.finance.balanceConfigNotice" components={{ b: <b /> }} />
                    </span>
                  )}
                </div>
              </div>
            )}

            <SectionHeader title={t('admin.finance.sectionByMethod')} />
            {byMethod.length === 0 ? (
              <p className="text-secondary">{t('admin.finance.noPaid')}</p>
            ) : (
              <div className="admin-finance__methods">
                {byMethod.map((m) => (
                  <div key={m.method} className="admin-finance__method">
                    <span className="admin-finance__method-icon">
                      <Icons typeIcon={METHOD_ICON[m.method] || 'money'} iconSize={22} fill="#007185" />
                    </span>
                    <div className="admin-finance__method-info">
                      <strong>{t(`admin.finance.method_${m.method}`, m.method)}</strong>
                      <span>{t('admin.finance.methodCount', { count: m.count })}</span>
                    </div>
                    <span className="admin-finance__method-value">{brl(m.cents)}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="admin-finance__footnote">
              <Trans i18nKey="admin.finance.footnote" components={{ b: <b /> }} />
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
