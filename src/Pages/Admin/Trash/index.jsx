import { useEffect, useMemo, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
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
import CustomModal from '@/components/Global/CustomModal';

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('pt-BR');
};

const STATUS_LABEL = { paid: 'Pago', pending: 'Pendente', refunded: 'Reembolsado' };

const AdminTrash = ({ loggedUsername }) => {
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
      .catch(() => toast.error('Erro ao carregar a lixeira.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const statItems = useMemo(() => [{ label: 'Inscrições na lixeira', value: items.length, tone: 'accent' }], [items]);

  const handleRestore = async (item) => {
    setLoading(true);
    setSaving(true);
    try {
      await restoreDeletedRegistration(item.id);
      registerLog(`Restaurou a inscrição de ${item.payerName} (CPF ${item.cpf})`, loggedUsername);
      toast.success('Inscrição restaurada para os acampantes.');
      reload();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível restaurar a inscrição.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    setSaving(true);
    setLoading(true);
    try {
      await purgeDeletedRegistration(purgeTarget.id);
      registerLog(
        `Excluiu definitivamente a inscrição de ${purgeTarget.name} (CPF ${purgeTarget.cpf})`,
        loggedUsername,
      );
      toast.success('Removido definitivamente da lixeira.');
      setPurgeTarget(null);
      reload();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível remover.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handlePurgeAll = async () => {
    setSaving(true);
    setLoading(true);
    try {
      await purgeAllDeletedRegistrations();
      registerLog('Limpou a lixeira (excluiu definitivamente todas as inscrições)', loggedUsername);
      toast.success('Lixeira limpa. Todas as inscrições foram removidas definitivamente.');
      setShowPurgeAll(false);
      reload();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível limpar a lixeira.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <div className="admin-subpage admin-subpage--trash">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Lixeira"
        subtitle="Inscrições excluídas. Você pode restaurar ou remover definitivamente."
        typeIcon="delete"
      />

      <div className="admin-subpage__content">
        <>
          <StatCards items={statItems} />

          {items.length > 0 && (
            <div className="d-flex justify-content-end mb-3">
              <Button variant="danger" disabled={saving} onClick={() => setShowPurgeAll(true)}>
                <Icons typeIcon="delete" iconSize={18} fill="#fff" /> &nbsp;Limpar lixeira
              </Button>
            </div>
          )}

          <div className="admin-table-card">
            <Table striped bordered hover responsive className="custom-table">
              <thead>
                <tr>
                  <th className="table-cells-header">Excluída em:</th>
                  <th className="table-cells-header">Inscrito:</th>
                  <th className="table-cells-header">CPF:</th>
                  <th className="table-cells-header">Pedido:</th>
                  <th className="table-cells-header">Status:</th>
                  <th className="table-cells-header">Excluída por:</th>
                  <th className="table-cells-header">Ações:</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-4">
                      A lixeira está vazia.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.deletedAt)}</td>
                      <td>{item.payerName}</td>
                      <td>{item.cpf}</td>
                      <td>{item.orderNumber || '—'}</td>
                      <td>{STATUS_LABEL[item.paymentStatus] || item.paymentStatus || '—'}</td>
                      <td>{item.deletedBy || '—'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            className="btn-restore"
                            variant="outline-success"
                            size="sm"
                            disabled={saving}
                            onClick={() => handleRestore(item)}
                            title="Restaurar inscrição"
                          >
                            <Icons typeIcon="refresh" iconSize={18} fill="#198754" /> <b>Restaurar</b>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            disabled={saving}
                            onClick={() => setPurgeTarget(item)}
                            title="Excluir definitivamente"
                          >
                            <Icons typeIcon="delete" iconSize={18} fill="#dc3545" />
                          </Button>
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
        title="Excluir Definitivamente"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setPurgeTarget(null)}>
              Voltar
            </Button>
            <Button variant="danger" onClick={handlePurge} disabled={saving}>
              Excluir definitivamente
            </Button>
          </>
        }
      >
        {purgeTarget && (
          <p>
            Remover <b>definitivamente</b> a inscrição de <b>{purgeTarget.name}</b> da lixeira? Esta ação{' '}
            <b>não pode ser desfeita</b> e a inscrição não poderá mais ser restaurada.
          </p>
        )}
      </CustomModal>

      <CustomModal
        show={showPurgeAll}
        onHide={() => setShowPurgeAll(false)}
        variant="cancel"
        title="Limpar Lixeira"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowPurgeAll(false)}>
              Voltar
            </Button>
            <Button variant="danger" onClick={handlePurgeAll} disabled={saving}>
              Limpar lixeira
            </Button>
          </>
        }
      >
        <p>
          Remover <b>definitivamente</b> todas as <b>{items.length}</b> inscrições da lixeira? Esta ação{' '}
          <b>não pode ser desfeita</b> e nenhuma delas poderá mais ser restaurada.
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
