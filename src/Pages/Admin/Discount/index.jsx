import { useState, useEffect } from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import { registerLog } from '@/services/logs';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/coupons';
import scrollUp from '@/hooks/useScrollUp';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';

const toNumber = (v) => {
  if (v == null || v === '') return 0;
  const n = Number(String(v).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

const formatBRL = (v) => {
  if (v == null || v === '' || v === '-') return '—';
  return toNumber(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatCpf = (v) => {
  const d = String(v ?? '').replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const AdminDiscount = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [discount, setDiscount] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [newDiscount, setNewDiscount] = useState({ cpf: '', discount: '', user: '', discountReason: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  scrollUp();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await listCoupons();
      setDiscount(data.coupons);
    } catch (error) {
      toast.error(t('admin.discount.fetchError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateDiscount = async () => {
    setSaving(true);

    try {
      await createCoupon({ ...newDiscount, id: Date.now().toString() });
      toast.success(t('admin.discount.createSuccess'));
      setShowModal(false);
      registerLog(`Criou o desconto atrelado ao CPF ${newDiscount.cpf}`, loggedUsername);
      await fetchDiscounts(true);
    } catch (error) {
      toast.error(t('admin.discount.createError'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditDiscount = async () => {
    setSaving(true);

    try {
      await updateCoupon(editingDiscount.id, editingDiscount);
      toast.success(t('admin.discount.updateSuccess'));
      setShowModal(false);
      registerLog(`Editou o desconto atrelado ao CPF ${editingDiscount.cpf}`, loggedUsername);
      await fetchDiscounts(true);
    } catch (error) {
      toast.error(t('admin.discount.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDiscount = async (discountToDelete) => {
    setSaving(true);

    try {
      await deleteCoupon(discountToDelete.id, discountToDelete);
      toast.success(t('admin.discount.deleteSuccess'));
      setShowConfirmDelete(false);
      registerLog(`Excluiu o desconto atrelado ao CPF ${discountToDelete.cpf}`, loggedUsername);
      await fetchDiscounts(true);
    } catch (error) {
      toast.error(t('admin.discount.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const openModal = (discount) => {
    setEditingDiscount(discount);
    setNewDiscount({ cpf: '', discount: '', discountReason: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingDiscount(null);
    setShowModal(false);
  };

  const openConfirmDeleteModal = (discount) => {
    setDiscountToDelete(discount);
    setShowConfirmDelete(true);
  };

  const closeConfirmDeleteModal = () => {
    setDiscountToDelete(null);
    setShowConfirmDelete(false);
  };

  const handleSubmit = () => {
    if (editingDiscount) {
      handleEditDiscount();
    } else {
      handleCreateDiscount();
    }
  };

  const generateExcel = () => {
    const numericFields = ['Valor Desconto', 'Valor Pago'];

    const parseNumber = (value) => {
      if (value === undefined || value === null) return '';
      const cleaned = String(value).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
      const num = Number(cleaned);
      return isNaN(num) ? '' : num;
    };

    const rows = discount.map((item) => {
      const row = {
        CPF: item.cpf,
        'Valor Desconto': item.discount,
        'Motivo do Desconto': item.discountReason || '-',
        Usuário: item.user ? item.user : 'NÃO UTILIZADO',
        'Valor Pago': item.totalPrice ? item.totalPrice : '-',
      };

      numericFields.forEach((key) => {
        row[key] = parseNumber(row[key]);
      });

      return row;
    });

    downloadSingleSheet({ filename: 'descontos.xlsx', sheetName: 'Descontos', rows });
  };

  const usedCount = discount.filter((d) => d.user).length;
  const totalGranted = discount.reduce((s, d) => s + toNumber(d.discount), 0);
  const totalPaid = discount.reduce((s, d) => s + toNumber(d.totalPrice), 0);
  const statItems = [
    { label: t('admin.discount.statTotal'), value: discount.length },
    { label: t('admin.discount.statUsed'), value: usedCount, tone: 'free' },
    { label: t('admin.discount.statUnused'), value: discount.length - usedCount, tone: 'used' },
    { label: t('admin.discount.statGranted'), value: formatBRL(totalGranted), tone: 'accent' },
    { label: t('admin.discount.statPaid'), value: formatBRL(totalPaid), tone: 'info' },
  ];
  const statusChips = [
    { value: 'all', label: t('admin.discount.chipAll'), count: discount.length },
    { value: 'used', label: t('admin.discount.chipUsed'), count: usedCount },
    { value: 'unused', label: t('admin.discount.chipUnused'), count: discount.length - usedCount },
  ];
  const term = search.trim().toLowerCase();
  const filtered = discount.filter((d) => {
    if (statusFilter === 'used' && !d.user) return false;
    if (statusFilter === 'unused' && d.user) return false;
    if (!term) return true;
    return [d.cpf, d.user, d.discountReason].some((f) => String(f || '').toLowerCase().includes(term));
  });

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'discount-excel',
      name: t('admin.discount.downloadReport'),
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'add-new-discount',
      name: t('admin.discount.createButton'),
      onClick: () => openModal(null),
      typeButton: 'teal-blue',
      typeIcon: 'discount',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--discount discounts">
      <AdminSubpageHeader
        sessionKey="descontos"
        username={loggedUsername}
        title={t('admin.discount.title')}
        subtitle={t('admin.discount.subtitle')}
        typeIcon="discount"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="discounts-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.discount.searchPlaceholder')} />
          <FilterChips options={statusChips} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <SectionHeader title={t('admin.discount.sectionTitle')} count={filtered.length} />

        <div className="admin-table-card">
          <div className="table-responsive">
            <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">{t('admin.discount.colCpf')}</th>
              <th className="table-cells-header">{t('admin.discount.colDiscount')}</th>
              <th className="table-cells-header">{t('admin.discount.colUser')}</th>
              <th className="table-cells-header">{t('admin.discount.colReason')}</th>
              <th className="table-cells-header">{t('admin.discount.colPaid')}</th>
              <th className="table-cells-header">{t('admin.discount.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-start text-secondary p-4">
                  {t('admin.discount.empty')}
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
              return (
                <tr key={item.id}>
                  <td>{formatCpf(item.cpf)}</td>
                  <td>{formatBRL(item.discount)}</td>
                  <td>
                    {item.user ? (
                      <Badge bg="success">{item.user}</Badge>
                    ) : (
                      <Badge bg="secondary">{t('admin.discount.notUsed')}</Badge>
                    )}
                  </td>
                  <td>{item.discountReason || <span className="text-secondary">—</span>}</td>
                  <td>{item.totalPrice ? formatBRL(item.totalPrice) : <span className="text-secondary">—</span>}</td>
                  <td>
                    <div className="table-action-cell">
                      <ActionButton action="edit" label={t('admin.discount.editDiscount')} onClick={() => openModal(item)} />
                      <ActionButton action="delete" label={t('admin.discount.deleteDiscount')} onClick={() => openConfirmDeleteModal(item)} />
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
            </Table>
          </div>
        </div>

      <CustomModal
        show={showModal}
        onHide={closeModal}
        variant="confirm"
        icon={editingDiscount ? 'edit' : 'plus'}
        iconFill={editingDiscount ? '' : '#057c05'}
        title={editingDiscount ? t('admin.discount.editModalTitle') : t('admin.discount.createModalTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              {t('admin.discount.cancel')}
            </Button>
            <SpinnerButton variant="primary" className="btn-confirm" onClick={handleSubmit} loading={saving}>
              {editingDiscount ? t('admin.discount.saveChanges') : t('admin.discount.createDiscount')}
            </SpinnerButton>
          </>
        }
      >
        <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.discount.formCpf')}</b>
              </Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                value={formatCpf(editingDiscount ? editingDiscount.cpf : newDiscount.cpf)}
                size="lg"
                onChange={(e) => {
                  const cpf = e.target.value.replace(/\D/g, '').slice(0, 11);
                  if (editingDiscount) {
                    setEditingDiscount({ ...editingDiscount, cpf });
                  } else {
                    setNewDiscount({ ...newDiscount, cpf });
                  }
                }}
                placeholder="000.000.000-00"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.discount.formValue')}</b>
              </Form.Label>
              <Form.Control
                type="number"
                value={editingDiscount ? editingDiscount.discount : newDiscount.discount}
                size="lg"
                onChange={(e) =>
                  editingDiscount
                    ? setEditingDiscount({ ...editingDiscount, discount: e.target.value })
                    : setNewDiscount({ ...newDiscount, discount: e.target.value })
                }
                placeholder="000"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.discount.formReason')}</b>
              </Form.Label>
              <Form.Control
                type="text"
                value={editingDiscount ? editingDiscount.discountReason : newDiscount.discountReason}
                size="lg"
                onChange={(e) =>
                  editingDiscount
                    ? setEditingDiscount({ ...editingDiscount, discountReason: e.target.value })
                    : setNewDiscount({ ...newDiscount, discountReason: e.target.value })
                }
                placeholder={t('admin.discount.reasonPlaceholder')}
              />
            </Form.Group>
          </Form>
      </CustomModal>

      <CustomModal
        show={showConfirmDelete}
        onHide={closeConfirmDeleteModal}
        variant="cancel"
        title={t('admin.discount.deleteModalTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={closeConfirmDeleteModal}>
              {t('admin.discount.cancel')}
            </Button>
            <SpinnerButton
              variant="danger"
              className="btn-cancel"
              onClick={() => discountToDelete && handleDeleteDiscount(discountToDelete)}
              loading={saving}
            >
              {t('admin.discount.delete')}
            </SpinnerButton>
          </>
        }
      >
        <Trans i18nKey="admin.discount.deleteConfirm" values={{ cpf: discountToDelete?.cpf }} components={{ b: <b /> }} />
      </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminDiscount.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminDiscount;
