import { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  listAllDonations,
  createManualDonation,
  updateManualDonation,
  deleteManualDonation,
} from '@/services/donations';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import { downloadSingleSheet } from '@/utils/excelExport';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import StatCards from '@/components/Admin/StatCards';
import CustomModal from '@/components/Global/CustomModal';
import SpinnerButton from '@/components/Global/SpinnerButton';
import ActionButton from '@/components/Global/ActionButton';
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

const EMPTY_FORM = { payerName: '', cpf: '', packageTotal: '', amount: '', bankAccount: '' };

const AdminDonations = ({ loggedUsername }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInsert, setShowInsert] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  scrollUp();

  const reload = (silent = false) => {
    if (!silent) setLoading(true);
    return listAllDonations()
      .then((list) => {
        const confirmedOnly = list.filter((donation) => donation.status === 'CONFIRMED');
        const sorted = confirmedOnly.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        setDonations(sorted);
      })
      .catch(() => toast.error('Erro ao carregar doações.'))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    reload();
  }, []);

  const statItems = useMemo(() => {
    const confirmedTotal = donations.reduce((acc, donation) => acc + Number(donation.amount || 0), 0);
    return [
      { label: 'Total confirmado (para o social)', value: formatBRL(confirmedTotal), tone: 'used' },
      { label: 'Doadores confirmados', value: donations.length, tone: 'accent' },
    ];
  }, [donations]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const openInsert = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowInsert(true);
  };

  const openEdit = (donation) => {
    setEditId(donation.id);
    setForm({
      payerName: donation.payerName || '',
      cpf: donation.cpf || '',
      packageTotal: donation.packageTotal == null ? '' : String(donation.packageTotal),
      amount: donation.amount == null ? '' : String(donation.amount),
      bankAccount: donation.bankAccount || '',
    });
    setShowInsert(true);
  };

  const handleSave = async () => {
    if (!form.payerName.trim()) {
      toast.error('Informe o nome do doador.');
      return;
    }
    const amount = parseInt(form.amount, 10);
    if (!amount || amount <= 0) {
      toast.error('Informe um valor de doação válido.');
      return;
    }
    setSaving(true);
    try {
      const packageTotalParsed = form.packageTotal === '' ? null : parseInt(form.packageTotal, 10);
      const payload = {
        payerName: form.payerName.trim(),
        cpf: form.cpf.trim(),
        packageTotal: Number.isNaN(packageTotalParsed) ? null : packageTotalParsed,
        amount,
        bankAccount: form.bankAccount.trim(),
      };
      if (editId) {
        await updateManualDonation(editId, payload);
        registerLog(`Editou a doação manual de ${payload.payerName} (R$ ${amount})`, loggedUsername);
        toast.success('Doação atualizada.');
      } else {
        await createManualDonation(payload);
        registerLog(`Inseriu manualmente uma doação de R$ ${amount} (${payload.payerName})`, loggedUsername);
        toast.success('Doação inserida.');
      }
      setShowInsert(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível salvar a doação.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteManualDonation(deleteTarget.id);
      registerLog(`Excluiu a doação manual de ${deleteTarget.payerName}`, loggedUsername);
      toast.success('Doação excluída.');
      setDeleteTarget(null);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível excluir a doação.');
    } finally {
      setSaving(false);
    }
  };

  const generateExcel = () => {
    const rows = donations.map((donation) => ({
      Pedido: donation.orderNumber,
      Doador: donation.payerName,
      CPF: donation.cpf,
      'Total do Pacote': Number(donation.packageTotal || 0),
      Doação: Number(donation.amount || 0),
      Data: formatDate(donation.confirmedAt || donation.createdAt),
      Status: (STATUS[donation.status] || {}).label || donation.status,
      'Inserção Manual': donation.manualInsertion ? 'Sim' : 'Não',
      'Conta Bancária': donation.bankAccount || '',
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
    {
      fill: '#fff',
      iconSize: 20,
      id: 'donations-insert',
      name: 'Inserir Doação',
      onClick: openInsert,
      typeButton: 'teal-blue',
      typeIcon: 'plus',
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
                    <th className="table-cells-header">Inserção Manual:</th>
                    <th className="table-cells-header">Conta Bancária:</th>
                    <th className="table-cells-header">Ações:</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-start text-secondary p-4">
                        Nenhuma doação registrada
                      </td>
                    </tr>
                  ) : (
                    donations.map((donation) => {
                      const status = STATUS[donation.status] || { label: donation.status, bg: 'secondary' };
                      return (
                        <tr key={donation.id}>
                          <td>{donation.orderNumber || '—'}</td>
                          <td>{donation.payerName}</td>
                          <td>{donation.cpf || '—'}</td>
                          <td>
                            <Badge bg={status.bg}>{status.label}</Badge>
                          </td>
                          <td>{donation.packageTotal == null ? '—' : formatBRL(donation.packageTotal)}</td>
                          <td className="fw-bold">{formatBRL(donation.amount)}</td>
                          <td>{formatDate(donation.confirmedAt || donation.createdAt)}</td>
                          <td>
                            <Badge bg={donation.manualInsertion ? 'info' : 'secondary'}>
                              {donation.manualInsertion ? 'Sim' : 'Não'}
                            </Badge>
                          </td>
                          <td>{donation.bankAccount || '—'}</td>
                          <td>
                            {donation.manualInsertion ? (
                              <div className="table-action-cell">
                                <ActionButton
                                  action="edit"
                                  iconSize={18}
                                  title="Editar"
                                  onClick={() => openEdit(donation)}
                                />
                                <ActionButton
                                  action="delete"
                                  iconSize={18}
                                  title="Excluir"
                                  onClick={() => setDeleteTarget(donation)}
                                />
                              </div>
                            ) : (
                              <span className="text-secondary">—</span>
                            )}
                          </td>
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

      <CustomModal
        show={showInsert}
        onHide={() => setShowInsert(false)}
        variant="confirm"
        title={editId ? 'Editar Doação' : 'Inserir Doação'}
        icon={editId ? 'edit' : 'plus'}
        iconFill={editId ? '' : '#057c05'}
        footer={
          <>
            <SpinnerButton variant="outline-secondary" onClick={() => setShowInsert(false)}>
              Voltar
            </SpinnerButton>
            <SpinnerButton variant="teal-blue" onClick={handleSave} loading={saving}>
              {editId ? 'Salvar' : 'Inserir'}
            </SpinnerButton>
          </>
        }
      >
        {!editId && (
          <p className="text-secondary small mb-3">
            Para doações feitas fora do fluxo padrão (inscritos manuais ou doações direto na conta da igreja). A doação
            entra como <b>confirmada</b> com a data de agora.
          </p>
        )}
        <Form.Group className="mb-3">
          <Form.Label>
            <b>Nome do Doador:</b>
          </Form.Label>
          <Form.Control value={form.payerName} onChange={(e) => setField('payerName', e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <b>CPF:</b>
          </Form.Label>
          <Form.Control value={form.cpf} onChange={(e) => setField('cpf', e.target.value)} placeholder="Opcional" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <b>Valor do Pacote (R$):</b>
          </Form.Label>
          <Form.Control
            type="number"
            min="0"
            value={form.packageTotal}
            onChange={(e) => setField('packageTotal', e.target.value)}
            placeholder="Opcional"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <b>Valor da Doação (R$):</b>
          </Form.Label>
          <Form.Control
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => setField('amount', e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>
            <b>Conta Bancária:</b>
          </Form.Label>
          <Form.Control
            value={form.bankAccount}
            onChange={(e) => setField('bankAccount', e.target.value)}
            placeholder="Conta em que a doação foi paga"
          />
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={Boolean(deleteTarget)}
        onHide={() => setDeleteTarget(null)}
        variant="cancel"
        title="Excluir Doação"
        footer={
          <>
            <SpinnerButton variant="outline-secondary" onClick={() => setDeleteTarget(null)}>
              Voltar
            </SpinnerButton>
            <SpinnerButton variant="danger" onClick={handleDelete} loading={saving}>
              Excluir
            </SpinnerButton>
          </>
        }
      >
        {deleteTarget && (
          <p>
            Excluir a doação manual de <b>{deleteTarget.payerName}</b> (R$ {deleteTarget.amount})? Esta ação não pode
            ser desfeita.
          </p>
        )}
      </CustomModal>
    </div>
  );
};

AdminDonations.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminDonations;
