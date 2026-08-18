import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import {
  listPackageCategories,
  createPackageCategory,
  updatePackageCategory,
  deletePackageCategory,
} from '@/services/packageCategories';
import { getAllProducts, assignProductPackageCategory } from '@/services/products';
import { listAgePriceRules, createAgePriceRule, deleteAgePriceRule } from '@/services/agePriceRules';
import { getEvent } from '@/services/events';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getEventSlug } from '@/config/eventScope';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const SELECTION_RULES = [
  { value: 'single', label: 'Escolher uma' },
  { value: 'multiple', label: 'Escolher várias' },
];

const ruleLabel = (rule) => SELECTION_RULES.find((r) => r.value === rule)?.label || rule;

const EMPTY_CATEGORY = { id: null, name: '', description: '', selectionRule: 'single', required: true };

const AdminPackageBuilder = ({ loggedUsername }) => {
  const slug = useMemo(() => getEventSlug(), []);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [rules, setRules] = useState([]);
  const [agePricingEnabled, setAgePricingEnabled] = useState(false);
  const [bracketDrafts, setBracketDrafts] = useState({});
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
      const [cats, prodsData, event, ruleList] = await Promise.all([
        listPackageCategories(),
        getAllProducts(),
        getEvent(slug),
        listAgePriceRules(),
      ]);
      setCategories(cats);
      setProducts(prodsData?.products || []);
      setAgePricingEnabled(Boolean(event?.agePricingEnabled));
      setRules(ruleList);
    } catch {
      toast.error('Erro ao carregar o pacote.');
    } finally {
      setLoading(false);
    }
  };

  const patchBracket = (categoryId, patch) =>
    setBracketDrafts((prev) => ({
      ...prev,
      [categoryId]: { minAge: '', maxAge: '', discount: '', ...prev[categoryId], ...patch },
    }));

  const addBracket = async (categoryId) => {
    const draftBracket = bracketDrafts[categoryId] || {};
    setSaving(true);
    try {
      await createAgePriceRule({
        packageCategoryId: categoryId,
        minAge: Number(draftBracket.minAge || 0),
        maxAge: Number(draftBracket.maxAge || 0),
        discountPercent: Number(draftBracket.discount || 0),
      });
      setBracketDrafts((prev) => ({ ...prev, [categoryId]: { minAge: '', maxAge: '', discount: '' } }));
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao adicionar faixa.');
    } finally {
      setSaving(false);
    }
  };

  const removeBracket = async (id) => {
    setSaving(true);
    try {
      await deleteAgePriceRule(id);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao remover faixa.');
    } finally {
      setSaving(false);
    }
  };

  const unassignedProducts = useMemo(() => products.filter((p) => !p.packageCategoryId), [products]);

  const priceLabel = (product) => {
    if (!product.prices || product.prices.length === 0) return 'sem preço (defina em Produtos)';
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
      toast.error(getApiErrorMessage(err) || 'Erro ao associar produto.');
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
      toast.error(getApiErrorMessage(err) || 'Erro ao remover produto.');
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
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!draft.name.trim()) {
      toast.error('Informe o nome da categoria.');
      return;
    }
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      selectionRule: draft.selectionRule,
      required: draft.required,
      order: draft.id ? undefined : categories.length,
    };
    try {
      if (draft.id) await updatePackageCategory(draft.id, payload);
      else await createPackageCategory(payload);
      setShowModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao salvar a categoria.');
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
      toast.error(getApiErrorMessage(err) || 'Erro ao reordenar.');
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
      toast.error(getApiErrorMessage(err) || 'Erro ao excluir.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage package-builder">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Pacote"
        subtitle={`Categorias e produtos do evento: ${slug}`}
        typeIcon="cart"
      />

      <div className="package-builder__content">
        <div className="package-builder__toolbar">
          <Button variant="teal-blue" onClick={openCreate}>
            + Nova categoria
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : categories.length === 0 ? (
          <p className="package-builder__empty">Crie categorias para montar o pacote (ex.: Hospedagem, Transporte).</p>
        ) : (
          <ul className="package-builder__list">
            {categories.map((category, index) => {
              const catProducts = products.filter((p) => p.packageCategoryId === category.id);
              return (
                <li key={category.id} className="package-builder__cat">
                  <div className="package-builder__item">
                    <div className="package-builder__item-order">
                      <button
                        type="button"
                        className="package-builder__move package-builder__move--up"
                        disabled={index === 0 || saving}
                        onClick={() => move(index, -1)}
                        aria-label="Mover para cima"
                      >
                        <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                      </button>
                      <button
                        type="button"
                        className="package-builder__move package-builder__move--down"
                        disabled={index === categories.length - 1 || saving}
                        onClick={() => move(index, 1)}
                        aria-label="Mover para baixo"
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
                          {category.required ? 'Obrigatória' : 'Opcional'}
                        </Badge>
                      </div>
                    </div>
                    <div className="package-builder__item-actions">
                      <Button size="sm" variant="outline-teal-blue" onClick={() => openEdit(category)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setToDelete(category)}>
                        Excluir
                      </Button>
                    </div>
                  </div>

                  <div className="package-builder__products">
                    {catProducts.length === 0 ? (
                      <p className="package-builder__section-empty">Nenhum produto nesta categoria.</p>
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
                              Remover
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
                          <option value="">Selecione um produto...</option>
                          {unassignedProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · {priceLabel(p)}
                            </option>
                          ))}
                        </Form.Select>
                        <Button size="sm" variant="teal-blue" onClick={assignProduct} disabled={saving || !assignProductId}>
                          Associar
                        </Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setAssignFor(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="teal-blue"
                        className="mt-1"
                        disabled={unassignedProducts.length === 0}
                        title={unassignedProducts.length === 0 ? 'Crie produtos na tela de Produtos' : ''}
                        onClick={() => {
                          setAssignFor(category);
                          setAssignProductId('');
                        }}
                      >
                        + Associar produto
                      </Button>
                    )}
                  </div>

                  {agePricingEnabled && (
                    <div className="package-builder__brackets">
                      <div className="package-builder__brackets-title">Faixas de idade (desconto)</div>
                      {rules
                        .filter((r) => r.packageCategoryId === category.id)
                        .map((rule) => (
                          <div key={rule.id} className="package-builder__bracket">
                            <span>
                              {rule.minAge}–{rule.maxAge} anos → <b>{rule.discountPercent}% off</b>
                              {rule.discountPercent === 100 ? ' (grátis)' : ''}
                            </span>
                            <Button size="sm" variant="outline-danger" disabled={saving} onClick={() => removeBracket(rule.id)}>
                              ×
                            </Button>
                          </div>
                        ))}
                      <div className="package-builder__bracket-add">
                        <Form.Control
                          type="number"
                          placeholder="de"
                          value={bracketDrafts[category.id]?.minAge ?? ''}
                          onChange={(e) => patchBracket(category.id, { minAge: e.target.value })}
                        />
                        <Form.Control
                          type="number"
                          placeholder="até"
                          value={bracketDrafts[category.id]?.maxAge ?? ''}
                          onChange={(e) => patchBracket(category.id, { maxAge: e.target.value })}
                        />
                        <Form.Control
                          type="number"
                          placeholder="% off"
                          value={bracketDrafts[category.id]?.discount ?? ''}
                          onChange={(e) => patchBracket(category.id, { discount: e.target.value })}
                        />
                        <Button size="sm" variant="teal-blue" disabled={saving} onClick={() => addBracket(category.id)}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="info"
        title={draft.id ? 'Editar categoria' : 'Nova categoria'}
        icon="cart"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome da categoria</Form.Label>
            <Form.Control
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex.: Hospedagem"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descrição (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Texto exibido acima das opções desta categoria"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Regra de escolha</Form.Label>
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
            label="Categoria obrigatória"
            checked={draft.required}
            onChange={(e) => setDraft((prev) => ({ ...prev, required: e.target.checked }))}
          />
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title="Excluir categoria"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir <b>{toDelete?.name}</b>?
        </p>
      </CustomModal>
    </div>
  );
};

AdminPackageBuilder.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminPackageBuilder;
