import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { registerLog } from '@/services/logs';
import { getAllProducts } from '@/services/products';
import { getCategoriesAll, createCategory, updateCategory, deleteCategory } from '@/services/categories';
import scrollUp from '@/hooks/useScrollUp';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import './style.scss';

const emptyForm = { id: null, label: '', active: true };

const AdminCategories = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [countByCategory, setCountByCategory] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  scrollUp();

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [categoriesData, productsData] = await Promise.all([getCategoriesAll(), getAllProducts()]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      const products = Array.isArray(productsData?.products) ? productsData.products : [];
      const counts = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});
      setCountByCategory(counts);
    } catch (error) {
      toast.error('Erro ao buscar categorias');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const readError = (error) =>
    error?.response?.data?.message ||
    (typeof error?.response?.data === 'string' ? error.response.data : null);

  const handleSave = async () => {
    if (!form.label.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await updateCategory(form.id, { label: form.label, active: form.active });
        toast.success('Categoria atualizada');
        registerLog(`Editou categoria ${form.label}`, loggedUsername);
      } else {
        await createCategory({ label: form.label, active: form.active });
        toast.success('Categoria criada');
        registerLog(`Criou categoria ${form.label}`, loggedUsername);
      }
      setForm(emptyForm);
      await fetchAll(true);
    } catch (error) {
      toast.error(readError(error) || 'Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success('Categoria excluída');
      registerLog(`Excluiu categoria ${deleteTarget.label}`, loggedUsername);
      setDeleteTarget(null);
      await fetchAll(true);
    } catch (error) {
      toast.error(readError(error) || 'Erro ao excluir categoria');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = categories.filter((c) => c.active).length;

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'new-category',
      name: 'Nova Categoria',
      onClick: () => setForm(emptyForm),
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--categories">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Categorias de Produtos"
        subtitle="Crie e organize as categorias usadas nos produtos (ex.: Hospedagem, Transporte, Loja)"
        typeIcon="filter"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <section className="admin-table-card categories-form">
          <h6 className="categories-form__title">
            <b>{form.id ? 'Editar categoria' : 'Nova categoria'}</b>
          </h6>
          <div className="categories-form__row">
            <Form.Control
              type="text"
              placeholder="Nome da categoria (ex.: Loja)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <Form.Check
              type="switch"
              id="category-active"
              label="Ativa"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <SpinnerButton variant="primary" className="btn-confirm" onClick={handleSave} loading={saving}>
              {form.id ? 'Salvar' : 'Adicionar'}
            </SpinnerButton>
            {form.id && (
              <Button variant="outline-secondary" onClick={() => setForm(emptyForm)}>
                Cancelar edição
              </Button>
            )}
          </div>
          <p className="categories-form__hint text-secondary small">
            Categorias inativas não aparecem na criação de produtos. Não é possível excluir uma categoria que tenha
            produtos — reatribua-os ou desative a categoria.
          </p>
        </section>

        <SectionHeader title="Categorias" count={categories.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
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
                    <td>
                      <em>{cat.label}</em>
                    </td>
                    <td className="text-secondary small">{cat.key}</td>
                    <td>{countByCategory[cat.key] || 0}</td>
                    <td>{cat.active ? <Badge bg="success">Ativa</Badge> : <Badge bg="secondary">Inativa</Badge>}</td>
                    <td>
                      <div className="table-action-cell">
                        <ActionButton
                          action="edit"
                          label="Editar categoria"
                          onClick={() => setForm({ id: cat.id, label: cat.label, active: cat.active })}
                        />
                        <ActionButton action="delete" label="Excluir categoria" onClick={() => setDeleteTarget(cat)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <p className="text-secondary small">
          {categories.length} categorias · {activeCount} ativas
        </p>

        <CustomModal
          show={!!deleteTarget}
          onHide={() => setDeleteTarget(null)}
          variant="cancel"
          title="Confirmar Exclusão"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDelete} loading={saving}>
                Excluir
              </SpinnerButton>
            </>
          }
        >
          Tem certeza que deseja excluir a categoria <strong>{deleteTarget?.label}</strong>?
        </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminCategories.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminCategories;
