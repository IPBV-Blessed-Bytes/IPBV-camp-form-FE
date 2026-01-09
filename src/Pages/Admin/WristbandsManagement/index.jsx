import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Tools from '@/components/Admin/Header/Tools';

const AdminWristbandsManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [wristbands, setWristbands] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    label: '',
    color: '#000000',
    active: true,
  });
  const [editingWristband, setEditingWristband] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wristbandToDelete, setWristbandToDelete] = useState(null);

  scrollUp();

  const fetchWristbands = async () => {
    setLoading(true);
    try {
      const response = await fetcher.get('/user-wristbands');

      setWristbands(response?.data || []);
    } catch (error) {
      console.error('[AdminWristbandsManagement] erro ao buscar pulseiras', error);
      toast.error('Erro ao buscar pulseiras');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { type, label, color } = formData;
    if (!type || !label || !color) {
      toast.error('Todos os campos são obrigatórios');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingWristband) {
        await fetcher.patch(`/user-wristbands/${editingWristband.id}`, formData);
        toast.success('Pulseira editada com sucesso');
        registerLog(`Editou pulseira ${formData.label}`, loggedUsername);
      } else {
        await fetcher.post('/user-wristbands', formData);
        toast.success('Pulseira criada com sucesso');
        registerLog(`Criou pulseira ${formData.label}`, loggedUsername);
      }

      setFormData({ type: '', label: '', color: '#000000', active: true });
      setEditingWristband(null);
      setShowModal(false);
      fetchWristbands();
    } catch (error) {
      toast.error('Erro ao salvar pulseira');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher.delete(`/user-wristbands/${wristbandToDelete.id}`);
      toast.success('Pulseira removida com sucesso');
      registerLog(`Removeu pulseira ${wristbandToDelete.label}`, loggedUsername);
      fetchWristbands();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Erro ao remover pulseira');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({ type: '', label: '', color: '#000000', active: true });
    setEditingWristband(null);
    setShowModal(true);
  };

  const handleEditClick = (wristband) => {
    setFormData(wristband);
    setEditingWristband(wristband);
    setShowModal(true);
  };

  const handleDeleteClick = (wristband) => {
    setWristbandToDelete(wristband);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    fetchWristbands();
  }, []);

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center',
      cols: { xs: 12, md: 6 },
      fill: '#007185',
      iconSize: 40,
      id: 'add-wristband',
      name: 'Criar Nova Pulseira',
      onClick: handleCreateClick,
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Pulseiras" sessionTypeIcon="wristband" iconSize={80} fill="#007185" />

      <Tools buttons={toolsButtons} />

      <Row>
        <Col>
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Tipo:</th>
                <th className="table-cells-header">Descrição:</th>
                <th className="table-cells-header">Cor:</th>
                <th className="table-cells-header">Status:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {wristbands.map((band) => (
                <tr key={band.id}>
                  <td>{band.type === 'FOOD' ? 'Alimentação' : 'Time'}</td>
                  <td>{band.label}</td>
                  <td>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        background: band.color,
                        borderRadius: 4,
                      }}
                    />
                  </td>
                  <td>{band.active ? 'Ativa' : 'Inativa'}</td>
                  <td>
                    <Button variant="outline-success" className="me-2" onClick={() => handleEditClick(band)}>
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>
                    <Button variant="outline-danger" onClick={() => handleDeleteClick(band)}>
                      <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} className="custom-modal">
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons
              typeIcon={editingWristband ? 'edit' : 'plus'}
              iconSize={25}
              fill={editingWristband ? '' : '#057c05'}
            />
            <b>{editingWristband ? 'Editar Pulseira' : 'Criar Pulseira'}</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>
                <b>Tipo:</b>
              </Form.Label>
              <Form.Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option selected disabled value="">
                  Selecione uma opção
                </option>
                <option value="FOOD">Alimentação</option>
                <option value="TEAM">Time</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>Descrição:</b>
              </Form.Label>
              <Form.Control
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>Cor:</b>
              </Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: 60, height: 40, padding: 0 }}
                />

                <Form.Control
                  type="text"
                  placeholder="#000000"
                  value={formData.color}
                  maxLength={7}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Check
                checked={formData.active}
                className="d-flex justify-content-end gap-2"
                label="Pulseira ativa"
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                type="switch"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button className="btn-confirm" variant="primary" onClick={handleSubmit}>
            {editingWristband ? 'Salvar alterações' : 'Criar Pulseira'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deseja remover a pulseira <strong>{wristbandToDelete?.label}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

AdminWristbandsManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminWristbandsManagement;
