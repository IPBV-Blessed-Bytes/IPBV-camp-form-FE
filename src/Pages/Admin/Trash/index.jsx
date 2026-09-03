import { useEffect, useMemo, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { listDeletedCampers, restoreDeletedCamper, purgeDeletedCamper } from '@/services/deletedCampers';
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

const METHOD_LABEL = { creditCard: 'Cartão', pix: 'Pix', ticket: 'Boleto', boleto: 'Boleto' };

const AdminTrash = ({ loggedUsername }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [purgeTarget, setPurgeTarget] = useState(null);

  scrollUp();

  const reload = () => {
    setLoading(true);
    listDeletedCampers()
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
      await restoreDeletedCamper(item.id);
      registerLog(`Restaurou a inscrição de ${item.name} (CPF ${item.cpf})`, loggedUsername);
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
      await purgeDeletedCamper(purgeTarget.id);
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

          <div className="admin-table-card">
            <Table striped bordered hover responsive className="custom-table">
              <thead>
                <tr>
                  <th className="table-cells-header">Excluída em:</th>
                  <th className="table-cells-header">Inscrito:</th>
                  <th className="table-cells-header">CPF:</th>
                  <th className="table-cells-header">Pedido:</th>
                  <th className="table-cells-header">Forma:</th>
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
                      <td>{item.name}</td>
                      <td>{item.cpf}</td>
                      <td>{item.orderNumber || '—'}</td>
                      <td>{METHOD_LABEL[item.formPayment] || (item.totalPrice === '0' ? 'Não pagante' : '—')}</td>
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

      <Loading loading={loading} />
    </div>
  );
};

AdminTrash.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminTrash;
