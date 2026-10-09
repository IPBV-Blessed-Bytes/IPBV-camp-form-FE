import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import {
  listPackageCategories,
  createPackageCategory,
  updatePackageCategory,
  deletePackageCategory,
} from '@/services/packageCategories';
import { getAllProducts, assignProductPackageCategory } from '@/services/products';
import { getApiErrorMessage } from '@/fetchers/helpers';
import useEventName from '@/hooks/useEventName';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const EMPTY_CATEGORY = { id: null, name: '', description: '', selectionRule: 'single', required: true, countsTowardLotPool: false };

const AdminPackageBuilder = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const SELECTION_RULES = [
    { value: 'single', label: t('admin.packages.ruleSingle') },
    { value: 'multiple', label: t('admin.packages.ruleMultiple') },
  ];
  const ruleLabel = (rule) => SELECTION_RULES.find((r) => r.value === rule)?.label || rule;
  const eventName = useEventName();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(EMPTY_CATEGORY);
  const [toDelete, setToDelete] = useState(null);
  const [assignFor, setAssignFor] = useState(null); // category being assigned a product
  const [assignProductId, setAssignProductId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [cats, prodsData] = await Promise.all([
        listPackageCategories(),
        getAllProducts(),
      ]);
      setCategories(cats);
      setProducts(prodsData?.products || []);
    } catch {
      toast.error(t('admin.packages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const unassignedProducts = useMemo(() => products.filter((p) => !p.packageCategoryId), [products]);

  const priceLabel = (product) => {
    if (!product.prices || product.prices.length === 0) return t('admin.packages.noPrice');
    const values = product.prices.map((pr) => Number(pr.price));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? `R$ ${min}` : `R$ ${min}–${max}`;
  };

  const assignProduct = async () => {
    if (!assignProductId) return;
    setSaving(true);
    try {
      await assignProductPackageCategory(Number(assignProductId), assignFor.id);
      setAssignFor(null);
      setAssignProductId('');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.packages.assignError'));
    } finally {
      setSaving(false);
    }
  };

  const unassignProduct = async (productId) => {
    setSaving(true);
    try {
      await assignProductPackageCategory(productId, null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.packages.unassignError'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_CATEGORY);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setDraft({
      id: category.id,
      name: category.name,
      description: category.description || '',
      selectionRule: category.selectionRule || 'single',
      required: category.required ?? true,
      countsTowardLotPool: category.countsTowardLotPool ?? false,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!draft.name.trim()) {
      toast.error(t('admin.packages.nameRequired'));
      return;
    }
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      selectionRule: draft.selectionRule,
      required: draft.required,
      countsTowardLotPool: draft.countsTowardLotPool,
      order: draft.id ? undefined : categories.length,
    };
    try {
      if (draft.id) await updatePackageCategory(draft.id, payload);
      else await createPackageCategory(payload);
      setShowModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.packages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSaving(true);
    try {
      await Promise.all(
        reordered.map((category, i) =>
          updatePackageCategory(category.id, {
            name: category.name,
            selectionRule: category.selectionRule,
            required: category.required,
            order: i,
          }),
        ),
      );
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.packages.reorderError'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await deletePackageCategory(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.packages.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const assignedCount = products.length - unassignedProducts.length;
  const statItems = [
    { label: t('admin.packages.statCategories'), value: categories.length },
    { label: t('admin.packages.statAssigned'), value: assignedCount, tone: 'accent' },
    { label: t('admin.packages.statUnassigned'), value: unassignedProducts.length, tone: 'used' },
  ];

  return (
    <div className="admin-subpage package-builder">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.packages.title')}
        subtitle={t('admin.packages.subtitle', { event: eventName })}
        typeIcon="cart"
      />

      <div className="package-builder__content">
        {!loading && categories.length > 0 && <StatCards items={statItems} />}

        <div className="package-builder__toolbar">
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
            {t('admin.packages.newCategory')}&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : categories.length === 0 ? (
          <p className="package-builder__empty">{t('admin.packages.empty')}</p>
        ) : (
          <div className="package-builder__grid">
            {categories.map((category, index) => {
              const catProducts = products.filter((p) => p.packageCategoryId === category.id);
              return (
                <div key={category.id} className="package-builder__cat">
                  <div className="package-builder__item">
                    <span className="package-builder__num">{index + 1}</span>
                    <div className="package-builder__item-order">
                      <button
                        type="button"
                        className="package-builder__move package-builder__move--up"
                        disabled={index === 0 || saving}
                        onClick={() => move(index, -1)}
                        aria-label={t('admin.packages.moveUp')}
                      >
                        <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                      </button>
                      <button
                        type="button"
                        className="package-builder__move package-builder__move--down"
                        disabled={index === categories.length - 1 || saving}
                        onClick={() => move(index, 1)}
                        aria-label={t('admin.packages.moveDown')}
                      >
                        <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                      </button>
                    </div>
                    <div className="package-builder__item-main">
                      <div className="package-builder__item-title">{category.name}</div>
                      <div className="package-builder__item-meta">
                        <Badge bg="light" text="dark">
                          {ruleLabel(category.selectionRule)}
                        </Badge>
                        <Badge bg={category.required ? 'success' : 'secondary'}>
                          {category.required ? t('admin.packages.required') : t('admin.packages.optional')}
                        </Badge>
                      </div>
                    </div>
                    <div className="package-builder__item-actions">
                      <Button size="sm" variant="teal-blue" onClick={() => openEdit(category)}>
                        {t('admin.packages.edit')}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(category)}>
                        {t('admin.packages.delete')}
                      </Button>
                    </div>
                  </div>

                  <div className="package-builder__products">
                    {catProducts.length === 0 ? (
                      <p className="package-builder__section-empty">{t('admin.packages.noProducts')}</p>
                    ) : (
                      <ul className="package-builder__prod-list">
                        {catProducts.map((product) => (
                          <li key={product.id} className="package-builder__prod">
                            <span>
                              {product.name} <small className="text-muted">· {priceLabel(product)}</small>
                            </span>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={saving}
                              onClick={() => unassignProduct(product.id)}
                            >
                              {t('admin.packages.remove')}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {assignFor?.id === category.id ? (
                      <div className="package-builder__assign">
                        <Form.Select
                          value={assignProductId}
                          onChange={(e) => setAssignProductId(e.target.value)}
                        >
                          <option value="">{t('admin.packages.selectProduct')}</option>
                          {unassignedProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · {priceLabel(p)}
                            </option>
                          ))}
                        </Form.Select>
                        <Button size="sm" variant="teal-blue" onClick={assignProduct} disabled={saving || !assignProductId}>
                          {t('admin.packages.assign')}
                        </Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setAssignFor(null)}>
                          {t('admin.packages.cancel')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="teal-blue"
                        className="mt-1 d-inline-flex align-items-center"
                        disabled={unassignedProducts.length === 0}
                        title={unassignedProducts.length === 0 ? t('admin.packages.assignProductDisabledTitle') : ''}
                        onClick={() => {
                          setAssignFor(category);
                          setAssignProductId('');
                        }}
                      >
                        {t('admin.packages.assignProduct')}&nbsp;&nbsp;
                        <Icons typeIcon="plus" iconSize={14} fill="#fff" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="info"
        title={draft.id ? t('admin.packages.editModalTitle') : t('admin.packages.newModalTitle')}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              {t('admin.packages.cancel')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={save} loading={saving}>{t('admin.packages.save')}</SpinnerButton>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.packages.formName')}</b></Form.Label>
            <Form.Control
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('admin.packages.namePlaceholder')}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.packages.formDescription')}</b></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t('admin.packages.descriptionPlaceholder')}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.packages.formRule')}</b></Form.Label>
            <Form.Select
              value={draft.selectionRule}
              onChange={(e) => setDraft((prev) => ({ ...prev, selectionRule: e.target.value }))}
            >
              {SELECTION_RULES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Check
            type="switch"
            id="category-required-switch"
            label={t('admin.packages.requiredSwitch')}
            checked={draft.required}
            onChange={(e) => setDraft((prev) => ({ ...prev, required: e.target.checked }))}
          />
          <Form.Check
            type="switch"
            id="category-lot-pool-switch"
            className="mt-2"
            label={t('admin.packages.lotPoolSwitch')}
            checked={draft.countsTowardLotPool}
            onChange={(e) => setDraft((prev) => ({ ...prev, countsTowardLotPool: e.target.checked }))}
          />
          <Form.Text className="text-secondary d-block">{t('admin.packages.lotPoolHint')}</Form.Text>
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title={t('admin.packages.deleteModalTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              {t('admin.packages.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={confirmDelete} loading={saving}>{t('admin.packages.delete')}</SpinnerButton>
          </>
        }
      >
        <p>
          <Trans i18nKey="admin.packages.deleteConfirm" values={{ name: toDelete?.name }} components={{ b: <b /> }} />
        </p>
      </CustomModal>
    </div>
  );
};

AdminPackageBuilder.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminPackageBuilder;
