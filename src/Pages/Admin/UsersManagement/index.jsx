import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { listUsers, createUser, updateUser, deleteUser } from '@/services/users';
import { getRoles } from '@/services/roles';
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

const ROLE_BADGE = {
  admin: 'danger',
  checker: 'info',
  collaborator: 'primary',
  'collaborator-viewer': 'secondary',
  'ride-manager': 'warning',
  'team-creator': 'success',
  guest: 'light',
};

const initialsOf = (name = '') =>
  name
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

const AdminUsersManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ displayName: '', password: '', role: '', email: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);

  scrollUp();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      const sortedUsers = [...data].sort((a, b) =>
        (a.displayName || a.email || '').localeCompare(b.displayName || b.email || ''),
      );
      setUsers(sortedUsers);
    } catch (error) {
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { password, role, email } = formData;
    if (!role || !email || (!editingUser && !password)) {
      toast.error(
        editingUser ? 'Preencha papel e e-mail' : 'E-mail, senha e papel são obrigatórios',
      );
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Informe um e-mail válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!editingUser) {
      const existingUser = users.find((user) => user.email === formData.email);
      if (existingUser) {
        toast.error('Este e-mail já está cadastrado. Use outro e-mail');
        return;
      }
    }

    setLoading(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        toast.success('Usuário editado com sucesso');
        registerLog(`Editou usuário ${editingUser.displayName || editingUser.email}`, loggedUsername);
      } else {
        await createUser(formData);
        toast.success('Usuário criado com sucesso');
        registerLog(`Criou usuário ${formData.displayName || formData.email}`, loggedUsername);
      }
      setFormData({ displayName: '', password: '', role: '', email: '' });
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
      await deleteUser(userToDelete.id);
      toast.success('Usuário deletado com sucesso');
      fetchUsers();
      registerLog(`Deletou usuário ${userToDelete.displayName || userToDelete.email}`, loggedUsername);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({ displayName: '', password: '', role: '', email: '' });
    setEditingUser(false);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setFormData({ displayName: user.displayName || '', password: '', role: user.role, email: user.email || '' });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const translateRole = (role) => roles.find((r) => r.name === role)?.label || role;

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const byRole = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const rolesPresent = [...new Set(users.map((u) => u.role))];
  const statItems = [
    { label: 'Total de usuários', value: users.length },
    ...rolesPresent.map((r) => ({ label: translateRole(r), value: byRole[r], tone: r === 'admin' ? 'danger' : 'default' })),
  ];
  const roleChips = [
    { value: 'all', label: 'Todos', count: users.length },
    ...rolesPresent.map((r) => ({ value: r, label: translateRole(r), count: byRole[r] })),
  ];
  const term = search.trim().toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      (roleFilter === 'all' || u.role === roleFilter) &&
      (!term ||
        (u.displayName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term)),
  );

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-user',
      name: 'Criar Novo Usuário',
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'add-person',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--users">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Usuários"
        subtitle="Contas de acesso ao painel e suas permissões"
        typeIcon="add-person"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="users-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome ou e-mail..." />
          <FilterChips options={roleChips} value={roleFilter} onChange={setRoleFilter} />
        </div>

        <SectionHeader title="Usuários" count={filteredUsers.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Nome:</th>
                <th className="table-cells-header">E-mail:</th>
                <th className="table-cells-header">Função:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-cell__avatar">{initialsOf(user.displayName || user.email)}</span>
                      <em>{user.displayName || user.email}</em>
                    </div>
                  </td>
                  <td>{user.email || <span className="text-secondary small">—</span>}</td>
                  <td>
                    <Badge
                      bg={ROLE_BADGE[user.role] || 'secondary'}
                      text={ROLE_BADGE[user.role] === 'light' ? 'dark' : undefined}
                    >
                      {translateRole(user.role)}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-success"
                      className="me-2"
                      onClick={() => handleEditClick(user)}
                      disabled={user.email === 'admin@ipbv'}
                    >
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(user)}
                      disabled={user.email === 'admin@ipbv'}
                    >
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
        variant="confirm"
        icon={editingUser ? 'edit' : 'plus'}
        iconFill={editingUser ? '' : '#057c05'}
        title={editingUser ? 'Editar Usuário' : 'Criar Usuário'}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              className="btn-confirm"
              variant="primary"
              type="submit"
              onClick={handleSubmit}
              disabled={editingUser?.email === 'admin@ipbv'}
            >
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </>
        }
      >
        <Form>
            <Form.Group controlId="formDisplayName">
              <Form.Label>
                <b>Nome de exibição:</b>{' '}
                <span className="text-secondary small">(opcional — em branco usa o e-mail)</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex.: Alvinho Leal"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                size="lg"
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>
                <b>E-mail:</b>{' '}
                <span className="text-secondary small">
                  {editingUser ? '(identidade de acesso — não editável)' : '(será o login de acesso)'}
                </span>
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                size="lg"
                disabled={!!editingUser}
                readOnly={!!editingUser}
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
              <div className="password-wrapper">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : 'Digite a senha'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  size="lg"
                  className="password-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={22} />
                </button>
              </div>
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
                {roles.map((role) => (
                  <option key={role.id || role.name} value={role.name}>
                    {role.label || role.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
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
              Deletar
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir o usuário{' '}
        <strong>{userToDelete?.displayName || userToDelete?.email}</strong>?
      </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminUsersManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminUsersManagement;
