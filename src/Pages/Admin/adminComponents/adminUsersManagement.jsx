import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table, Modal } from 'react-bootstrap';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { toast } from 'react-toastify';
import Icons from '@/components/Icons';
import Loading from '@/components/Loading';
import { useNavigate } from 'react-router-dom';
import { registerLog } from '@/fetchers/userLogs';

const AdminUsersManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ login: '', password: '', role: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetcher.get('users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { login, password, role } = formData;
    if (!login || !password || !role) {
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

    const existingUser = users.find((user) => user.login === formData.login);
    if (existingUser && (!editingUser || editingUser.login !== formData.login)) {
      toast.error('Este login já está em uso. Escolha outro login');
      return;
    }

    setLoading(true);

    try {
      if (editingUser) {
        await fetcher.put(`users/${editingUser.id}`, formData);
        toast.success('Usuário editado com sucesso');
        registerLog(`Editou usuário ${editingUser.login}`, loggedUsername);
      } else {
        await fetcher.post('users', formData);
        toast.success('Usuário criado com sucesso');
        registerLog(`Criou usuário ${formData.login}`, loggedUsername);
      }
      setFormData({ login: '', password: '', role: '' });
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
      registerLog(`Deletou usuário ${userToDelete.login}`, loggedUsername);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({ login: '', password: '', role: '' });
    setEditingUser(false);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setFormData({ login: user.login, password: user.password, role: user.role });
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
      default:
        return role;
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
          <h4 className="fw-bold m-0">Gerenciamento de Usuários</h4>
          <Icons className="m-left" typeIcon="add-person" iconSize={80} fill={'#204691'} />
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="table-tools--rides-buttons-wrapper">
        <Col lg={12} md={12} xs={12}>
          <div className="table-tools__right-buttons-generic flex-sm-column flex-md-row  d-flex mb-3 gap-2">
            <Button
              variant="primary"
              onClick={() => handleCreateClick()}
              className="d-flex align-items-center"
              size="lg"
            >
              <Icons typeIcon="add-person" iconSize={30} fill="#fff" />
              <span className="table-tools__button-name">&nbsp;Criar Novo Usuário</span>
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Login:</th>
                <th className="table-cells-header">Senha:</th>
                <th className="table-cells-header">Função:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.login}</td>
                  <td>{user.password}</td>
                  <td>{translateRole(user.role)}</td>
                  <td>
                    <Button
                      variant="outline-success"
                      className="me-2"
                      onClick={() => handleEditClick(user)}
                      disabled={user.login === 'admin@ipbv'}
                    >
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(user)}
                      disabled={user.login === 'admin@ipbv'}
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
                <b>Login:</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mt-3">
              <Form.Label>
                <b>Senha:</b>
              </Form.Label>
              <Form.Control
                className="user-management-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Icons
                className="user-management-password-icon"
                typeIcon={showPassword ? 'visible-password' : 'hidden-password'}
                onClick={handleShowPassword}
              />
            </Form.Group>
            <Form.Group controlId="formRole" className="mt-3">
              <Form.Label>
                <b>Função:</b>
              </Form.Label>
              <Form.Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <option value="admin">Admin</option>
                <option value="collaborator">Colaborador</option>
                <option value="collaborator-viewer">Colaborador Visualizador</option>
                <option value="checker">Checker</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" onClick={handleSubmit} disabled={editingUser?.login === 'admin@ipbv'}>
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
          Tem certeza que deseja excluir o usuário <strong>{userToDelete?.login}</strong>?
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

export default AdminUsersManagement;
