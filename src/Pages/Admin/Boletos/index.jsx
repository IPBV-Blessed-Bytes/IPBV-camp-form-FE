import { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Accordion } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
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
import SpinnerButton from '@/components/Global/SpinnerButton';
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
  const { t } = useTranslation();
  const STATUS = {
    PENDING: { label: t('admin.boletos.statusPending'), bg: 'warning' },
    PAID: { label: t('admin.boletos.statusPaid'), bg: 'success' },
    OVERDUE: { label: t('admin.boletos.statusOverdue'), bg: 'danger' },
    CANCELED: { label: t('admin.boletos.statusCanceled'), bg: 'secondary' },
  };
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

  const reload = (silent = false) => {
    if (!silent) setLoading(true);
    return listAllBoletos()
      .then((list) => {
        const sorted = [...list].sort((a, b) => {
          if (a.orderNumber === b.orderNumber) return a.installmentNumber - b.installmentNumber;
          return String(a.orderNumber).localeCompare(String(b.orderNumber));
        });
        setBoletos(sorted);
      })
      .catch(() => toast.error(t('admin.boletos.loadError')))
      .finally(() => {
        if (!silent) setLoading(false);
      });
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
    if (!dueTarget || !newDate) return;
    setSaving(true);
    try {
      await updateBoletoDueDate(dueTarget.id, format(newDate, 'yyyy-MM-dd'));
      registerLog(
        `Alterou o vencimento do boleto ${dueTarget.installmentNumber}/${dueTarget.totalInstallments} do pedido ${dueTarget.orderNumber}`,
        loggedUsername,
      );
      toast.success(t('admin.boletos.dueDateUpdated'));
      setDueTarget(null);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || t('admin.boletos.dueDateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setSaving(true);
    try {
      await cancelBoleto(cancelTarget.id);
      registerLog(
        `Cancelou o boleto ${cancelTarget.installmentNumber}/${cancelTarget.totalInstallments} do pedido ${cancelTarget.orderNumber}`,
        loggedUsername,
      );
      toast.success(t('admin.boletos.canceled'));
      setCancelTarget(null);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || t('admin.boletos.cancelError'));
    } finally {
      setSaving(false);
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
    if (!reissueTarget || !reissueDate || !reissueAmount) return;
    setSaving(true);
    try {
      await reissueBoleto(reissueTarget.id, reissueAmount, format(reissueDate, 'yyyy-MM-dd'));
      registerLog(
        `Gerou um novo boleto de R$ ${reissueAmount} para o pedido ${reissueTarget.orderNumber}`,
        loggedUsername,
      );
      toast.success(t('admin.boletos.reissued'));
      setReissueTarget(null);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || t('admin.boletos.reissueError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderTarget) return;
    setSaving(true);
    try {
      await deleteBoletosByOrder(deleteOrderTarget.orderNumber);
      registerLog(
        `Excluiu todos os boletos do pedido ${deleteOrderTarget.orderNumber} (pagador ${deleteOrderTarget.payerName})`,
        loggedUsername,
      );
      toast.success(t('admin.boletos.orderDeleted'));
      setDeleteOrderTarget(null);
      await reload(true);
    } catch (error) {
      toast.error(error?.response?.data || t('admin.boletos.orderDeleteError'));
    } finally {
      setSaving(false);
    }
  };

  const validOrderKeys = useMemo(() => {
    const set = new Set();
    boletos.forEach((boleto) => {
      if (boleto.status === 'PAID') set.add(boleto.orderNumber || boleto.cpf);
    });
    return set;
  }, [boletos]);

  const isValidOrder = (boleto) => validOrderKeys.has(boleto.orderNumber || boleto.cpf);

  const statItems = useMemo(() => {
    const paid = boletos.filter((boleto) => boleto.status === 'PAID').length;
    const overdue = boletos.filter((boleto) => boleto.status === 'OVERDUE' && isValidOrder(boleto)).length;
    const pending = boletos.filter((boleto) => boleto.status === 'PENDING').length;
    const orders = new Set(boletos.map((boleto) => boleto.orderNumber || boleto.cpf));
    const unpaidOrders = [...orders].filter((key) => !validOrderKeys.has(key)).length;
    return [
      { label: t('admin.boletos.statOrders'), value: orders.size, tone: 'info' },
      { label: t('admin.boletos.statTotal'), value: boletos.length, tone: 'accent' },
      { label: t('admin.boletos.statPaid'), value: paid, tone: 'used' },
      { label: t('admin.boletos.statPending'), value: pending, tone: 'available' },
      { label: t('admin.boletos.statOverdue'), value: overdue, tone: 'danger' },
      { label: t('admin.boletos.statUnpaidOrders'), value: unpaidOrders, tone: 'warning' },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boletos, validOrderKeys]);

  const inadimplentes = useMemo(() => {
    const map = new Map();
    boletos
      .filter((boleto) => boleto.status === 'OVERDUE' && validOrderKeys.has(boleto.orderNumber || boleto.cpf))
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boletos, validOrderKeys]);

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
      Status:
        boleto.status !== 'PAID' && boleto.status !== 'CANCELED' && !isValidOrder(boleto)
          ? 'Não pago'
          : (STATUS[boleto.status] || {}).label || boleto.status,
    }));
    downloadSingleSheet({ filename: 'boletos.xlsx', sheetName: 'Boletos', rows });
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'boletos-excel',
      name: t('admin.boletos.downloadReport'),
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--boletos">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.boletos.title')}
        subtitle={t('admin.boletos.subtitle')}
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
                    {t('admin.boletos.overdueHeading', {
                      count: inadimplentes.length,
                      orders:
                        inadimplentes.length === 1
                          ? t('admin.boletos.orderWordOne')
                          : t('admin.boletos.orderWordOther'),
                    })}
                  </h5>
                  <span className="inadimplentes-panel__subtitle">
                    {t('admin.boletos.overdueSubtitle')}
                  </span>
                </div>
              </div>

              <div className="inadimplentes-panel__table-wrap">
                <Table className="inadimplentes-table" responsive>
                  <thead>
                    <tr>
                      <th>{t('admin.boletos.colOrder')}</th>
                      <th>{t('admin.boletos.colPayer')}</th>
                      <th>{t('admin.boletos.colCpf')}</th>
                      <th>{t('admin.boletos.colContact')}</th>
                      <th>{t('admin.boletos.colOverdueInstallments')}</th>
                      <th>{t('admin.boletos.colOverdueAmount')}</th>
                      <th>{t('admin.boletos.colDelay')}</th>
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
                            {item.count}{' '}
                            {item.count > 1
                              ? t('admin.boletos.overdueWordOther')
                              : t('admin.boletos.overdueWordOne')}
                          </Badge>
                        </td>
                        <td className="fw-bold">R$ {formatBRL(item.totalAmount)}</td>
                        <td>
                          {item.maxDays} {item.maxDays === 1 ? t('admin.boletos.dayOne') : t('admin.boletos.dayOther')}
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
              <div className="text-start text-secondary p-4">{t('admin.boletos.emptyBoletos')}</div>
            ) : (
              <Accordion alwaysOpen className="boletos-accordion">
                {groupedBoletos.map((group) => {
                  const total = group.installments.length;
                  const isValid = group.paidCount > 0;
                  let overallBg;
                  let overallLabel;
                  if (!isValid) {
                    overallBg = 'dark';
                    overallLabel = t('admin.boletos.statusUnpaid');
                  } else if (group.hasOverdue) {
                    overallBg = 'danger';
                    overallLabel = t('admin.boletos.statusWithDelay');
                  } else if (group.paidCount === total) {
                    overallBg = 'success';
                    overallLabel = t('admin.boletos.statusSettled');
                  } else {
                    overallBg = 'warning';
                    overallLabel = t('admin.boletos.partialPaid', { paid: group.paidCount, total });
                  }
                  return (
                    <Accordion.Item eventKey={String(group.key)} key={group.key}>
                      <Accordion.Header>
                        <div className="boleto-group-head">
                          <span className="boleto-group-head__order">
                            {t('admin.boletos.groupOrder', { order: group.orderNumber })}
                          </span>
                          <span>·</span>
                          <span className="boleto-group-head__payer">
                            {t('admin.boletos.groupPayer', { name: group.payerName })}
                          </span>
                          <span>·</span>
                          <span className="boleto-group-head__cpf">{t('admin.boletos.groupCpf', { cpf: group.cpf })}</span>
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
                            {t('admin.boletos.deleteAllOrder')}
                          </Button>
                        </div>
                        <Table responsive className="boleto-installments-table">
                          <thead>
                            <tr>
                              <th>{t('admin.boletos.colInstallment')}</th>
                              <th>{t('admin.boletos.colAmount')}</th>
                              <th>{t('admin.boletos.colDueDate')}</th>
                              <th>{t('admin.boletos.colPaidAt')}</th>
                              <th>{t('admin.boletos.colStatus')}</th>
                              <th>{t('admin.boletos.colActions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.installments.map((boleto) => {
                              const isRealOverdue = isValid && boleto.status === 'OVERDUE';
                              let status;
                              if (boleto.status === 'PAID' || boleto.status === 'CANCELED') {
                                status = STATUS[boleto.status];
                              } else if (!isValid) {
                                status = { label: t('admin.boletos.statusUnpaid'), bg: 'dark' };
                              } else {
                                status = STATUS[boleto.status] || { label: boleto.status, bg: 'secondary' };
                              }
                              return (
                                <tr key={boleto.id} className={isRealOverdue ? 'boleto-row-overdue' : ''}>
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
                                            title={t('admin.boletos.editDueDateTitle')}
                                            onClick={() => openDueDate(boleto)}
                                          />
                                          <ActionButton
                                            action="delete"
                                            iconSize={18}
                                            title={t('admin.boletos.cancelTitle')}
                                            onClick={() => setCancelTarget(boleto)}
                                          />
                                        </>
                                      )}
                                      <ActionButton
                                        action="reissue"
                                        iconSize={18}
                                        title={t('admin.boletos.reissueTitle')}
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
        title={t('admin.boletos.dueModalTitle')}
        icon="calendar-alt"
        iconFill="#2E5AAC"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setDueTarget(null)}>
              {t('admin.boletos.back')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleSaveDueDate} loading={saving}>
              {t('admin.boletos.save')}
            </SpinnerButton>
          </>
        }
      >
        {dueTarget && (
          <>
            <p className="mb-2">
              <Trans
                i18nKey="admin.boletos.dueBody"
                values={{
                  installment: dueTarget.installmentNumber,
                  total: dueTarget.totalInstallments,
                  order: dueTarget.orderNumber,
                  payer: dueTarget.payerName,
                }}
                components={{ b: <b /> }}
              />
            </p>
            <p className="text-secondary small mb-3">{t('admin.boletos.dueNote')}</p>
            <label className="fw-bold d-block mb-1">{t('admin.boletos.newDueDateLabel')}</label>
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
        title={t('admin.boletos.cancelModalTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setCancelTarget(null)}>
              {t('admin.boletos.back')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleCancel} loading={saving}>
              {t('admin.boletos.cancelBoletoBtn')}
            </SpinnerButton>
          </>
        }
      >
        {cancelTarget && (
          <>
            <p>
              <Trans
                i18nKey="admin.boletos.cancelBody"
                values={{
                  installment: cancelTarget.installmentNumber,
                  total: cancelTarget.totalInstallments,
                  order: cancelTarget.orderNumber,
                  payer: cancelTarget.payerName,
                }}
                components={{ b: <b /> }}
              />
            </p>
            <p className="text-secondary small mb-0">
              <Trans i18nKey="admin.boletos.cancelNote" components={{ b: <b /> }} />
            </p>
          </>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(deleteOrderTarget)}
        onHide={() => setDeleteOrderTarget(null)}
        variant="cancel"
        title={t('admin.boletos.deleteOrderModalTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setDeleteOrderTarget(null)}>
              {t('admin.boletos.back')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleDeleteOrder} loading={saving}>
              {t('admin.boletos.deleteAll')}
            </SpinnerButton>
          </>
        }
      >
        {deleteOrderTarget && (
          <>
            <p>
              <Trans
                i18nKey="admin.boletos.deleteOrderBody"
                values={{
                  count: deleteOrderTarget.installments.length,
                  order: deleteOrderTarget.orderNumber,
                  payer: deleteOrderTarget.payerName,
                }}
                components={{ b: <b /> }}
              />
            </p>
            <p className="text-secondary small mb-0">
              <Trans i18nKey="admin.boletos.deleteOrderNote" components={{ b: <b /> }} />
            </p>
          </>
        )}
      </CustomModal>

      <CustomModal
        show={Boolean(reissueTarget)}
        onHide={() => setReissueTarget(null)}
        variant="info"
        title={t('admin.boletos.reissueModalTitle')}
        icon="refresh"
        iconFill="#007185"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setReissueTarget(null)}>
              {t('admin.boletos.back')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleReissue} loading={saving}>
              {t('admin.boletos.reissueBtn')}
            </SpinnerButton>
          </>
        }
      >
        {reissueTarget && (
          <>
            <p className="mb-2">
              <Trans
                i18nKey="admin.boletos.reissueBody"
                values={{ order: reissueTarget.orderNumber, payer: reissueTarget.payerName }}
                components={{ b: <b /> }}
              />
            </p>
            <p className="text-secondary small mb-3">{t('admin.boletos.reissueNote')}</p>
            <label className="fw-bold d-block mb-1">{t('admin.boletos.amountLabel')}</label>
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
            <label className="fw-bold d-block mb-1">{t('admin.boletos.dueDateLabel')}</label>
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
