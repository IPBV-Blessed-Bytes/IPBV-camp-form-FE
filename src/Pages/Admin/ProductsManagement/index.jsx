import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getAllProducts, createProduct, updateProduct, deleteProduct, setLotProductPrice } from '@/services/products';
import { getLotsAuthenticated } from '@/services/lots';
import { listPackageCategories } from '@/services/packageCategories';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';

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

  scrollUp();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productsData, lotsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getLotsAuthenticated(),
        listPackageCategories(),
      ]);
      const list = Array.isArray(productsData?.products) ? productsData.products : [];
      setProducts(list.sort((a, b) => a.sortOrder - b.sortOrder));
      setLots(Array.isArray(lotsData?.lots) ? lotsData.lots : []);
      setPackageCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      toast.error('Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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

        <SectionHeader title="Produtos" count={products.length} />

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
              {products.map((product) => (
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
            <p className="text-secondary small">Deixe as vagas em branco para "ilimitado".</p>
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
                        placeholder="ilimitado"
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
