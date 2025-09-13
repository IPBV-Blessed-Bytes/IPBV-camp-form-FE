import { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Container } from 'react-bootstrap';
import { BASE_URL } from '@/config';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import * as XLSX from 'xlsx';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Tools from '@/components/Admin/Header/Tools';

const AdminDiscount = ({ loggedUsername }) => {
  const [discount, setDiscount] = useState([]);
  const [paidUsers, setPaidUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [newDiscount, setNewDiscount] = useState({ cpf: '', discount: '', user: '' });

  scrollUp();

  useEffect(() => {
    fetchDiscounts();
    fetchPaidUsers();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetcher.get(`${BASE_URL}/coupon`);
      setDiscount(response.data.coupons);
    } catch (error) {
      toast.error('Erro ao buscar descontos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaidUsers = async () => {
    try {
      const response = await fetcher.get('camper', { params: { size: 100000 } });
      if (Array.isArray(response.data.content)) {
        setPaidUsers(response.data.content);
      } else {
        console.error('Erro: Dados não estão no formato esperado.');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários pagos:', error);
    }
  };

  const handleCreateDiscount = async () => {
    setLoading(true);

    try {
      await fetcher.post('coupon/create', {
        ...newDiscount,
        id: Date.now().toString(),
      });
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
      await fetcher.put(`coupon/${editingDiscount.id}`, editingDiscount);
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
      const deleteDiscount = {
        ...discountToDelete,
      };
      await fetcher.delete(`coupon/${discountToDelete.id}`, { data: deleteDiscount });
      toast.success('Desconto excluído com sucesso');
      setShowConfirmDelete(false);
      fetchDiscounts();
      registerLog(`Excluiu o desconto atrelado ao CPF ${deleteDiscount.cpf}`, loggedUsername);
    } catch (error) {
      toast.error('Erro ao excluir desconto');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (discount) => {
    setEditingDiscount(discount);
    setNewDiscount({ cpf: '', discount: '' });
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
    const fieldMapping = discount.map((discount) => {
      const camper = paidUsers.find((user) => user.personalInformation.cpf === discount.cpf);
      return {
        CPF: discount.cpf,
        'Valor Desconto': discount.discount,
        Usuário: camper ? discount.user : 'NÃO UTILIZADO',
        'Valor Pago': camper ? camper.totalPrice : '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(fieldMapping);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Descontos');
    XLSX.writeFile(workbook, 'descontos.xlsx');
  };

  return (
    <Container className="discounts" fluid>
      <AdminHeader pageName="Gerenciamento de Descontos" sessionTypeIcon="discount" iconSize={80} fill={'#204691'} />

      <Tools
        headerToolsCols={{ xl: 8 }}
        headerToolsClassname="table-tools__left-buttons d-flex"
        headerToolsTypeButton="success"
        headerToolsOpenModal={generateExcel}
        headerToolsButtonIcon="excel"
        headerToolsButtonName="Baixar Excel"
        secondaryButtonCols={{ xl: 4 }}
        secondaryButtonClassname="table-tools__right-buttons"
        secondaryButtonTypeButton="primary"
        secondaryButtonOpenModal={() => openModal(null)}
        secondaryButtonIcon="discount"
        secondaryButtonName="Criar Novo Desconto"
      />

      <div className="table-responsive">
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">CPF atrelado:</th>
              <th className="table-cells-header">Valor Desconto:</th>
              <th className="table-cells-header">Usuário:</th>
              <th className="table-cells-header">Valor Pago:</th>
              <th className="table-cells-header">Ações:</th>
            </tr>
          </thead>
          <tbody>
            {discount.map((discount) => {
              const camper = paidUsers.find((user) => user.personalInformation.cpf === discount.cpf);

              return (
                <tr key={discount.id}>
                  <td>{discount.cpf}</td>
                  <td>{discount.discount}</td>
                  <td>
                    {camper ? (
                      discount.user
                    ) : (
                      <b>
                        <em>NÃO UTILIZADO</em>
                      </b>
                    )}
                  </td>
                  <td>{camper ? camper.totalPrice : '-'}</td>
                  <td>
                    <Button variant="outline-success" onClick={() => openModal(discount)}>
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>{' '}
                    <Button variant="outline-danger" onClick={() => openConfirmDeleteModal(discount)}>
                      <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <Modal className="custom-modal" show={showModal} onHide={closeModal}>
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon={editingDiscount ? 'edit' : 'plus'} iconSize={25} fill={editingDiscount ? '' : '#057c05'} />
            <b>{editingDiscount ? 'Editar Desconto' : 'Criar Novo Desconto'}</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>CPF atrelado:</b>
              </Form.Label>
              <Form.Control
                type="number"
                value={editingDiscount ? editingDiscount.cpf : newDiscount.cpf}
                size="lg"
                onChange={(e) =>
                  editingDiscount
                    ? setEditingDiscount({ ...editingDiscount, cpf: e.target.value })
                    : setNewDiscount({ ...newDiscount, cpf: e.target.value })
                }
                placeholder="00000000000"
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleSubmit}>
            {editingDiscount ? 'Salvar Alterações' : 'Criar Desconto'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="custom-modal" show={showConfirmDelete} onHide={closeConfirmDeleteModal}>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Excluir Desconto</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o desconto vinculado ao CPF <b>{discountToDelete?.cpf}</b>?
        </Modal.Body>
        <Modal.Footer>
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
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

AdminDiscount.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminDiscount;
