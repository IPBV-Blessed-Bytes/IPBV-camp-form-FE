import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
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
import { getAgePriceRules, createAgePriceRule, deleteAgePriceRule } from '@/services/agePriceRules';
import { getLotsAuthenticated } from '@/services/lots';
import { getCategoriesAll, createCategory, updateCategory, deleteCategory } from '@/services/categories';
import scrollUp from '@/hooks/useScrollUp';
import ActionButton from '@/components/Global/ActionButton';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';

const PRODUCT_ICONS = [
  'tent',
  'camp',
  'rooms',
  'bus',
  'ride',
  'food',
  'family',
  'couple',
  'person',
  'music',
  'bible',
  'calendar',
  'location-pin',
  'wristband',
  'cart',
  'world',
];

const emptyForm = { name: '', description: '', category: '', active: true, iconKey: '' };

const AdminProductsManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [lots, setLots] = useState([]);
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, label: '', active: true });
  const [categorySaving, setCategorySaving] = useState(false);

  scrollUp();

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [productsData, lotsData, rulesData, categoriesData] = await Promise.all([
        getAllProducts(),
        getLotsAuthenticated(),
        getAgePriceRules(),
        getCategoriesAll(),
      ]);
      const list = Array.isArray(productsData?.products) ? productsData.products : [];
      setProducts(list.sort((a, b) => a.sortOrder - b.sortOrder));
      setLots(Array.isArray(lotsData?.lots) ? lotsData.lots : []);
      setAgeRules(Array.isArray(rulesData?.rules) ? rulesData.rules : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      toast.error('Erro ao buscar produtos');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const priceForLot = (product, lotId) => product?.prices?.find((p) => String(p.lotId) === String(lotId));

  const categoryLabel = (value) => categories.find((c) => c.key === value)?.label || value;
  const activeCategories = categories.filter((c) => c.active);

  const openCategoryModal = () => {
    setCategoryForm({ id: null, label: '', active: true });
    setShowCategoryModal(true);
  };

  const editCategory = (cat) => {
    setCategoryForm({ id: cat.id, label: cat.label, active: cat.active });
    setShowCategoryModal(true);
  };

  const categoryError = (error) =>
    error?.response?.data?.message ||
    (typeof error?.response?.data === 'string' ? error.response.data : null);

  const handleSaveCategory = async () => {
    if (!categoryForm.label.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }
    setCategorySaving(true);
    try {
      if (categoryForm.id) {
        await updateCategory(categoryForm.id, { label: categoryForm.label, active: categoryForm.active });
        toast.success('Categoria atualizada');
        registerLog(`Editou categoria ${categoryForm.label}`, loggedUsername);
      } else {
        await createCategory({ label: categoryForm.label, active: categoryForm.active });
        toast.success('Categoria criada');
        registerLog(`Criou categoria ${categoryForm.label}`, loggedUsername);
      }
      setShowCategoryModal(false);
      await fetchAll(true);
    } catch (error) {
      toast.error(categoryError(error) || 'Erro ao salvar categoria');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    try {
      await deleteCategory(cat.id);
      toast.success('Categoria excluída');
      registerLog(`Excluiu categoria ${cat.label}`, loggedUsername);
      await fetchAll(true);
    } catch (error) {
      toast.error(categoryError(error) || 'Erro ao excluir categoria');
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
  };

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setLotPrices({});
    setEditingProduct(null);
    resetImageState();
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      active: product.active,
      iconKey: product.iconKey || '',
    });
    resetImageState();
    if (product.hasImage) setImagePreview(productImageUrl(product.id));
    const initial = {};
    lots.forEach((lot) => {
      const row = priceForLot(product, lot.id);
      initial[lot.id] = {
        price: row?.price ?? 0,
        foodPrice: row?.foodPrice ?? 0,
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

  const validateForm = () => {
    if (!formData.name || !formData.category) {
      toast.error('Nome e categoria são obrigatórios');
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const syncProductImage = async (productId, hadImage) => {
    if (imageFile) {
      await uploadProductImage(productId, imageFile);
    } else if (removeImage && hadImage) {
      await deleteProductImage(productId);
    }
  };

  const saveLotPrices = async (productId) => {
    const entries = Object.entries(lotPrices);
    for (const [lotId, values] of entries) {
      await setLotProductPrice(lotId, productId, {
        price: Number(values.price || 0),
        foodPrice: Number(values.foodPrice || 0),
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
        await updateProduct(editingProduct.id, formData);
        await saveLotPrices(editingProduct.id);
        await syncProductImage(editingProduct.id, editingProduct.hasImage);
        toast.success('Produto atualizado com sucesso');
        registerLog(`Editou produto ${formData.name}`, loggedUsername);
      } else {
        const created = await createProduct(formData);

        if (created?.id && Object.keys(lotPrices).length > 0) {
          await saveLotPrices(created.id);
        }
        if (created?.id) await syncProductImage(created.id, false);
        toast.success('Produto criado com sucesso');
        registerLog(`Criou produto ${formData.name}`, loggedUsername);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData(emptyForm);
      setLotPrices({});
      resetImageState();
      await fetchAll(true);
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteProduct(productToDelete.id);
      toast.success('Produto excluído com sucesso');
      registerLog(`Excluiu produto ${productToDelete.name}`, loggedUsername);
      setShowDeleteModal(false);
      await fetchAll(true);
    } catch (error) {
      toast.error('Erro ao excluir produto');
    } finally {
      setSaving(false);
    }
  };

  const patchBracket = (productId, patch) =>
    setBracketDrafts((prev) => ({ ...prev, [productId]: { ...(prev[productId] || {}), ...patch } }));

  const handleAddBracket = async ({ id: scopeId, name: scopeName, key: draftKey }) => {
    const draft = bracketDrafts[draftKey] || {};
    const minAge = Number(draft.minAge);
    const maxAge = Number(draft.maxAge);
    const discountType = draft.discountType === 'VALUE' ? 'VALUE' : 'PERCENT';
    const discountAmount = Number(draft.discountAmount);

    if (draft.minAge === '' || draft.minAge == null || Number.isNaN(minAge)) {
      toast.error('Informe a idade mínima');
      return;
    }
    if (draft.maxAge === '' || draft.maxAge == null || Number.isNaN(maxAge)) {
      toast.error('Informe a idade máxima');
      return;
    }
    if (maxAge < minAge) {
      toast.error('A idade máxima não pode ser menor que a mínima');
      return;
    }
    if (Number.isNaN(discountAmount) || discountAmount <= 0) {
      toast.error('Informe um desconto maior que zero');
      return;
    }
    if (discountType === 'PERCENT' && discountAmount > 100) {
      toast.error('O desconto percentual não pode passar de 100%');
      return;
    }

    const overlaps = ageRules.some(
      (rule) =>
        (scopeId == null ? rule.productId == null : rule.productId === scopeId) &&
        minAge <= rule.maxAge &&
        rule.minAge <= maxAge,
    );
    if (overlaps) {
      toast.error('Esta faixa de idade se sobrepõe a outra já cadastrada');
      return;
    }

    setLoading(true);
    try {
      await createAgePriceRule({ productId: scopeId, minAge, maxAge, discountType, discountAmount });
      toast.success('Faixa de desconto adicionada');
      const label = discountType === 'VALUE' ? `R$ ${discountAmount}` : `${discountAmount}%`;
      registerLog(`Criou faixa de desconto ${minAge}-${maxAge} anos (${label}) em ${scopeName}`, loggedUsername);
      setBracketDrafts((prev) => ({
        ...prev,
        [draftKey]: { minAge: '', maxAge: '', discountType, discountAmount: '' },
      }));
      fetchAll();
    } catch (error) {
      const serverMessage = typeof error?.response?.data === 'string' ? error.response.data : null;
      toast.error(serverMessage || 'Erro ao adicionar faixa de desconto');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBracket = async (rule, productName) => {
    setLoading(true);
    try {
      await deleteAgePriceRule(rule.id);
      toast.success('Faixa de desconto removida');
      registerLog(`Removeu faixa de desconto ${rule.minAge}-${rule.maxAge} anos em ${productName}`, loggedUsername);
      fetchAll();
    } catch (error) {
      toast.error('Erro ao remover faixa de desconto');
    } finally {
      setLoading(false);
    }
  };

  const renderBandsBlock = (rules, scope) => {
    const draft = bracketDrafts[scope.key] || {};
    const sorted = [...rules].sort((a, b) => a.minAge - b.minAge);
    return (
      <>
        {sorted.length === 0 ? (
          <div className="age-rules__empty">Sem faixas de desconto.</div>
        ) : (
          sorted.map((rule) => (
            <div key={rule.id} className="age-rules__row">
              <span className="age-rules__label">
                {rule.minAge}–{rule.maxAge} anos →{' '}
                <b>
                  {rule.discountType === 'VALUE'
                    ? `R$ ${rule.discountAmount} off`
                    : `${rule.discountAmount}% off`}
                </b>
                {rule.discountType === 'PERCENT' && rule.discountAmount >= 100 ? ' (grátis)' : ''}
              </span>
              <ActionButton
                action="delete"
                iconSize={17}
                label="Remover faixa"
                onClick={() => handleRemoveBracket(rule, scope.name)}
              />
            </div>
          ))
        )}

        <div className="age-rules__add">
          <Form.Control
            type="number"
            min="0"
            placeholder="de"
            value={draft.minAge ?? ''}
            onChange={(e) => patchBracket(scope.key, { minAge: e.target.value })}
          />
          <Form.Control
            type="number"
            min="0"
            placeholder="até"
            value={draft.maxAge ?? ''}
            onChange={(e) => patchBracket(scope.key, { maxAge: e.target.value })}
          />
          <Form.Select
            aria-label="Tipo de desconto"
            value={draft.discountType ?? 'PERCENT'}
            onChange={(e) => patchBracket(scope.key, { discountType: e.target.value })}
          >
            <option value="PERCENT">%</option>
            <option value="VALUE">R$</option>
          </Form.Select>
          <Form.Control
            type="number"
            min="0"
            placeholder={(draft.discountType ?? 'PERCENT') === 'VALUE' ? 'R$ off' : '% off'}
            value={draft.discountAmount ?? ''}
            onChange={(e) => patchBracket(scope.key, { discountAmount: e.target.value })}
          />
          <Button variant="outline-teal-blue" size="sm" onClick={() => handleAddBracket(scope)}>
            Adicionar
          </Button>
        </div>
      </>
    );
  };

  const setLotField = (lotId, field, value) => {
    setLotPrices((prev) => ({
      ...prev,
      [lotId]: { ...(prev[lotId] || { price: 0, foodPrice: 0, vacancies: '' }), [field]: value },
    }));
  };

  const activeCount = products.filter((p) => p.active).length;
  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const CATEGORY_TONES = { HOSPEDAGEM: 'accent', TRANSPORTE: 'info' };
  const statItems = [
    { label: 'Produtos', value: products.length },
    { label: 'Ativos', value: activeCount, tone: 'free' },
    { label: 'Inativos', value: products.length - activeCount, tone: 'used' },
    ...categories.filter((c) => byCategory[c.key]).map((c) => ({
      label: c.label,
      value: byCategory[c.key],
      tone: CATEGORY_TONES[c.key] || 'default',
    })),
  ];
  const categoryChips = [
    { value: 'all', label: 'Todas', count: products.length },
    ...categories.filter((c) => byCategory[c.key]).map((c) => ({
      value: c.key,
      label: c.label,
      count: byCategory[c.key],
    })),
  ];
  const term = search.trim().toLowerCase();
  const filteredProducts = products.filter(
    (p) =>
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (!term || (p.name || '').toLowerCase().includes(term)),
  );

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-product',
      name: 'Criar Novo Produto',
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'cart',
    },
    {
      fill: '#007185',
      iconSize: 22,
      id: 'manage-categories',
      name: 'Gerenciar Categorias',
      onClick: () => openCategoryModal(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'filter',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--products">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Produtos"
        subtitle="Hospedagem, transporte e alimentação — com preço e vagas por lote"
        typeIcon="cart"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="products-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome..." />
          <FilterChips options={categoryChips} value={categoryFilter} onChange={setCategoryFilter} />
        </div>

        <SectionHeader title="Produtos" count={filteredProducts.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Nome:</th>
                <th className="table-cells-header">Categoria:</th>
                <th className="table-cells-header">Status:</th>
                <th className="table-cells-header">Preços por lote:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-start text-secondary p-4">
                    Nenhum produto registrado
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <em>{product.name}</em>
                    {product.description && <div className="text-secondary small">{product.description}</div>}
                  </td>
                  <td>{categoryLabel(product.category)}</td>
                  <td>{product.active ? <Badge bg="success">Ativo</Badge> : <Badge bg="secondary">Inativo</Badge>}</td>
                  <td>
                    <div className="lot-prices">
                      {lots.map((lot) => {
                        const row = priceForLot(product, lot.id);
                        return (
                          <div key={lot.id} className="lot-price-chip">
                            <span className="lot-price-chip__name">{lot.name}</span>
                            <span className="lot-price-chip__value">R$ {row?.price ?? 0}</span>
                            {row?.vacancies != null && (
                              <span className="lot-price-chip__vacancies">{row.vacancies} vagas</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="table-action-cell">
                      <ActionButton action="edit" label="Editar produto" onClick={() => handleEditClick(product)} />
                      <ActionButton action="delete" label="Excluir produto" onClick={() => handleDeleteClick(product)} />
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </Table>
        </div>

        <SectionHeader title="Desconto de alimentação por idade (global)" />
        <p className="age-rules__hint">
          Aplica-se automaticamente à <b>parte-alimentação</b> de qualquer hospedagem, conforme a idade do
          inscrito. Configure aqui uma única vez (ex.: 0–8 anos grátis, 9–14 anos 50%).
        </p>
        <div className="age-rules">
          <div className="age-rules__product">
            <div className="age-rules__product-head">
              <span className="age-rules__product-name">Alimentação</span>
              <Badge bg="light" text="dark" className="age-rules__product-cat">
                Global
              </Badge>
            </div>
            {renderBandsBlock(ageRules.filter((rule) => rule.productId == null), {
              id: null,
              name: 'Alimentação',
              key: 'FOOD',
            })}
          </div>
        </div>

        <SectionHeader title="Desconto por idade — hospedagem/transporte" />
        <p className="age-rules__hint">
          Incidem sobre o preço do próprio produto (a parte-alimentação da hospedagem usa a faixa global acima).
        </p>
        <div className="age-rules">
          {products
            .filter((product) => product.category === 'HOSPEDAGEM' || product.category === 'TRANSPORTE')
            .map((product) => (
              <div key={product.id} className="age-rules__product">
                <div className="age-rules__product-head">
                  <span className="age-rules__product-name">{product.name}</span>
                  <Badge bg="light" text="dark" className="age-rules__product-cat">
                    {categoryLabel(product.category)}
                  </Badge>
                </div>
                {renderBandsBlock(ageRules.filter((rule) => rule.productId === product.id), {
                  id: product.id,
                  name: product.name,
                  key: product.id,
                })}
              </div>
            ))}
        </div>

        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          variant="confirm"
          icon={editingProduct ? 'edit' : 'plus'}
          iconFill={editingProduct ? '' : '#057c05'}
          title={editingProduct ? 'Editar Produto' : 'Criar Produto'}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <SpinnerButton className="btn-confirm" variant="primary" type="submit" onClick={handleSubmit} loading={saving}>
                {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
              </SpinnerButton>
            </>
          }
        >
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>
                <b>Nome:</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex.: Colégio Quarto Coletivo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="lg"
              />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mt-3">
              <Form.Label>
                <b>Descrição:</b>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Descrição exibida ao inscrito"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="formCategory" className="mt-3">
              <Form.Label>
                <b>Categoria:</b>
              </Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                size="lg"
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {activeCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formActive" className="mt-3">
              <Form.Check
                type="switch"
                label="Produto ativo (visível no formulário de inscrição)"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </Form.Group>

            <div className="mt-3">
              <Form.Label>
                <b>Visual do card</b>
              </Form.Label>
              <p className="text-secondary small mb-2">
                Escolha um ícone ou envie uma imagem. A imagem aparece no topo do card; o ícone aparece
                centralizado abaixo do título. Se enviar uma imagem, ela tem prioridade sobre o ícone.
              </p>
              <div className="product-visual">
                <div className="product-visual__icons">
                  <button
                    type="button"
                    className={`product-visual__icon ${!formData.iconKey ? 'is-active' : ''}`}
                    onClick={() => setFormData({ ...formData, iconKey: '' })}
                    title="Sem ícone"
                  >
                    <span className="product-visual__none">—</span>
                  </button>
                  {PRODUCT_ICONS.map((key) => (
                    <button
                      type="button"
                      key={key}
                      className={`product-visual__icon ${formData.iconKey === key ? 'is-active' : ''}`}
                      onClick={() => setFormData({ ...formData, iconKey: key })}
                      title={key}
                    >
                      <Icons typeIcon={key} iconSize={24} fill="#007185" />
                    </button>
                  ))}
                </div>
                <div className="product-visual__image">
                  {imagePreview ? (
                    <div className="product-visual__preview">
                      <img src={imagePreview} alt="Pré-visualização do produto" />
                      <Button variant="outline-danger" size="sm" onClick={clearImage}>
                        Remover imagem
                      </Button>
                    </div>
                  ) : (
                    <label className="product-visual__upload">
                      <Icons typeIcon="upload" iconSize={20} fill="#007185" />
                      <span>Enviar imagem</span>
                      <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <hr />
            <h6 className="mt-3">
              <b>Preço e vagas por lote</b>
            </h6>
            <p className="text-secondary small">
              Deixe o campo <b>Vagas</b> em branco para deixá-las ilimitadas. Na hospedagem, o <b>Preço</b> é
              só a hospedagem e a <b>Parte alimentação</b> é <b>somada</b> a ele para formar o total; o desconto
              por idade de alimentação (faixa global) incide sobre a alimentação, e o de hospedagem sobre o preço.
            </p>
            <div className="lot-prices-grid">
              {lots.map((lot) => (
                <div key={lot.id} className="lot-price-card">
                  <div className="lot-price-card__name">{lot.name}</div>
                  <div className="lot-price-card__fields">
                    <Form.Group>
                      <Form.Label className="small mb-0">Preço (R$)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={lotPrices[lot.id]?.price ?? 0}
                        onChange={(e) => setLotField(lot.id, 'price', e.target.value)}
                      />
                    </Form.Group>
                    {formData.category === 'HOSPEDAGEM' && (
                      <Form.Group>
                        <Form.Label className="small mb-0">
                          Alimentação (R$)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={lotPrices[lot.id]?.foodPrice ?? 0}
                          onChange={(e) => setLotField(lot.id, 'foodPrice', e.target.value)}
                        />
                      </Form.Group>
                    )}
                    <Form.Group>
                      <Form.Label className="small mb-0">Vagas</Form.Label>
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
          title="Confirmar Exclusão"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDelete} loading={saving}>
                Excluir
              </SpinnerButton>
            </>
          }
        >
          Tem certeza que deseja excluir o produto <strong>{productToDelete?.name}</strong>? Se ele já foi escolhido em
          inscrições, prefira apenas inativá-lo.
        </CustomModal>

        <CustomModal
          show={showCategoryModal}
          onHide={() => setShowCategoryModal(false)}
          size="lg"
          variant="confirm"
          icon="filter"
          iconFill="#057c05"
          title="Categorias de produtos"
          centered={false}
          footer={
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
              Fechar
            </Button>
          }
        >
          <p className="text-secondary small">
            Crie e organize as categorias usadas nos produtos (ex.: Hospedagem, Transporte, Loja). Categorias
            inativas não aparecem na criação de produtos. Não é possível excluir uma categoria com produtos.
          </p>

          <div className="category-manager">
            <div className="category-manager__form">
              <Form.Control
                type="text"
                placeholder="Nome da categoria (ex.: Loja)"
                value={categoryForm.label}
                onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
              />
              <Form.Check
                type="switch"
                id="category-active"
                label="Ativa"
                checked={categoryForm.active}
                onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
              />
              <SpinnerButton variant="primary" className="btn-confirm" onClick={handleSaveCategory} loading={categorySaving}>
                {categoryForm.id ? 'Salvar' : 'Adicionar'}
              </SpinnerButton>
              {categoryForm.id && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setCategoryForm({ id: null, label: '', active: true })}
                >
                  Cancelar edição
                </Button>
              )}
            </div>

            <Table striped bordered hover responsive className="custom-table mt-3">
              <thead>
                <tr>
                  <th className="table-cells-header">Categoria:</th>
                  <th className="table-cells-header">Chave:</th>
                  <th className="table-cells-header">Produtos:</th>
                  <th className="table-cells-header">Status:</th>
                  <th className="table-cells-header">Ações:</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-start text-secondary p-4">
                      Nenhuma categoria cadastrada
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.label}</td>
                      <td className="text-secondary small">{cat.key}</td>
                      <td>{byCategory[cat.key] || 0}</td>
                      <td>
                        {cat.active ? <Badge bg="success">Ativa</Badge> : <Badge bg="secondary">Inativa</Badge>}
                      </td>
                      <td>
                        <div className="table-action-cell">
                          <ActionButton action="edit" label="Editar categoria" onClick={() => editCategory(cat)} />
                          <ActionButton
                            action="delete"
                            label="Excluir categoria"
                            onClick={() => handleDeleteCategory(cat)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
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
