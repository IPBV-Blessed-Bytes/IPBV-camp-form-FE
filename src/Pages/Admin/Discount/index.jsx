import { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Container } from 'react-bootstrap';
import { BASE_URL } from '@/config';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import axios from 'axios';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/AdminHeader';

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
      const response = await axios.get(`${BASE_URL}/coupon`);
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

  const registeredUser = (cpf) => {
    const isValid = paidUsers.some((user) => {
      return user.personalInformation.cpf === cpf;
    });

    return isValid;
  };

  const handleCreateDiscount = async () => {
    setLoading(true);

    try {
      await fetcher.post('coupon/create', {
        ...newDiscount,
        id: Date.now().toString(),
      });
      toast.success('Cupom criado com sucesso');
      setShowModal(false);
      fetchDiscounts();
      registerLog(`Criou o cupom atrelado ao CPF ${newDiscount.cpf}`, loggedUsername);
    } catch (error) {
      toast.error('Erro ao criar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiscount = async () => {
    setLoading(true);

    try {
      await fetcher.put(`coupon/${editingDiscount.id}`, editingDiscount);
      toast.success('Cupom atualizado com sucesso');
      setShowModal(false);
      fetchDiscounts();
      registerLog(`Editou o cupom atrelado ao CPF ${editingDiscount.cpf}`, loggedUsername);
    } catch (error) {
      toast.error('Erro ao atualizar cupom');
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
      toast.success('Cupom excluído com sucesso');
      setShowConfirmDelete(false);
      fetchDiscounts();
      registerLog(`Excluiu o cupom atrelado ao CPF ${deleteDiscount.cpf}`, loggedUsername);
    } catch (error) {
      toast.error('Erro ao excluir cupom');
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

  return (
    <Container fluid>
      <AdminHeader
        pageName="Gerenciamento de Descontos"
        sessionTypeIcon="discount"
        iconSize={80}
        fill={'#204691'}
        showHeaderTools
        headerToolsClassname="table-tools__right-buttons-generic flex-sm-column flex-md-row  d-flex gap-2"
        headerToolsTypeButton="primary"
        headerToolsOpenModal={() => openModal(null)}
        headerToolsButtonIcon="discount"
        headerToolsButtonName="Criar Novo Cupom"
      />

      <div className="table-responsive">
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">CPF atrelado:</th>
              <th className="table-cells-header">Valor:</th>
              <th className="table-cells-header">Usuário:</th>
              <th className="table-cells-header">Ações:</th>
            </tr>
          </thead>
          <tbody>
            {discount.map((discount) => {
              const isUserRegistered = registeredUser(discount.cpf);

              return (
                <tr key={discount.id}>
                  <td>{discount.cpf}</td>
                  <td>{discount.discount}</td>
                  <td>{isUserRegistered ? discount.user : ''}</td>
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

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{editingDiscount ? 'Editar Cupom' : 'Criar Novo Cupom'}</b>
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
          <Button variant="primary" onClick={handleSubmit}>
            {editingDiscount ? 'Salvar Alterações' : 'Criar Cupom'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmDelete} onHide={closeConfirmDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Excluir Cupom</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o cupom vinculado ao CPF <b>{discountToDelete?.cpf}</b>? Essa ação é
          irreversível.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => discountToDelete && handleDeleteDiscount(discountToDelete)}>
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
