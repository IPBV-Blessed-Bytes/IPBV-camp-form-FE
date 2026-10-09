import { useState, useEffect } from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { parse, isValid } from 'date-fns';
import { registerLog } from '@/services/logs';
import { listCouponCodes, createCouponCode, updateCouponCode, deleteCouponCode } from '@/services/couponCodes';
import scrollUp from '@/hooks/useScrollUp';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import StatCards from '@/components/Admin/StatCards';

registerLocale('ptBR', ptBR);

const parseDate = (value) => {
  if (!value) return null;
  const parsed = parse(value, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
};

const formatDate = (date) => (date ? date.toLocaleDateString('pt-BR') : '');

const emptyForm = {
  code: '',
  discountType: 'PERCENT',
  discountAmount: '',
  maxUses: '',
  expiresAt: '',
  active: true,
};

const AdminCouponCodes = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  scrollUp();

  const fetchCoupons = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await listCouponCodes();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(t('admin.couponCodes.loadError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setEditing(null);
    setShowModal(true);
  };

  const handleEditClick = (coupon) => {
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'PERCENT',
      discountAmount: coupon.discountAmount ?? '',
      maxUses: coupon.maxUses ?? '',
      expiresAt: coupon.expiresAt || '',
      active: coupon.active !== false,
    });
    setEditing(coupon);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error(t('admin.couponCodes.codeRequired'));
      return;
    }
    if (!formData.discountAmount || Number(formData.discountAmount) <= 0) {
      toast.error(t('admin.couponCodes.amountRequired'));
      return;
    }
    if (formData.discountType === 'PERCENT' && Number(formData.discountAmount) > 100) {
      toast.error(t('admin.couponCodes.percentMax'));
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountAmount: Number(formData.discountAmount),
      maxUses: formData.maxUses === '' || formData.maxUses === null ? null : Number(formData.maxUses),
      expiresAt: formData.expiresAt || null,
      active: formData.active,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateCouponCode(editing.id, payload);
        registerLog(`Editou o cupom ${payload.code}`, loggedUsername);
        toast.success(t('admin.couponCodes.updated'));
      } else {
        await createCouponCode(payload);
        registerLog(`Criou o cupom ${payload.code}`, loggedUsername);
        toast.success(t('admin.couponCodes.created'));
      }
      setShowModal(false);
      await fetchCoupons(true);
    } catch (error) {
      const message = typeof error?.response?.data === 'string' ? error.response.data : t('admin.couponCodes.saveError');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await deleteCouponCode(toDelete.id);
      registerLog(`Excluiu o cupom ${toDelete.code}`, loggedUsername);
      toast.success(t('admin.couponCodes.deleted'));
      setShowDeleteModal(false);
      await fetchCoupons(true);
    } catch (error) {
      toast.error(t('admin.couponCodes.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const discountLabel = (coupon) =>
    coupon.discountType === 'VALUE' ? `R$ ${Number(coupon.discountAmount).toFixed(2)}` : `${Number(coupon.discountAmount)}%`;

  const activeCount = coupons.filter((c) => c.active !== false).length;
  const statItems = [
    { label: t('admin.couponCodes.statTotal'), value: coupons.length },
    { label: t('admin.couponCodes.statActive'), value: activeCount, tone: 'free' },
    { label: t('admin.couponCodes.statInactive'), value: coupons.length - activeCount, tone: 'used' },
  ];

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-coupon',
      name: t('admin.couponCodes.create'),
      onClick: handleCreateClick,
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--coupons">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.couponCodes.title')}
        subtitle={t('admin.couponCodes.subtitle')}
        typeIcon="cash"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />
        <StatCards items={statItems} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.couponCodes.colCode')}</th>
                <th className="table-cells-header">{t('admin.couponCodes.colDiscount')}</th>
                <th className="table-cells-header">{t('admin.couponCodes.colUses')}</th>
                <th className="table-cells-header">{t('admin.couponCodes.colExpires')}</th>
                <th className="table-cells-header">{t('admin.couponCodes.colStatus')}</th>
                <th className="table-cells-header">{t('admin.couponCodes.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-start text-secondary p-4">
                    {t('admin.couponCodes.empty')}
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <strong>{coupon.code}</strong>
                    </td>
                    <td>{discountLabel(coupon)}</td>
                    <td>
                      {coupon.usedCount || 0}
                      {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ' / ∞'}
                    </td>
                    <td>{coupon.expiresAt || <span className="text-secondary small">—</span>}</td>
                    <td>
                      {coupon.active !== false ? (
                        <Badge bg="success">{t('admin.couponCodes.statusActive')}</Badge>
                      ) : (
                        <Badge bg="secondary">{t('admin.couponCodes.statusInactive')}</Badge>
                      )}
                    </td>
                    <td>
                      <div className="table-action-cell">
                        <ActionButton action="edit" label={t('admin.couponCodes.editAction')} onClick={() => handleEditClick(coupon)} />
                        <ActionButton
                          action="delete"
                          label={t('admin.couponCodes.deleteAction')}
                          onClick={() => {
                            setToDelete(coupon);
                            setShowDeleteModal(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          variant="confirm"
          icon={editing ? 'edit' : 'plus'}
          title={editing ? t('admin.couponCodes.modalEdit') : t('admin.couponCodes.modalCreate')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('admin.couponCodes.cancel')}
              </Button>
              <SpinnerButton className="btn-confirm" variant="primary" onClick={handleSubmit} loading={saving}>
                {editing ? t('admin.couponCodes.save') : t('admin.couponCodes.createBtn')}
              </SpinnerButton>
            </>
          }
        >
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.couponCodes.fieldCode')}</b>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder={t('admin.couponCodes.codePlaceholder')}
                size="lg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.couponCodes.fieldType')}</b>
              </Form.Label>
              <Form.Select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                size="lg"
              >
                <option value="PERCENT">{t('admin.couponCodes.typePercent')}</option>
                <option value="VALUE">{t('admin.couponCodes.typeValue')}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <b>{formData.discountType === 'VALUE' ? t('admin.couponCodes.fieldValue') : t('admin.couponCodes.fieldPercent')}</b>
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.couponCodes.fieldMaxUses')}</b>
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder={t('admin.couponCodes.maxUsesPlaceholder')}
              />
              <Form.Text className="text-secondary">{t('admin.couponCodes.maxUsesHint')}</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <b>{t('admin.couponCodes.fieldExpires')}</b>
              </Form.Label>
              <div>
                <DatePicker
                  selected={parseDate(formData.expiresAt)}
                  onChange={(date) => setFormData({ ...formData, expiresAt: formatDate(date) })}
                  className="form-control"
                  placeholderText={t('admin.couponCodes.datePlaceholder')}
                  dateFormat="dd/MM/yyyy"
                  locale="ptBR"
                  dropdownMode="select"
                  showMonthDropdown
                  showYearDropdown
                  isClearable
                />
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Check
                type="switch"
                label={t('admin.couponCodes.fieldActive')}
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </CustomModal>

        <CustomModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          variant="cancel"
          title={t('admin.couponCodes.deleteTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('admin.couponCodes.cancel')}
              </Button>
              <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDelete} loading={saving}>
                {t('admin.couponCodes.deleteConfirm')}
              </SpinnerButton>
            </>
          }
        >
          {t('admin.couponCodes.deleteQuestionPre')} <strong>{toDelete?.code}</strong>?
        </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminCouponCodes.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminCouponCodes;
