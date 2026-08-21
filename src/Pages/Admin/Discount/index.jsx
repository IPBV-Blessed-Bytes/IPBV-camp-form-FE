import { useState, useEffect } from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import { registerLog } from '@/services/logs';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/coupons';
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
  const [discount, setDiscount] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const fetchDiscounts = async () => {
    try {
      const data = await listCoupons();
      setDiscount(data.coupons);
    } catch (error) {
      toast.error('Erro ao buscar descontos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async () => {
    setLoading(true);

    try {
      await createCoupon({ ...newDiscount, id: Date.now().toString() });
      toast.success('Desconto criado com sucesso');
      setShowModal(false);
      fetchDiscounts();
      registerLog(`Criou o desconto atrelado ao CPF ${newDiscount.cpf}`, loggedUsername);
    } catch (error) {
      toast.error('Erro ao criar desconto');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiscount = async () => {
    setLoading(true);

    try {
      await updateCoupon(editingDiscount.id, editingDiscount);
      toast.success('Desconto atualizado com sucesso');
      setShowModal(false);
      fetchDiscounts();
      registerLog(`Editou o desconto atrelado ao CPF ${editingDiscount.cpf}`, loggedUsername);
    } catch (error) {
      toast.error('Erro ao atualizar desconto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = async (discountToDelete) => {
    setLoading(true);

    try {
      await deleteCoupon(discountToDelete.id, discountToDelete);
      toast.success('Desconto excluído com sucesso');
      setShowConfirmDelete(false);
      fetchDiscounts();
      registerLog(`Excluiu o desconto atrelado ao CPF ${discountToDelete.cpf}`, loggedUsername);
    } catch (error) {
      toast.error('Erro ao excluir desconto');
    } finally {
      setLoading(false);
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
    { label: 'Descontos', value: discount.length },
    { label: 'Utilizados', value: usedCount, tone: 'free' },
    { label: 'Não utilizados', value: discount.length - usedCount, tone: 'used' },
    { label: 'Valor concedido', value: formatBRL(totalGranted), tone: 'accent' },
    { label: 'Valor pago', value: formatBRL(totalPaid), tone: 'info' },
  ];
  const statusChips = [
    { value: 'all', label: 'Todos', count: discount.length },
    { value: 'used', label: 'Utilizados', count: usedCount },
    { value: 'unused', label: 'Não utilizados', count: discount.length - usedCount },
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
      name: 'Baixar Relatório',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'add-new-discount',
      name: 'Criar Novo Desconto',
      onClick: () => openModal(null),
      typeButton: 'teal-blue',
      typeIcon: 'discount',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--discount discounts">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Descontos"
        subtitle="Cupons e descontos atrelados a CPFs"
        typeIcon="discount"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="discounts-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por CPF, usuário ou motivo..." />
          <FilterChips options={statusChips} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <SectionHeader title="Descontos cadastrados" count={filtered.length} />

        <div className="admin-table-card">
          <div className="table-responsive">
            <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">CPF atrelado:</th>
              <th className="table-cells-header">Valor Desconto:</th>
              <th className="table-cells-header">Usuário:</th>
              <th className="table-cells-header">Motivo:</th>
              <th className="table-cells-header">Valor Pago:</th>
              <th className="table-cells-header">Ações:</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              return (
                <tr key={item.id}>
                  <td>{formatCpf(item.cpf)}</td>
                  <td>{formatBRL(item.discount)}</td>
                  <td>
                    {item.user ? (
                      <Badge bg="success">{item.user}</Badge>
                    ) : (
                      <Badge bg="secondary">Não utilizado</Badge>
                    )}
                  </td>
                  <td>{item.discountReason || <span className="text-secondary">—</span>}</td>
                  <td>{item.totalPrice ? formatBRL(item.totalPrice) : <span className="text-secondary">—</span>}</td>
                  <td>
                    <Button variant="outline-success" onClick={() => openModal(item)}>
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>{' '}
                    <Button variant="outline-danger" onClick={() => openConfirmDeleteModal(item)}>
                      <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                    </Button>
                  </td>
                </tr>
              );
            })}
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
        title={editingDiscount ? 'Editar Desconto' : 'Criar Novo Desconto'}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="primary" className="btn-confirm" onClick={handleSubmit}>
              {editingDiscount ? 'Salvar Alterações' : 'Criar Desconto'}
            </Button>
          </>
        }
      >
        <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>CPF atrelado:</b>
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
                <b>Valor:</b>
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
                <b>Motivo do Desconto:</b>
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
                placeholder="Ex: Desconto pastoral, equipe, financeiro..."
              />
            </Form.Group>
          </Form>
      </CustomModal>

      <CustomModal
        show={showConfirmDelete}
        onHide={closeConfirmDeleteModal}
        variant="cancel"
        title="Excluir Desconto"
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={closeConfirmDeleteModal}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="btn-cancel"
              onClick={() => discountToDelete && handleDeleteDiscount(discountToDelete)}
            >
              Excluir
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir o desconto vinculado ao CPF <b>{discountToDelete?.cpf}</b>?
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
