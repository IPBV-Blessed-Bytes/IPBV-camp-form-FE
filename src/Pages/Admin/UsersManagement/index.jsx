import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { listUsers, createUser, updateUser, deleteUser } from '@/services/users';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getRoles } from '@/services/roles';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await listUsers();
      const sortedUsers = [...data].sort((a, b) => {
        const adminA = a.role === 'admin' ? 0 : 1;
        const adminB = b.role === 'admin' ? 0 : 1;
        if (adminA !== adminB) return adminA - adminB;
        return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
      });
      setUsers(sortedUsers);
    } catch (error) {
      toast.error(t('admin.users.fetchError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const validateForm = () => {
    const { password, role, email } = formData;
    if (!role || !email || (!editingUser && !password)) {
      toast.error(
        editingUser ? t('admin.users.validateEditRequired') : t('admin.users.validateCreateRequired'),
      );
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('admin.users.invalidEmail'));
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
      const existingUser = users.find((user) => (user.email || '').toLowerCase() === formData.email.toLowerCase());
      if (existingUser) {
        toast.error(t('admin.users.emailInUse'));
        return;
      }
    }

    setSaving(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        toast.success(t('admin.users.editSuccess'));
        registerLog(`Editou usuário ${editingUser.displayName || editingUser.email}`, loggedUsername);
      } else {
        await createUser(formData);
        toast.success(t('admin.users.createSuccess'));
        registerLog(`Criou usuário ${formData.displayName || formData.email}`, loggedUsername);
      }
      setFormData({ displayName: '', password: '', role: '', email: '' });
      setEditingUser(null);
      setShowModal(false);
      await fetchUsers(true);
    } catch (error) {
      toast.error(t('admin.users.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteUser(userToDelete.id);
      toast.success(t('admin.users.deleteSuccess'));
      fetchUsers();
      registerLog(`Deletou usuário ${userToDelete.displayName || userToDelete.email}`, loggedUsername);
      setShowDeleteModal(false);
      await fetchUsers(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.users.deleteError'));
    } finally {
      setSaving(false);
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
    { label: t('admin.users.statTotal'), value: users.length },
    ...rolesPresent.map((r) => ({ label: translateRole(r), value: byRole[r], tone: r === 'admin' ? 'danger' : 'default' })),
  ];
  const roleChips = [
    { value: 'all', label: t('admin.users.chipAll'), count: users.length },
    ...rolesPresent.map((r) => ({ value: r, label: translateRole(r), count: byRole[r] })),
  ];
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const isLastAdmin = (user) => user.role === 'admin' && adminCount <= 1;

  const term = search.trim().toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      (roleFilter === 'all' || u.role === roleFilter) &&
      (!term || (u.displayName || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term)),
  );

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-user',
      name: t('admin.users.createBtn'),
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'add-person',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--users">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.users.title')}
        subtitle={t('admin.users.subtitle')}
        typeIcon="add-person"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="users-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.users.searchPlaceholder')} />
          <FilterChips options={roleChips} value={roleFilter} onChange={setRoleFilter} />
        </div>

        <SectionHeader title={t('admin.users.sectionTitle')} count={filteredUsers.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.users.colName')}</th>
                <th className="table-cells-header">{t('admin.users.colEmail')}</th>
                <th className="table-cells-header">{t('admin.users.colRole')}</th>
                <th className="table-cells-header">{t('admin.users.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-start text-secondary p-4">
                    {t('admin.users.noUsers')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
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
                    <div className="table-action-cell">
                      <ActionButton
                        action="edit"
                        label={t('admin.users.editUser')}
                        onClick={() => handleEditClick(user)}
                      />
                      <ActionButton
                        action="delete"
                        label={isLastAdmin(user) ? t('admin.users.cannotDeleteLastAdmin') : t('admin.users.deleteUser')}
                        onClick={() => handleDeleteClick(user)}
                        disabled={isLastAdmin(user)}
                      />
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </Table>
        </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="confirm"
        icon={editingUser ? 'edit' : 'plus'}
        iconFill={editingUser ? '' : '#057c05'}
        title={editingUser ? t('admin.users.modalEditTitle') : t('admin.users.modalCreateTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('admin.users.cancel')}
            </Button>
            <SpinnerButton
              className="btn-confirm"
              variant="primary"
              type="submit"
              onClick={handleSubmit}
              loading={saving}
            >
              {editingUser ? t('admin.users.saveChanges') : t('admin.users.modalCreateTitle')}
            </SpinnerButton>
          </>
        }
      >
        <Form>
            <Form.Group controlId="formDisplayName">
              <Form.Label>
                <b>{t('admin.users.displayNameLabel')}</b>{' '}
                <span className="text-secondary small">{t('admin.users.displayNameHint')}</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('admin.users.displayNamePlaceholder')}
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                size="lg"
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>
                <b>{t('admin.users.emailLabel')}</b>{' '}
                <span className="text-secondary small">
                  {editingUser ? t('admin.users.emailHintEdit') : t('admin.users.emailHintCreate')}
                </span>
              </Form.Label>
              <Form.Control
                type="email"
                placeholder={t('admin.users.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                size="lg"
                readOnly={!!editingUser}
                disabled={!!editingUser}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mt-3">
              <Form.Label>
                {editingUser ? (
                  <b>
                    {t('admin.users.newPasswordLabel')}{' '}
                    <span className="text-danger">{t('admin.users.newPasswordHint')}</span>
                  </b>
                ) : (
                  <b>{t('admin.users.passwordLabel')}</b>
                )}
              </Form.Label>
              <div className="password-wrapper">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder={editingUser ? t('admin.users.passwordPlaceholderEdit') : t('admin.users.passwordPlaceholderCreate')}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  size="lg"
                  className="password-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('admin.users.hidePassword') : t('admin.users.showPassword')}
                >
                  <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={22} />
                </button>
              </div>
            </Form.Group>
            <Form.Group controlId="formRole" className="mt-3">
              <Form.Label>
                <b>{t('admin.users.roleLabel')}</b>
              </Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                size="lg"
              >
                <option value="" disabled>
                  {t('admin.users.selectOption')}
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
        title={t('admin.users.confirmDeleteTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('admin.users.cancel')}
            </Button>
            <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDelete} loading={saving}>
              {t('admin.logs.delete')}
            </SpinnerButton>
          </>
        }
      >
        <Trans
          i18nKey="admin.users.deleteConfirmText"
          components={{ strong: <strong /> }}
          values={{ name: userToDelete?.displayName || userToDelete?.email }}
        />
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
