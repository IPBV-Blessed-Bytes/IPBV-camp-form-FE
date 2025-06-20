import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Tools from '@/components/Admin/Header/Tools';

const AdminUsersManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ userName: '', password: '', role: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  scrollUp();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetcher.get('users');
      const sortedUsers = response.data.sort((a, b) => a.userName.localeCompare(b.userName));
      setUsers(sortedUsers);
    } catch (error) {
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { userName, password, role } = formData;
    if (!userName || !password || !role) {
      toast.error('Todos os campos são obrigatórios');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const existingUser = users.find((user) => user.userName === formData.userName);
    if (existingUser && (!editingUser || editingUser.userName !== formData.userName)) {
      toast.error('Este nome de usuário já está em uso. Escolha outro nome');
      return;
    }

    setLoading(true);

    try {
      if (editingUser) {
        await fetcher.put(`users/${editingUser.id}`, formData);
        toast.success('Usuário editado com sucesso');
        registerLog(`Editou usuário ${editingUser.userName}`, loggedUsername);
      } else {
        const response = await fetcher.post('users', formData);

        if (response.status === 200) {
          toast.success('Usuário criado com sucesso');
          registerLog(`Criou usuário ${formData.userName}`, loggedUsername);
        } else {
          toast.error('Erro ao criar usuário');
        }
      }
      setFormData({ userName: '', password: '', role: '' });
      setEditingUser(null);
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      toast.error('Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher.delete(`users/${userToDelete.id}`);
      toast.success('Usuário deletado com sucesso');
      fetchUsers();
      registerLog(`Deletou usuário ${userToDelete.userName}`, loggedUsername);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({ userName: '', password: '', role: '' });
    setEditingUser(false);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setFormData({ userName: user.userName, password: user.password, role: user.role });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const translateRole = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'collaborator':
        return 'Colaborador';
      case 'collaborator-viewer':
        return 'Colaborador Visualizador';
      case 'checker':
        return 'Checker';
      case 'ride-manager':
        return 'Gerenciador Coringa';
      default:
        return role;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Usuários" sessionTypeIcon="add-person" iconSize={80} fill={'#204691'} />

      <Tools
        headerToolsClassname="table-tools__right-buttons-generic flex-sm-column flex-md-row  d-flex mb-3 gap-2"
        headerToolsTypeButton="primary"
        headerToolsOpenModal={() => handleCreateClick()}
        headerToolsButtonIcon="add-person"
        headerToolsButtonName="Criar Novo Usuário"
      />

      <Row>
        <Col>
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Usuário:</th>
                <th className="table-cells-header">Função:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <em>{user.userName}</em>
                  </td>
                  <td>{translateRole(user.role)}</td>
                  <td>
                    <Button
                      variant="outline-success"
                      className="me-2"
                      onClick={() => handleEditClick(user)}
                      disabled={user.userName === 'admin@ipbv'}
                    >
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(user)}
                      disabled={user.userName === 'admin@ipbv'}
                    >
                      <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{editingUser ? 'Editar Usuário' : 'Criar Usuário'}</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formLogin">
              <Form.Label>
                <b>Usuário:</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome de usuário"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                size="lg"
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mt-3">
              <Form.Label>
                {editingUser ? (
                  <b>
                    Nova Senha: <span className="text-danger">* (Irá substituir a senha anterior)</span>
                  </b>
                ) : (
                  <b>Senha:</b>
                )}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite a senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                size="lg"
              />
            </Form.Group>
            <Form.Group controlId="formRole" className="mt-3">
              <Form.Label>
                <b>Função:</b>
              </Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                size="lg"
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <option value="admin">Admin</option>
                <option value="collaborator">Colaborador</option>
                <option value="collaborator-viewer">Colaborador Visualizador</option>
                <option value="checker">Checker</option>
                <option value="ride-manager">Gerenciador Coringa</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={editingUser?.userName === 'admin@ipbv'}
          >
            {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o usuário <strong>{userToDelete?.userName}</strong>?
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

AdminUsersManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminUsersManagement;
