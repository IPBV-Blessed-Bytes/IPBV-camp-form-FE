import { useEffect, useMemo, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import {
  listDeletedRegistrations,
  restoreDeletedRegistration,
  purgeDeletedRegistration,
  purgeAllDeletedRegistrations,
} from '@/services/deletedRegistrations';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import ActionButton from '@/components/Global/ActionButton';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('pt-BR');
};

const STATUS_KEY = { paid: 'statusPaid', pending: 'statusPending', refunded: 'statusRefunded' };

const AdminTrash = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [purgeTarget, setPurgeTarget] = useState(null);
  const [showPurgeAll, setShowPurgeAll] = useState(false);

  scrollUp();

  const reload = () => {
    setLoading(true);
    listDeletedRegistrations()
      .then(setItems)
      .catch(() => toast.error(t('admin.trash.loadError')))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    reload();
  }, []);

  const statItems = useMemo(() => [{ label: t('admin.trash.statCount'), value: items.length, tone: 'accent' }], [items, t]);

  const handleRestore = async (item) => {
    setSaving(true);
    try {
      await restoreDeletedRegistration(item.id);
      registerLog(`Restaurou a inscrição de ${item.payerName} (CPF ${item.cpf})`, loggedUsername);
      toast.success(t('admin.trash.restoreSuccess'));
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || t('admin.trash.restoreError'));
    } finally {
      setSaving(false);
    }
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    setSaving(true);
    try {
      await purgeDeletedRegistration(purgeTarget.id);
      registerLog(
        `Excluiu definitivamente a inscrição de ${purgeTarget.name} (CPF ${purgeTarget.cpf})`,
        loggedUsername,
      );
      toast.success(t('admin.trash.purgeSuccess'));
      setPurgeTarget(null);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || t('admin.trash.purgeError'));
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeAll = async () => {
    setSaving(true);
    try {
      await purgeAllDeletedRegistrations();
      registerLog('Limpou a lixeira (excluiu definitivamente todas as inscrições)', loggedUsername);
      toast.success(t('admin.trash.purgeAllSuccess'));
      setShowPurgeAll(false);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || t('admin.trash.purgeAllError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage admin-subpage--trash">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.trash.title')}
        subtitle={t('admin.trash.subtitle')}
        typeIcon="delete"
      />

      <div className="admin-subpage__content">
        <>
          <StatCards items={statItems} />

          {items.length > 0 && (
            <div className="d-flex justify-content-end mb-3">
              <Button variant="danger" disabled={saving} onClick={() => setShowPurgeAll(true)}>
                <Icons typeIcon="delete" iconSize={18} fill="#fff" /> &nbsp;{t('admin.trash.clearTrash')}
              </Button>
            </div>
          )}

          <div className="admin-table-card">
            <Table striped bordered hover responsive className="custom-table">
              <thead>
                <tr>
                  <th className="table-cells-header">{t('admin.trash.colDeletedAt')}</th>
                  <th className="table-cells-header">{t('admin.trash.colRegistrant')}</th>
                  <th className="table-cells-header">{t('admin.trash.colCpf')}</th>
                  <th className="table-cells-header">{t('admin.trash.colOrder')}</th>
                  <th className="table-cells-header">{t('admin.trash.colStatus')}</th>
                  <th className="table-cells-header">{t('admin.trash.colDeletedBy')}</th>
                  <th className="table-cells-header">{t('admin.trash.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-start text-secondary p-4">
                      {t('admin.trash.empty')}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.deletedAt)}</td>
                      <td>{item.payerName}</td>
                      <td>{item.cpf}</td>
                      <td>{item.orderNumber || '—'}</td>
                      <td>{STATUS_KEY[item.paymentStatus] ? t(`admin.trash.${STATUS_KEY[item.paymentStatus]}`) : item.paymentStatus || '—'}</td>
                      <td>{item.deletedBy || '—'}</td>
                      <td>
                        <div className="table-action-cell">
                          <ActionButton
                            action="restore"
                            iconSize={18}
                            disabled={saving}
                            onClick={() => handleRestore(item)}
                            title={t('admin.trash.restoreTitle')}
                          >
                            {t('admin.trash.restore')}
                          </ActionButton>
                          <ActionButton
                            action="delete"
                            iconSize={18}
                            disabled={saving}
                            onClick={() => setPurgeTarget(item)}
                            title={t('admin.trash.purgeTitle')}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </>
      </div>

      <CustomModal
        show={Boolean(purgeTarget)}
        onHide={() => setPurgeTarget(null)}
        variant="cancel"
        title={t('admin.trash.purgeModalTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setPurgeTarget(null)}>
              {t('admin.trash.back')}
            </Button>
            <SpinnerButton variant="danger" onClick={handlePurge} loading={saving}>
              {t('admin.trash.purgeBtn')}
            </SpinnerButton>
          </>
        }
      >
        {purgeTarget && (
          <p>
            <Trans
              i18nKey="admin.trash.purgeConfirmText"
              components={{ b: <b /> }}
              values={{ name: purgeTarget.name }}
            />
          </p>
        )}
      </CustomModal>

      <CustomModal
        show={showPurgeAll}
        onHide={() => setShowPurgeAll(false)}
        variant="cancel"
        title={t('admin.trash.purgeAllModalTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowPurgeAll(false)}>
              {t('admin.trash.back')}
            </Button>
            <SpinnerButton variant="danger" onClick={handlePurgeAll} loading={saving}>
              {t('admin.trash.clearTrash')}
            </SpinnerButton>
          </>
        }
      >
        <p>
          <Trans
            i18nKey="admin.trash.purgeAllConfirmText"
            components={{ b: <b /> }}
            values={{ count: items.length }}
          />
        </p>
      </CustomModal>

      <Loading loading={loading} />
    </div>
  );
};

AdminTrash.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminTrash;
