import { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Accordion } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { listAllBoletos, updateBoletoDueDate, cancelBoleto, reissueBoleto, deleteBoletosByOrder } from '@/services/boletos';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import { downloadSingleSheet } from '@/utils/excelExport';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import StatCards from '@/components/Admin/StatCards';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import ActionButton from '@/components/Global/ActionButton';
import CustomModal from '@/components/Global/CustomModal';
import './style.scss';

registerLocale('ptBR', ptBR);

const formatBRL = (centavos) =>
  (Number(centavos || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR');
};

const daysOverdue = (dueDate) => {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
};

const waLink = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
};

const STATUS = {
  PENDING: { label: 'Pendente', bg: 'warning' },
  PAID: { label: 'Pago', bg: 'success' },
  OVERDUE: { label: 'Vencido', bg: 'danger' },
  CANCELED: { label: 'Cancelado', bg: 'secondary' },
};

const ContactLinks = ({ cellPhone, email, whatsApp }) => (
  <div className="boleto-contact">
    {cellPhone &&
      (whatsApp ? (
        <a className="boleto-contact__wa" href={waLink(cellPhone)} target="_blank" rel="noopener noreferrer">
          <Icons typeIcon="whatsapp" iconSize={15} fill="#25D366" />
          {cellPhone}
        </a>
      ) : (
        <span className="boleto-contact__phone">
          <Icons typeIcon="phone" iconSize={14} fill="#6c757d" />
          {cellPhone}
        </span>
      ))}
    {email && (
      <a className="boleto-contact__email" href={`mailto:${email}`}>
        {email}
      </a>
    )}
    {!cellPhone && !email && <span className="text-secondary">—</span>}
  </div>
);

ContactLinks.propTypes = {
  cellPhone: PropTypes.string,
  email: PropTypes.string,
  whatsApp: PropTypes.bool,
};

const isEditable = (status) => status === 'PENDING' || status === 'OVERDUE';

const AdminBoletos = ({ loggedUsername }) => {
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueTarget, setDueTarget] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reissueTarget, setReissueTarget] = useState(null);
  const [reissueAmount, setReissueAmount] = useState('');
  const [reissueDate, setReissueDate] = useState(null);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  scrollUp();

  const reload = () => {
    setLoading(true);
    listAllBoletos()
      .then((list) => {
        const sorted = [...list].sort((a, b) => {
          if (a.orderNumber === b.orderNumber) return a.installmentNumber - b.installmentNumber;
          return String(a.orderNumber).localeCompare(String(b.orderNumber));
        });
        setBoletos(sorted);
      })
      .catch(() => toast.error('Erro ao carregar boletos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const openDueDate = (boleto) => {
    setDueTarget(boleto);
    const parsed = boleto.dueDate ? new Date(boleto.dueDate) : new Date();
    setNewDate(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
  };

  const handleSaveDueDate = async () => {
    setLoading(true);
    if (!dueTarget || !newDate) return;
    setSaving(true);
    try {
      await updateBoletoDueDate(dueTarget.id, format(newDate, 'yyyy-MM-dd'));
      registerLog(
        `Alterou o vencimento do boleto ${dueTarget.installmentNumber}/${dueTarget.totalInstallments} do pedido ${dueTarget.orderNumber}`,
        loggedUsername,
      );
      toast.success('Vencimento atualizado. O pagador foi notificado por e-mail.');
      setDueTarget(null);
      reload();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível atualizar o vencimento.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    if (!cancelTarget) return;
    setSaving(true);
    try {
      await cancelBoleto(cancelTarget.id);
      registerLog(
        `Cancelou o boleto ${cancelTarget.installmentNumber}/${cancelTarget.totalInstallments} do pedido ${cancelTarget.orderNumber}`,
        loggedUsername,
      );
      toast.success('Boleto cancelado. O pagador foi notificado por e-mail.');
      setCancelTarget(null);
      reload();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível cancelar o boleto.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const openReissue = (boleto) => {
    setReissueTarget(boleto);
    setReissueAmount(String(Math.round(Number(boleto.amount || 0) / 100)));
    const base = new Date();
    base.setDate(base.getDate() + 5);
    setReissueDate(base);
  };

  const handleReissue = async () => {
    setLoading(true);
    if (!reissueTarget || !reissueDate || !reissueAmount) return;
    setSaving(true);
    try {
      await reissueBoleto(reissueTarget.id, reissueAmount, format(reissueDate, 'yyyy-MM-dd'));
      registerLog(
        `Gerou um novo boleto de R$ ${reissueAmount} para o pedido ${reissueTarget.orderNumber}`,
        loggedUsername,
      );
      toast.success('Novo boleto gerado. O pagador foi notificado por e-mail.');
      setReissueTarget(null);
      reload();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível gerar o novo boleto.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderTarget) return;
    setLoading(true);
    setSaving(true);
    try {
      await deleteBoletosByOrder(deleteOrderTarget.orderNumber);
      registerLog(
        `Excluiu todos os boletos do pedido ${deleteOrderTarget.orderNumber} (pagador ${deleteOrderTarget.payerName})`,
        loggedUsername,
      );
      toast.success('Boletos do pedido excluídos.');
      setDeleteOrderTarget(null);
      reload();
    } catch (error) {
      toast.error(error?.response?.data || 'Não foi possível excluir os boletos do pedido.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const statItems = useMemo(() => {
    const paid = boletos.filter((boleto) => boleto.status === 'PAID').length;
    const overdue = boletos.filter((boleto) => boleto.status === 'OVERDUE').length;
    const pending = boletos.filter((boleto) => boleto.status === 'PENDING').length;
    const orders = new Set(boletos.map((boleto) => boleto.orderNumber)).size;
    return [
      { label: 'Pedidos parcelados', value: orders, tone: 'info' },
      { label: 'Total de boletos', value: boletos.length, tone: 'accent' },
      { label: 'Boletos pagos', value: paid, tone: 'used' },
      { label: 'Boletos pendentes', value: pending, tone: 'available' },
      { label: 'Boletos vencidos', value: overdue, tone: 'danger' },
    ];
  }, [boletos]);

  const inadimplentes = useMemo(() => {
    const map = new Map();
    boletos
      .filter((boleto) => boleto.status === 'OVERDUE')
      .forEach((boleto) => {
        const key = boleto.orderNumber || boleto.cpf;
        if (!map.has(key)) {
          map.set(key, {
            key,
            orderNumber: boleto.orderNumber,
            payerName: boleto.payerName,
            cpf: boleto.cpf,
            cellPhone: boleto.cellPhone,
            email: boleto.email,
            whatsApp: boleto.whatsApp,
            count: 0,
            totalAmount: 0,
            maxDays: 0,
          });
        }
        const group = map.get(key);
        group.count += 1;
        group.totalAmount += Number(boleto.amount || 0);
        group.maxDays = Math.max(group.maxDays, daysOverdue(boleto.dueDate));
      });
    return Array.from(map.values()).sort((a, b) => b.maxDays - a.maxDays);
  }, [boletos]);

  const groupedBoletos = useMemo(() => {
    const map = new Map();
    boletos.forEach((boleto) => {
      const key = boleto.orderNumber || boleto.cpf;
      if (!map.has(key)) {
        map.set(key, {
          key,
          orderNumber: boleto.orderNumber,
          payerName: boleto.payerName,
          cpf: boleto.cpf,
          cellPhone: boleto.cellPhone,
          email: boleto.email || boleto.payerEmail,
          whatsApp: boleto.whatsApp,
          installments: [],
          totalAmount: 0,
          paidCount: 0,
          hasOverdue: false,
        });
      }
      const group = map.get(key);
      group.installments.push(boleto);
      group.totalAmount += Number(boleto.amount || 0);
      if (boleto.status === 'PAID') group.paidCount += 1;
      if (boleto.status === 'OVERDUE') group.hasOverdue = true;
    });
    return Array.from(map.values());
  }, [boletos]);

  const generateExcel = () => {
    const rows = boletos.map((boleto) => ({
      Pedido: boleto.orderNumber,
      Pagador: boleto.payerName,
      CPF: boleto.cpf,
      Contato: boleto.cellPhone || '',
      Email: boleto.email || boleto.payerEmail || '',
      Parcela: `${boleto.installmentNumber}/${boleto.totalInstallments}`,
      Valor: Number(boleto.amount || 0) / 100,
      Vencimento: formatDate(boleto.dueDate),
      'Pago em': boleto.paidAt ? formatDate(boleto.paidAt) : '',
      Status: (STATUS[boleto.status] || {}).label || boleto.status,
    }));
    downloadSingleSheet({ filename: 'boletos.xlsx', sheetName: 'Boletos', rows });
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'boletos-excel',
      name: 'Baixar Relatório',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--boletos">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Boletos"
        subtitle="Parcelas de boleto por pedido."
        typeIcon="barcode"
      />

      <div className="admin-subpage__content">
        <>
          <AdminToolbar buttons={toolsButtons} />

          <StatCards items={statItems} />

          {inadimplentes.length > 0 && (
            <div className="inadimplentes-panel">
              <div className="inadimplentes-panel__header">
                <span className="inadimplentes-panel__icon">
                  <Icons typeIcon="danger" iconSize={22} fill="#c62828" />
                </span>
                <div>
                  <h5 className="inadimplentes-panel__title">
                    Inadimplentes — {inadimplentes.length}{' '}
                    {inadimplentes.length === 1 ? 'pedido com boleto vencido' : 'pedidos com boletos vencidos'}
                  </h5>
                  <span className="inadimplentes-panel__subtitle">
                    Boletos com vencimento já passado. Entre em contato para regularizar o pagamento.
                  </span>
                </div>
              </div>

              <div className="inadimplentes-panel__table-wrap">
                <Table className="inadimplentes-table" responsive>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Pagador</th>
                      <th>CPF</th>
                      <th>Contato</th>
                      <th>Parcelas vencidas</th>
                      <th>Valor vencido</th>
                      <th>Atraso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inadimplentes.map((item) => (
                      <tr key={item.key}>
                        <td>{item.orderNumber}</td>
                        <td>{item.payerName}</td>
                        <td>{item.cpf}</td>
                        <td>
                          <ContactLinks cellPhone={item.cellPhone} email={item.email} whatsApp={item.whatsApp} />
                        </td>
                        <td>
                          <Badge bg="danger">
                            {item.count} vencida{item.count > 1 ? 's' : ''}
                          </Badge>
                        </td>
                        <td className="fw-bold">R$ {formatBRL(item.totalAmount)}</td>
                        <td>
                          {item.maxDays} {item.maxDays === 1 ? 'dia' : 'dias'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          <div className="admin-table-card">
            {boletos.length === 0 ? (
              <div className="text-start text-secondary p-4">Nenhum boleto parcelado gerado</div>
            ) : (
              <Accordion alwaysOpen className="boletos-accordion">
                {groupedBoletos.map((group) => {
                  const total = group.installments.length;
                  const overallBg = group.hasOverdue ? 'danger' : group.paidCount === total ? 'success' : 'warning';
                  const overallLabel = group.hasOverdue
                    ? 'Com atraso'
                    : group.paidCount === total
                      ? 'Quitado'
                      : `${group.paidCount}/${total} pagas`;
                  return (
                    <Accordion.Item eventKey={String(group.key)} key={group.key}>
                      <Accordion.Header>
                        <div className="boleto-group-head">
                          <span className="boleto-group-head__order">Pedido #{group.orderNumber}</span>
                          <span>·</span>
                          <span className="boleto-group-head__payer">Pagador: {group.payerName}</span>
                          <span>·</span>
                          <span className="boleto-group-head__cpf">CPF: {group.cpf}</span>
                          <span>·</span>
                          <Badge bg={overallBg} className="boleto-group-head__status">
                            {overallLabel}
                          </Badge>
                          <span className="boleto-group-head__total">
                            R$ {formatBRL(group.totalAmount)} · {total}x
                          </span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="boleto-group-toolbar">
                          <div className="boleto-group-contact">
                            <ContactLinks cellPhone={group.cellPhone} email={group.email} whatsApp={group.whatsApp} />
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="boleto-group-delete"
                            onClick={() => setDeleteOrderTarget(group)}
                          >
                            <Icons typeIcon="delete" iconSize={16} fill={'#dc3545'} />
                            Excluir todos os boletos do pedido
                          </Button>
                        </div>
                        <Table responsive className="boleto-installments-table">
                          <thead>
                            <tr>
                              <th>Parcela</th>
                              <th>Valor</th>
                              <th>Vencimento</th>
                              <th>Pago em</th>
                              <th>Status</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.installments.map((boleto) => {
                              const status = STATUS[boleto.status] || { label: boleto.status, bg: 'secondary' };
                              return (
                                <tr key={boleto.id} className={boleto.status === 'OVERDUE' ? 'boleto-row-overdue' : ''}>
                                  <td>
                                    {boleto.installmentNumber}/{boleto.totalInstallments}
                                  </td>
                                  <td>R$ {formatBRL(boleto.amount)}</td>
                                  <td>{formatDate(boleto.dueDate)}</td>
                                  <td>{boleto.paidAt ? formatDate(boleto.paidAt) : '—'}</td>
                                  <td>
                                    <Badge bg={status.bg}>{status.label}</Badge>
                                  </td>
                                  <td>
                                    <div className="table-action-cell">
                                      {isEditable(boleto.status) && (
                                        <>
                                          <ActionButton
                                            action="edit"
                                            iconSize={18}
                                            title="Alterar vencimento"
                                            onClick={() => openDueDate(boleto)}
                                          />
                                          <ActionButton
                                            action="delete"
                                            iconSize={18}
                                            title="Cancelar boleto"
                                            onClick={() => setCancelTarget(boleto)}
                                          />
                                        </>
                                      )}
                                      <ActionButton
                                        action="reissue"
                                        iconSize={18}
                                        title="Gerar novo boleto"
                                        onClick={() => openReissue(boleto)}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
          </div>
        </>
      </div>

      <CustomModal
        show={Boolean(dueTarget)}
        onHide={() => setDueTarget(null)}
        variant="info"
        title="Alterar Vencimento"
        icon="calendar-alt"
        iconFill="#2E5AAC"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setDueTarget(null)}>
              Voltar
            </Button>
            <Button variant="teal-blue" onClick={handleSaveDueDate} disabled={saving}>
              Salvar
            </Button>
          </>
        }
      >
        {dueTarget && (
          <>
            <p className="mb-2">
              Boleto{' '}
              <b>
                {dueTarget.installmentNumber}/{dueTarget.totalInstallments}
              </b>{' '}
              do pedido <b>{dueTarget.orderNumber}</b> — pagador <b>{dueTarget.payerName}</b>.
            </p>
            <p className="text-secondary small mb-3">
              O boleto é atualizado no PagarMe e o pagador recebe um e-mail com o novo vencimento.
            </p>
            <label className="fw-bold d-block mb-1">Novo vencimento:</label>
            <DatePicker
              selected={newDate}
              onChange={(date) => setNewDate(date)}
              className="form-control form-control-lg"
              dateFormat="dd/MM/yyyy"
              locale="ptBR"
              minDate={new Date()}
            />
          </>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(cancelTarget)}
        onHide={() => setCancelTarget(null)}
        variant="cancel"
        title="Cancelar Boleto"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setCancelTarget(null)}>
              Voltar
            </Button>
            <Button variant="danger" onClick={handleCancel} disabled={saving}>
              Cancelar Boleto
            </Button>
          </>
        }
      >
        {cancelTarget && (
          <>
            <p>
              Deseja realmente <b>cancelar</b> o boleto{' '}
              <b>
                {cancelTarget.installmentNumber}/{cancelTarget.totalInstallments}
              </b>{' '}
              do pedido <b>{cancelTarget.orderNumber}</b> (pagador <b>{cancelTarget.payerName}</b>)?
            </p>
            <p className="text-secondary small mb-0">
              O boleto é marcado como cancelado e o pagador é avisado por e-mail para <b>não pagá-lo</b> (ele deixa de
              ser cobrado e expira sozinho). Se ainda precisar receber, gere um <b>novo boleto</b> pelo botão de
              reemissão.
            </p>
          </>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(deleteOrderTarget)}
        onHide={() => setDeleteOrderTarget(null)}
        variant="cancel"
        title="Excluir Boletos do Pedido"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setDeleteOrderTarget(null)}>
              Voltar
            </Button>
            <Button variant="danger" onClick={handleDeleteOrder} disabled={saving}>
              Excluir Todos
            </Button>
          </>
        }
      >
        {deleteOrderTarget && (
          <>
            <p>
              Excluir <b>todos os {deleteOrderTarget.installments.length} boletos</b> do pedido{' '}
              <b>#{deleteOrderTarget.orderNumber}</b> (pagador <b>{deleteOrderTarget.payerName}</b>)? O pedido some desta
              lista.
            </p>
            <p className="text-secondary small mb-0">
              Isso é uma <b>remoção administrativa</b>: apaga apenas os registros aqui. <b>Não reembolsa</b> nem cancela
              nada no PagarMe — parcelas já pagas não devolvem valor, e boletos pendentes continuam existindo no gateway.
            </p>
          </>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(reissueTarget)}
        onHide={() => setReissueTarget(null)}
        variant="info"
        title="Gerar Novo Boleto"
        icon="refresh"
        iconFill="#007185"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setReissueTarget(null)}>
              Voltar
            </Button>
            <Button variant="teal-blue" onClick={handleReissue} disabled={saving}>
              Gerar Boleto
            </Button>
          </>
        }
      >
        {reissueTarget && (
          <>
            <p className="mb-2">
              Novo boleto para o pedido <b>{reissueTarget.orderNumber}</b> — pagador <b>{reissueTarget.payerName}</b>.
            </p>
            <p className="text-secondary small mb-3">
              Um boleto novo é gerado no PagarMe com o valor e vencimento abaixo, e o pagador recebe por e-mail.
            </p>
            <label className="fw-bold d-block mb-1">Valor (R$):</label>
            <InputGroup className="mb-3">
              <InputGroup.Text>R$</InputGroup.Text>
              <Form.Control
                type="number"
                min="1"
                step="1"
                value={reissueAmount}
                onChange={(e) => setReissueAmount(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </InputGroup>
            <label className="fw-bold d-block mb-1">Vencimento:</label>
            <DatePicker
              selected={reissueDate}
              onChange={(date) => setReissueDate(date)}
              className="form-control form-control-lg"
              dateFormat="dd/MM/yyyy"
              locale="ptBR"
              minDate={new Date()}
            />
          </>
        )}
      </CustomModal>

      <Loading loading={loading} />
    </div>
  );
};

AdminBoletos.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminBoletos;
