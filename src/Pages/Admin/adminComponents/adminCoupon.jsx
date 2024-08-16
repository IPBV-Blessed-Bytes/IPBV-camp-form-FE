import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import Icons from '../../../components/Icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

const AdminCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', used: false, user: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons`);
      setCoupons(response.data);
    } catch (error) {
      toast.error('Erro ao buscar cupons');
    }
  };

  const handleCreateCoupon = async () => {
    try {
      await axios.post(`${API_URL}/coupons`, {
        ...newCoupon,
        id: Date.now().toString(),
        used: false,
      });
      toast.success('Cupom criado com sucesso');
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Erro ao criar cupom');
    }
  };

  const handleEditCoupon = async () => {
    try {
      await axios.put(`${API_URL}/coupons/${editingCoupon.id}`, editingCoupon);
      toast.success('Cupom atualizado com sucesso');
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Erro ao atualizar cupom');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(`${API_URL}/coupons/${id}`);
      toast.success('Cupom excluído com sucesso');
      setShowConfirmDelete(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Erro ao excluir cupom');
    }
  };

  const openModal = (coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({ code: '', discount: '' });
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
        <Col lg={2} md={3} xs={6}>
          Exemplo de cupom:{' '}
          <em>
            <b>NOMEDAPESSOA100</b>
          </em>
        </Col>
        <Col lg={10} md={9} xs={6}>
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
              <th className="table-cells-header">Código:</th>
              <th className="table-cells-header">Desconto:</th>
              <th className="table-cells-header">Usado:</th>
              <th className="table-cells-header">Usuário:</th>
              <th className="table-cells-header">Ações:</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.code}</td>
                <td>{coupon.discount}</td>
                <td>{coupon.used ? 'Sim' : 'Não'}</td>
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
          <Modal.Title>{editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>Código:</b>
              </Form.Label>
              <Form.Control
                type="text"
                value={editingCoupon ? editingCoupon.code : newCoupon.code}
                size="lg"
                onChange={(e) =>
                  editingCoupon
                    ? setEditingCoupon({ ...editingCoupon, code: e.target.value })
                    : setNewCoupon({ ...newCoupon, code: e.target.value })
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

            {editingCoupon && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="usedCoupon"
                  id="usedCoupon"
                  label="Cupom usado"
                  checked={editingCoupon.used}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, used: e.target.checked })}
                />
              </Form.Group>
            )}
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
          <p>Você tem certeza de que deseja excluir o cupom com código "{couponToDelete?.code}"?</p>
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
    </Container>
  );
};

export default AdminCoupon;
