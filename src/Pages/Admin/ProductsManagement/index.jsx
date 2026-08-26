import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getAllProducts, createProduct, updateProduct, deleteProduct, setLotProductPrice } from '@/services/products';
import { listAgePriceRules, createAgePriceRule, deleteAgePriceRule } from '@/services/agePriceRules';
import { getLotsAuthenticated } from '@/services/lots';
import { listPackageCategories } from '@/services/packageCategories';
import { getApiErrorMessage } from '@/fetchers/helpers';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';

const emptyForm = { name: '', description: '', packageCategoryId: '', active: true };

const AdminProductsManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
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

  const fetchAll = async () => {
    setLoading(true);
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
      toast.error('Erro ao buscar produtos');
    } finally {
      setLoading(false);
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
      (rule) => rule.productId === product.id && minAge <= rule.maxAge && rule.minAge <= maxAge,
    );
    if (overlaps) {
      toast.error('Esta faixa de idade se sobrepõe a outra já cadastrada para o produto');
      return;
    }

    setLoading(true);
    try {
      await createAgePriceRule({ productId: product.id, minAge, maxAge, discountType, discountAmount });
      toast.success('Faixa de desconto adicionada');
      const label = discountType === 'VALUE' ? `R$ ${discountAmount}` : `${discountAmount}%`;
      registerLog(`Criou faixa de desconto ${minAge}-${maxAge} anos (${label}) em ${product.name}`, loggedUsername);
      setBracketDrafts((prev) => ({
        ...prev,
        [product.id]: { minAge: '', maxAge: '', discountType, discountAmount: '' },
      }));
      fetchAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao adicionar faixa de desconto');
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
      toast.error(getApiErrorMessage(error) || 'Erro ao remover faixa de desconto');
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
      toast.error('Nome e categoria são obrigatórios');
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    name: formData.name,
    description: formData.description,
    packageCategoryId: Number(formData.packageCategoryId),
    active: formData.active,
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

    setLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, buildPayload());
        await saveLotPrices(editingProduct.id);
        toast.success('Produto atualizado com sucesso');
        registerLog(`Editou produto ${formData.name}`, loggedUsername);
      } else {
        const created = await createProduct(buildPayload());

        if (created?.id && Object.keys(lotPrices).length > 0) {
          await saveLotPrices(created.id);
        }
        toast.success('Produto criado com sucesso');
        registerLog(`Criou produto ${formData.name}`, loggedUsername);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData(emptyForm);
      setLotPrices({});
      fetchAll();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(productToDelete.id);
      toast.success('Produto excluído com sucesso');
      registerLog(`Excluiu produto ${productToDelete.name}`, loggedUsername);
      setShowDeleteModal(false);
      fetchAll();
    } catch (error) {
      toast.error('Erro ao excluir produto');
    } finally {
      setLoading(false);
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
    { label: 'Total de produtos', value: products.length },
    { label: 'Ativos', value: activeCount, tone: 'free' },
    { label: 'Inativos', value: products.length - activeCount, tone: 'used' },
    ...categoriesPresent.map((c) => ({ label: c.name, value: byCategory[String(c.id)], tone: 'accent' })),
  ];
  const categoryChips = [
    { value: 'all', label: 'Todas', count: products.length },
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
      name: 'Criar Novo Produto',
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'cart',
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
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <em>{product.name}</em>
                    {product.description && <div className="text-secondary small">{product.description}</div>}
                  </td>
                  <td>{categoryName(product.packageCategoryId)}</td>
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
                    <Button variant="outline-success" className="me-2" onClick={() => handleEditClick(product)}>
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>
                    <Button variant="outline-danger" onClick={() => handleDeleteClick(product)}>
                      <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <SectionHeader title="Faixas de idade (desconto)" count={ageRules.length} />
        <p className="age-rules__hint">
          As faixas abaixo são aplicadas automaticamente no formulário conforme a idade do inscrito, <b>por produto</b>.
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
                  <div className="age-rules__empty">Sem faixas de desconto.</div>
                ) : (
                  productRules.map((rule) => (
                    <div key={rule.id} className="age-rules__row">
                      <span className="age-rules__label">
                        {rule.minAge}–{rule.maxAge} anos →{' '}
                        <b>
                          {rule.discountType === 'VALUE'
                            ? `R$ ${rule.discountAmount} off`
                            : `${rule.discountAmount}% off`}
                        </b>
                        {rule.discountType === 'PERCENT' && Number(rule.discountAmount) >= 100 ? ' (grátis)' : ''}
                      </span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveBracket(rule, product.name)}
                        aria-label="Remover faixa"
                      >
                        <Icons typeIcon="delete" iconSize={18} fill="#dc3545" />
                      </Button>
                    </div>
                  ))
                )}

                <div className="age-rules__add">
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="de"
                    value={draft.minAge ?? ''}
                    onChange={(e) => patchBracket(product.id, { minAge: e.target.value })}
                  />
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="até"
                    value={draft.maxAge ?? ''}
                    onChange={(e) => patchBracket(product.id, { maxAge: e.target.value })}
                  />
                  <Form.Select
                    aria-label="Tipo de desconto"
                    value={draft.discountType ?? 'PERCENT'}
                    onChange={(e) => patchBracket(product.id, { discountType: e.target.value })}
                  >
                    <option value="PERCENT">%</option>
                    <option value="VALUE">R$</option>
                  </Form.Select>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder={(draft.discountType ?? 'PERCENT') === 'VALUE' ? 'R$ off' : '% off'}
                    value={draft.discountAmount ?? ''}
                    onChange={(e) => patchBracket(product.id, { discountAmount: e.target.value })}
                  />
                  <Button variant="outline-teal-blue" size="sm" onClick={() => handleAddBracket(product)}>
                    Adicionar
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
          title={editingProduct ? 'Editar Produto' : 'Criar Produto'}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button className="btn-confirm" variant="primary" type="submit" onClick={handleSubmit}>
                {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
              </Button>
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
                placeholder="Ex.: Alimentação Parcial"
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
                value={formData.packageCategoryId}
                onChange={(e) => setFormData({ ...formData, packageCategoryId: e.target.value })}
                size="lg"
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {packageCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
              {packageCategories.length === 0 && (
                <Form.Text className="text-muted">
                  Nenhuma categoria criada. Crie categorias na tela de Pacote do evento.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="formActive" className="mt-3">
              <Form.Check
                type="switch"
                label="Produto ativo (visível no formulário de inscrição)"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </Form.Group>

            <hr />
            <h6 className="mt-3">
              <b>Preço e vagas por lote</b>
            </h6>
            <p className="text-secondary small">Deixe o campo <b>Vagas</b> em branco para deixá-las ilimitadas.</p>
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
              <Button variant="danger" className="btn-cancel" onClick={handleDelete}>
                Excluir
              </Button>
            </>
          }
        >
          Tem certeza que deseja excluir o produto <strong>{productToDelete?.name}</strong>? Se ele já foi escolhido em
          inscrições, prefira apenas inativá-lo.
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
