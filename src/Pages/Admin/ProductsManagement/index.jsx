import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setLotProductPrice,
  uploadProductImage,
  deleteProductImage,
  productImageUrl,
} from '@/services/products';
import { listAgePriceRules, createAgePriceRule, deleteAgePriceRule } from '@/services/agePriceRules';
import { getLotsAuthenticated } from '@/services/lots';
import { listPackageCategories } from '@/services/packageCategories';
import { getApiErrorMessage } from '@/fetchers/helpers';
import scrollUp from '@/hooks/useScrollUp';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';

const emptyForm = { name: '', description: '', packageCategoryId: '', active: true, iconKey: '', stock: '', price: '', tracksStock: false };

const PRODUCT_ICONS = [
  'cart', 'tent', 'camp', 'food', 'bus', 'ride', 'bible', 'music', 'wristband',
  'camera', 'couple', 'family', 'man', 'woman', 'world', 'dart', 'reunion', 'barcode',
];

const AdminProductsManagement = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file || !editingProduct) return;
    setImageBusy(true);
    try {
      await uploadProductImage(editingProduct.id, file);
      toast.success(t('admin.products.imageSent'));
      setEditingProduct((prev) => ({ ...prev, hasImage: true }));
      await fetchAll(true);
    } catch {
      toast.error(t('admin.products.imageSendError'));
    } finally {
      setImageBusy(false);
    }
  };

  const handleImageRemove = async () => {
    if (!editingProduct) return;
    setImageBusy(true);
    try {
      await deleteProductImage(editingProduct.id);
      toast.success(t('admin.products.imageRemoved'));
      setEditingProduct((prev) => ({ ...prev, hasImage: false }));
      await fetchAll(true);
    } catch {
      toast.error(t('admin.products.imageRemoveError'));
    } finally {
      setImageBusy(false);
    }
  };
  const [products, setProducts] = useState([]);
  const [lots, setLots] = useState([]);
  const [packageCategories, setPackageCategories] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [lotPrices, setLotPrices] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ageRules, setAgeRules] = useState([]);
  const [bracketDrafts, setBracketDrafts] = useState({});

  scrollUp();

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [productsData, lotsData, categoriesData, rulesData] = await Promise.all([
        getAllProducts(),
        getLotsAuthenticated(),
        listPackageCategories(),
        listAgePriceRules(),
      ]);
      const list = Array.isArray(productsData?.products) ? productsData.products : [];
      setProducts(list.sort((a, b) => a.sortOrder - b.sortOrder));
      setLots(Array.isArray(lotsData?.lots) ? lotsData.lots : []);
      setPackageCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setAgeRules(Array.isArray(rulesData) ? rulesData : []);
    } catch (error) {
      toast.error(t('admin.products.fetchError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const patchBracket = (productId, patch) =>
    setBracketDrafts((prev) => ({ ...prev, [productId]: { ...(prev[productId] || {}), ...patch } }));

  const handleAddBracket = async (product) => {
    const draft = bracketDrafts[product.id] || {};
    const minAge = Number(draft.minAge);
    const maxAge = Number(draft.maxAge);
    const discountType = draft.discountType === 'VALUE' ? 'VALUE' : 'PERCENT';
    const discountAmount = Number(draft.discountAmount);

    if (draft.minAge === '' || draft.minAge == null || Number.isNaN(minAge)) {
      toast.error(t('admin.products.minAgeRequired'));
      return;
    }
    if (draft.maxAge === '' || draft.maxAge == null || Number.isNaN(maxAge)) {
      toast.error(t('admin.products.maxAgeRequired'));
      return;
    }
    if (maxAge < minAge) {
      toast.error(t('admin.products.maxAgeLessThanMin'));
      return;
    }
    if (Number.isNaN(discountAmount) || discountAmount <= 0) {
      toast.error(t('admin.products.discountGreaterZero'));
      return;
    }
    if (discountType === 'PERCENT' && discountAmount > 100) {
      toast.error(t('admin.products.percentMax100'));
      return;
    }

    const overlaps = ageRules.some(
      (rule) => rule.productId === product.id && minAge <= rule.maxAge && rule.minAge <= maxAge,
    );
    if (overlaps) {
      toast.error(t('admin.products.bracketOverlap'));
      return;
    }

    setLoading(true);
    try {
      await createAgePriceRule({ productId: product.id, minAge, maxAge, discountType, discountAmount });
      toast.success(t('admin.products.bracketAdded'));
      const label = discountType === 'VALUE' ? `R$ ${discountAmount}` : `${discountAmount}%`;
      registerLog(`Criou faixa de desconto ${minAge}-${maxAge} anos (${label}) em ${product.name}`, loggedUsername);
      setBracketDrafts((prev) => ({
        ...prev,
        [product.id]: { minAge: '', maxAge: '', discountType, discountAmount: '' },
      }));
      fetchAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.products.bracketAddError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBracket = async (rule, productName) => {
    setLoading(true);
    try {
      await deleteAgePriceRule(rule.id);
      toast.success(t('admin.products.bracketRemoved'));
      registerLog(`Removeu faixa de desconto ${rule.minAge}-${rule.maxAge} anos em ${productName}`, loggedUsername);
      fetchAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.products.bracketRemoveError'));
    } finally {
      setLoading(false);
    }
  };

  const priceForLot = (product, lotId) => product?.prices?.find((p) => String(p.lotId) === String(lotId));

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setLotPrices({});
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      packageCategoryId: product.packageCategoryId ?? '',
      active: product.active,
      iconKey: product.iconKey || '',
      stock: product.initialStock ?? '',
      price: product.price ?? '',
      tracksStock: product.initialStock != null,
    });
    const initial = {};
    lots.forEach((lot) => {
      const row = priceForLot(product, lot.id);
      initial[lot.id] = {
        price: row?.price ?? 0,
        vacancies: row?.vacancies ?? '',
      };
    });
    setLotPrices(initial);
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const categoryName = (id) => packageCategories.find((c) => c.id === id)?.name || '—';

  const validateForm = () => {
    if (!formData.name || !formData.packageCategoryId) {
      toast.error(t('admin.products.nameCategoryRequired'));
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    name: formData.name,
    description: formData.description,
    packageCategoryId: Number(formData.packageCategoryId),
    active: formData.active,
    iconKey: formData.iconKey || '',
    stock: formData.tracksStock && formData.stock !== '' ? Number(formData.stock) : null,
    price: formData.price === '' || formData.price === null ? null : Number(formData.price),
  });

  const saveLotPrices = async (productId) => {
    const entries = Object.entries(lotPrices);
    for (const [lotId, values] of entries) {
      await setLotProductPrice(lotId, productId, {
        price: Number(values.price || 0),
        vacancies: values.vacancies === '' ? null : Number(values.vacancies),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, buildPayload());
        await saveLotPrices(editingProduct.id);
        toast.success(t('admin.products.updateSuccess'));
        registerLog(`Editou produto ${formData.name}`, loggedUsername);
      } else {
        const created = await createProduct(buildPayload());

        if (created?.id && Object.keys(lotPrices).length > 0) {
          await saveLotPrices(created.id);
        }
        toast.success(t('admin.products.createSuccess'));
        registerLog(`Criou produto ${formData.name}`, loggedUsername);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData(emptyForm);
      setLotPrices({});
      await fetchAll(true);
    } catch (error) {
      toast.error(t('admin.products.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteProduct(productToDelete.id);
      toast.success(t('admin.products.deleteSuccess'));
      registerLog(`Excluiu produto ${productToDelete.name}`, loggedUsername);
      setShowDeleteModal(false);
      await fetchAll(true);
    } catch (error) {
      toast.error(t('admin.products.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const setLotField = (lotId, field, value) => {
    setLotPrices((prev) => ({
      ...prev,
      [lotId]: { ...(prev[lotId] || { price: 0, vacancies: '' }), [field]: value },
    }));
  };

  const activeCount = products.filter((p) => p.active).length;
  const byCategory = products.reduce((acc, p) => {
    const key = String(p.packageCategoryId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const categoriesPresent = packageCategories.filter((c) => byCategory[String(c.id)]);
  const statItems = [
    { label: t('admin.products.statTotal'), value: products.length },
    { label: t('admin.products.statActive'), value: activeCount, tone: 'free' },
    { label: t('admin.products.statInactive'), value: products.length - activeCount, tone: 'used' },
    ...categoriesPresent.map((c) => ({ label: c.name, value: byCategory[String(c.id)], tone: 'accent' })),
  ];
  const categoryChips = [
    { value: 'all', label: t('admin.products.chipAll'), count: products.length },
    ...categoriesPresent.map((c) => ({ value: String(c.id), label: c.name, count: byCategory[String(c.id)] })),
  ];
  const term = search.trim().toLowerCase();
  const filteredProducts = products.filter(
    (p) =>
      (categoryFilter === 'all' || String(p.packageCategoryId) === categoryFilter) &&
      (!term || (p.name || '').toLowerCase().includes(term)),
  );

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-product',
      name: t('admin.products.createButton'),
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'cart',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--products">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.products.title')}
        subtitle={t('admin.products.subtitle')}
        typeIcon="cart"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="products-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.products.searchPlaceholder')} />
          <FilterChips options={categoryChips} value={categoryFilter} onChange={setCategoryFilter} />
        </div>

        <SectionHeader title={t('admin.products.sectionProducts')} count={filteredProducts.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.products.colName')}</th>
                <th className="table-cells-header">{t('admin.products.colCategory')}</th>
                <th className="table-cells-header">{t('admin.products.colStatus')}</th>
                <th className="table-cells-header">{t('admin.products.colLotPrices')}</th>
                <th className="table-cells-header">{t('admin.products.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-start text-secondary p-4">
                    {t('admin.products.emptyProducts')}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <em>{product.name}</em>
                    {product.description && <div className="text-secondary small">{product.description}</div>}
                    {product.initialStock != null && (
                      <div className="small mt-1">
                        <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                          {t('admin.products.stockBadge', { stock: product.stock, initial: product.initialStock })}
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td>{categoryName(product.packageCategoryId)}</td>
                  <td>{product.active ? <Badge bg="success">{t('admin.products.statusActive')}</Badge> : <Badge bg="secondary">{t('admin.products.statusInactive')}</Badge>}</td>
                  <td>
                    <div className="lot-prices">
                      {lots.map((lot) => {
                        const row = priceForLot(product, lot.id);
                        return (
                          <div key={lot.id} className="lot-price-chip">
                            <span className="lot-price-chip__name">{lot.name}</span>
                            <span className="lot-price-chip__value">R$ {row?.price ?? 0}</span>
                            {row?.vacancies != null && (
                              <span className="lot-price-chip__vacancies">{t('admin.products.vacancies', { count: row.vacancies })}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="table-action-cell">
                      <ActionButton action="edit" label={t('admin.products.editProduct')} onClick={() => handleEditClick(product)} />
                      <ActionButton action="delete" label={t('admin.products.deleteProduct')} onClick={() => handleDeleteClick(product)} />
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </Table>
        </div>

        <SectionHeader title={t('admin.products.sectionAgeRules')} count={ageRules.length} />
        <p className="age-rules__hint">
          <Trans i18nKey="admin.products.ageRulesHint" components={{ b: <b /> }} />
        </p>

        <div className="age-rules">
          {products.map((product) => {
            const productRules = ageRules
              .filter((rule) => rule.productId === product.id)
              .sort((a, b) => a.minAge - b.minAge);
            const draft = bracketDrafts[product.id] || {};

            return (
              <div key={product.id} className="age-rules__product">
                <div className="age-rules__product-head">
                  <span className="age-rules__product-name">{product.name}</span>
                  <Badge bg="light" text="dark" className="age-rules__product-cat">
                    {categoryName(product.packageCategoryId)}
                  </Badge>
                </div>

                {productRules.length === 0 ? (
                  <div className="age-rules__empty">{t('admin.products.noBrackets')}</div>
                ) : (
                  productRules.map((rule) => (
                    <div key={rule.id} className="age-rules__row">
                      <span className="age-rules__label">
                        {t('admin.products.bracketRange', { min: rule.minAge, max: rule.maxAge })}{' '}
                        <b>
                          {rule.discountType === 'VALUE'
                            ? t('admin.products.bracketValueOff', { amount: rule.discountAmount })
                            : t('admin.products.bracketPercentOff', { amount: rule.discountAmount })}
                        </b>
                        {rule.discountType === 'PERCENT' && Number(rule.discountAmount) >= 100
                          ? t('admin.products.bracketFree')
                          : ''}
                      </span>
                      <ActionButton
                        action="delete"
                        iconSize={17}
                        label={t('admin.products.removeBracket')}
                        onClick={() => handleRemoveBracket(rule, product.name)}
                      />
                    </div>
                  ))
                )}

                <div className="age-rules__add">
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder={t('admin.products.fromPlaceholder')}
                    value={draft.minAge ?? ''}
                    onChange={(e) => patchBracket(product.id, { minAge: e.target.value })}
                  />
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder={t('admin.products.toPlaceholder')}
                    value={draft.maxAge ?? ''}
                    onChange={(e) => patchBracket(product.id, { maxAge: e.target.value })}
                  />
                  <Form.Select
                    aria-label={t('admin.products.discountTypeAria')}
                    value={draft.discountType ?? 'PERCENT'}
                    onChange={(e) => patchBracket(product.id, { discountType: e.target.value })}
                  >
                    <option value="PERCENT">%</option>
                    <option value="VALUE">R$</option>
                  </Form.Select>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder={
                      (draft.discountType ?? 'PERCENT') === 'VALUE'
                        ? t('admin.products.discountValuePlaceholder')
                        : t('admin.products.discountPercentPlaceholder')
                    }
                    value={draft.discountAmount ?? ''}
                    onChange={(e) => patchBracket(product.id, { discountAmount: e.target.value })}
                  />
                  <Button variant="outline-teal-blue" size="sm" onClick={() => handleAddBracket(product)}>
                    {t('admin.products.add')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          variant="confirm"
          icon={editingProduct ? 'edit' : 'plus'}
          iconFill={editingProduct ? '' : '#057c05'}
          title={editingProduct ? t('admin.products.editModalTitle') : t('admin.products.createModalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('admin.products.cancel')}
              </Button>
              <SpinnerButton className="btn-confirm" variant="primary" type="submit" onClick={handleSubmit} loading={saving}>
                {editingProduct ? t('admin.products.saveChanges') : t('admin.products.createProduct')}
              </SpinnerButton>
            </>
          }
        >
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>
                <b>{t('admin.products.formName')}</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('admin.products.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="lg"
              />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mt-3">
              <Form.Label>
                <b>{t('admin.products.formDescription')}</b>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={t('admin.products.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="formCategory" className="mt-3">
              <Form.Label>
                <b>{t('admin.products.formCategory')}</b>
              </Form.Label>
              <Form.Select
                value={formData.packageCategoryId}
                onChange={(e) => setFormData({ ...formData, packageCategoryId: e.target.value })}
                size="lg"
              >
                <option value="" disabled>
                  {t('admin.products.selectOption')}
                </option>
                {packageCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
              {packageCategories.length === 0 && (
                <Form.Text className="text-muted">
                  {t('admin.products.noCategoriesHint')}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="formTracksStock" className="mt-3">
              <Form.Check
                type="switch"
                label={t('admin.products.tracksStock', 'Controlar estoque deste produto')}
                checked={!!formData.tracksStock}
                onChange={(e) => setFormData({ ...formData, tracksStock: e.target.checked })}
              />
            </Form.Group>

            {formData.tracksStock && (
              <Form.Group controlId="formStock" className="mt-3">
                <Form.Label>
                  <b>{t('admin.products.formStock')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder={t('admin.products.stockPlaceholder')}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
                <Form.Text className="text-muted">
                  {t('admin.products.stockHint')}
                  {editingProduct && editingProduct.stock != null && (
                    <Trans
                      i18nKey="admin.products.stockToday"
                      values={{ stock: editingProduct.stock, initial: editingProduct.initialStock }}
                      components={{ b: <b /> }}
                    />
                  )}
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group controlId="formSinglePrice" className="mt-3">
              <Form.Label>
                <b>{t('admin.products.formSinglePrice')}</b>
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                step="0.01"
                placeholder={t('admin.products.singlePricePlaceholder')}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <Form.Text className="text-muted">
                <Trans i18nKey="admin.products.singlePriceHint" components={{ b: <b /> }} />
              </Form.Text>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>{t('admin.products.formIcon')}</b>
              </Form.Label>
              <div className="product-icon-picker">
                <button
                  type="button"
                  className={`product-icon-picker__item ${!formData.iconKey ? 'is-active' : ''}`}
                  onClick={() => setFormData({ ...formData, iconKey: '' })}
                  title={t('admin.products.iconNone')}
                >
                  —
                </button>
                {PRODUCT_ICONS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`product-icon-picker__item ${formData.iconKey === key ? 'is-active' : ''}`}
                    onClick={() => setFormData({ ...formData, iconKey: key })}
                    title={key}
                  >
                    <Icons typeIcon={key} iconSize={22} fill={formData.iconKey === key ? '#007185' : '#555050'} />
                  </button>
                ))}
              </div>
              <Form.Text className="text-muted">
                {t('admin.products.iconHint')}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>{t('admin.products.formImage')}</b>
              </Form.Label>
              {editingProduct ? (
                <div className="product-image-upload">
                  {editingProduct.hasImage && (
                    <img
                      className="product-image-upload__preview"
                      src={`${productImageUrl(editingProduct.id)}?t=${Date.now()}`}
                      alt={t('admin.products.imageAlt')}
                    />
                  )}
                  <div className="product-image-upload__actions">
                    <label className="btn btn-outline-teal-blue btn-sm mb-0">
                      {imageBusy ? t('admin.products.uploading') : editingProduct.hasImage ? t('admin.products.changeImage') : t('admin.products.uploadImage')}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={imageBusy}
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                    </label>
                    {editingProduct.hasImage && (
                      <Button size="sm" variant="outline-danger" disabled={imageBusy} onClick={handleImageRemove}>
                        {t('admin.products.remove')}
                      </Button>
                    )}
                  </div>
                  <Form.Text className="text-muted">{t('admin.products.imageHint')}</Form.Text>
                </div>
              ) : (
                <Form.Text className="text-muted d-block">
                  {t('admin.products.saveFirstForImage')}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="formActive" className="mt-3">
              <Form.Check
                type="switch"
                label={t('admin.products.activeSwitch')}
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </Form.Group>

            <hr />
            <h6 className="mt-3">
              <b>{t('admin.products.lotPricesTitle')}</b>
            </h6>
            <p className="text-secondary small">
              <Trans i18nKey="admin.products.lotPricesHint" components={{ b: <b /> }} />
            </p>
            <div className="lot-prices-grid">
              {lots.map((lot) => (
                <div key={lot.id} className="lot-price-card">
                  <div className="lot-price-card__name">{lot.name}</div>
                  <div className="lot-price-card__fields">
                    <Form.Group>
                      <Form.Label className="small mb-0">{t('admin.products.priceLabel')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={lotPrices[lot.id]?.price ?? 0}
                        onChange={(e) => setLotField(lot.id, 'price', e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small mb-0">{t('admin.products.vacanciesLabel')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={lotPrices[lot.id]?.vacancies ?? ''}
                        onChange={(e) => setLotField(lot.id, 'vacancies', e.target.value)}
                      />
                    </Form.Group>
                  </div>
                </div>
              ))}
            </div>
          </Form>
        </CustomModal>

        <CustomModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          variant="cancel"
          title={t('admin.products.deleteModalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('admin.products.cancel')}
              </Button>
              <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDelete} loading={saving}>
                {t('admin.products.delete')}
              </SpinnerButton>
            </>
          }
        >
          <Trans
            i18nKey="admin.products.deleteConfirm"
            values={{ name: productToDelete?.name }}
            components={{ strong: <strong /> }}
          />
        </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminProductsManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminProductsManagement;
