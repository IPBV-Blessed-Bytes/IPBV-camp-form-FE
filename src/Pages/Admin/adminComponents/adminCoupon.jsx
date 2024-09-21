import { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import Icons from '@/components/Icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Loading from '@/components/Loading';
import axios from 'axios';
import { BASE_URL } from '@/config';

const AdminCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [newCoupon, setNewCoupon] = useState({ cpf: '', discount: '', user: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/coupon`);

      setCoupons(response.data.coupons);
    } catch (error) {
      toast.error('Erro ao buscar cupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    setLoading(true);

    try {
      await fetcher.post('coupon/create', {
        ...newCoupon,
        id: Date.now().toString(),
      });
      toast.success('Cupom criado com sucesso');
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Erro ao criar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCoupon = async () => {
    setLoading(true);

    try {
      await fetcher.put(`coupon/${editingCoupon.id}`, editingCoupon);
      toast.success('Cupom atualizado com sucesso');
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Erro ao atualizar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    setLoading(true);

    try {
      const requestBody = {
        id: id,
        cpf: '',
        discount: '',
        user: '',
      };
      await fetcher.delete(`coupon/${id}`, { data: requestBody });
      toast.success('Cupom excluído com sucesso');
      setShowConfirmDelete(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Erro ao excluir cupom');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({ cpf: '', discount: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingCoupon(null);
    setShowModal(false);
  };

  const openConfirmDeleteModal = (coupon) => {
    setCouponToDelete(coupon);
    setShowConfirmDelete(true);
  };

  const closeConfirmDeleteModal = () => {
    setCouponToDelete(null);
    setShowConfirmDelete(false);
  };

  const handleSubmit = () => {
    if (editingCoupon) {
      handleEditCoupon();
    } else {
      handleCreateCoupon();
    }
  };

  return (
    <Container fluid>
      <Row className="mt-3">
        <Col>
          <Button variant="danger" onClick={() => navigate('/admin')}>
            <Icons typeIcon="arrow-left" iconSize={30} fill="#fff" />
            &nbsp;Voltar
          </Button>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <h4 className="fw-bold m-0">Gerenciamento de Cupons de Desconto:</h4>
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="table-tools--rides-buttons-wrapper mb-4">
        <Col lg={12} md={12} xs={12}>
          <div className="table-tools__right-buttons-ride flex-sm-column flex-md-row  d-flex gap-2">
            <Button variant="primary" onClick={() => openModal(null)} className="d-flex align-items-center" size="lg">
              <Icons typeIcon="coupon" iconSize={30} fill="#fff" />
              <span className="table-tools__button-name">&nbsp;Criar Novo Cupom</span>
            </Button>
          </div>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">CPF atrelado:</th>
              <th className="table-cells-header">Desconto:</th>
              <th className="table-cells-header">Usuário:</th>
              <th className="table-cells-header">Ações:</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.cpf}</td>
                <td>{coupon.discount}</td>
                <td>{coupon.user}</td>
                <td>
                  <Button variant="outline-success" onClick={() => openModal(coupon)}>
                    <Icons typeIcon="edit" iconSize={24} />
                  </Button>{' '}
                  <Button variant="outline-danger" onClick={() => openConfirmDeleteModal(coupon)}>
                    <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}</b>
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
                value={editingCoupon ? editingCoupon.cpf : newCoupon.cpf}
                size="lg"
                onChange={(e) =>
                  editingCoupon
                    ? setEditingCoupon({ ...editingCoupon, cpf: e.target.value })
                    : setNewCoupon({ ...newCoupon, cpf: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <b>Desconto:</b>
              </Form.Label>
              <Form.Control
                type="number"
                value={editingCoupon ? editingCoupon.discount : newCoupon.discount}
                size="lg"
                onChange={(e) =>
                  editingCoupon
                    ? setEditingCoupon({ ...editingCoupon, discount: e.target.value })
                    : setNewCoupon({ ...newCoupon, discount: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmDelete} onHide={closeConfirmDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Você tem certeza de que deseja excluir o cupom do CPF &quot;{couponToDelete?.cpf}&quot;?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => couponToDelete && handleDeleteCoupon(couponToDelete.id)}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminCoupon;
