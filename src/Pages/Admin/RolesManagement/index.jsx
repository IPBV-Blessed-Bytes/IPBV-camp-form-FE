import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/services/roles';
import scrollUp from '@/hooks/useScrollUp';
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

const emptyForm = { name: '', label: '' };

const AdminRolesManagement = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedPerms, setSelectedPerms] = useState(new Set());
  const [editingRole, setEditingRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');

  scrollUp();

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData.sort((a, b) => a.name.localeCompare(b.name)) : []);
    } catch (error) {
      toast.error(t('admin.roles.fetchError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const togglePerm = (id) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setSelectedPerms(new Set());
    setEditingRole(null);
    setShowModal(true);
  };

  const handleEditClick = (role) => {
    setFormData({ name: role.name, label: role.label || '' });
    setSelectedPerms(new Set((role.permissions || []).map((p) => p.id)));
    setEditingRole(role);
    setShowModal(true);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    if (!editingRole && !formData.name) {
      toast.error(t('admin.roles.nameRequired'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const permsPayload = permissions.filter((p) => selectedPerms.has(p.id));

    setSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, { label: formData.label, permissions: permsPayload });
        toast.success(t('admin.roles.updateSuccess'));
        registerLog(`Editou papel ${editingRole.name}`, loggedUsername);
      } else {
        await createRole({ name: formData.name, label: formData.label, system: false, permissions: permsPayload });
        toast.success(t('admin.roles.createSuccess'));
        registerLog(`Criou papel ${formData.name}`, loggedUsername);
      }
      setShowModal(false);
      setEditingRole(null);
      setFormData(emptyForm);
      setSelectedPerms(new Set());
      await fetchAll(true);
    } catch (error) {
      toast.error(t('admin.roles.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteRole(roleToDelete.id);
      toast.success(t('admin.roles.deleteSuccess'));
      registerLog(`Excluiu papel ${roleToDelete.name}`, loggedUsername);
      setShowDeleteModal(false);
      await fetchAll(true);
    } catch (error) {
      toast.error(t('admin.roles.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const systemCount = roles.filter((r) => r.system).length;
  const customCount = roles.length - systemCount;
  const statItems = [
    { label: t('admin.roles.statTotal'), value: roles.length },
    { label: t('admin.roles.statPermissions'), value: permissions.length, tone: 'info' },
    { label: t('admin.roles.statSystem'), value: systemCount, tone: 'accent' },
    { label: t('admin.roles.statCustom'), value: customCount, tone: 'free' },
  ];
  const kindChips = [
    { value: 'all', label: t('admin.roles.chipAll'), count: roles.length },
    { value: 'system', label: t('admin.roles.chipSystem'), count: systemCount },
    { value: 'custom', label: t('admin.roles.chipCustom'), count: customCount },
  ];
  const term = search.trim().toLowerCase();
  const filteredRoles = roles.filter(
    (r) =>
      (kindFilter === 'all' || (kindFilter === 'system' ? r.system : !r.system)) &&
      (!term ||
        (r.label || '').toLowerCase().includes(term) ||
        (r.name || '').toLowerCase().includes(term)),
  );

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-role',
      name: t('admin.roles.createBtn'),
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'feedback',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--roles">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.roles.title')}
        subtitle={t('admin.roles.subtitle')}
        typeIcon="feedback"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="roles-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.roles.searchPlaceholder')} />
          <FilterChips options={kindChips} value={kindFilter} onChange={setKindFilter} />
        </div>

        <SectionHeader title={t('admin.roles.sectionTitle')} count={filteredRoles.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.roles.colRole')}</th>
                <th className="table-cells-header">{t('admin.roles.colIdentifier')}</th>
                <th className="table-cells-header">{t('admin.roles.colPermissions')}</th>
                <th className="table-cells-header">{t('admin.roles.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-start text-secondary p-4">
                    {t('admin.roles.noRoles')}
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <em>{role.label || role.name}</em>
                    {role.system && (
                      <Badge bg="secondary" className="ms-2">
                        {t('admin.roles.systemBadge')}
                      </Badge>
                    )}
                  </td>
                  <td>
                    <code>{role.name}</code>
                  </td>
                  <td>
                    <Badge bg={(role.permissions || []).length ? 'info' : 'secondary'} text="dark">
                      {t('admin.roles.permissionsCount', { count: (role.permissions || []).length })}
                    </Badge>
                  </td>
                  <td>
                    <div className="table-action-cell">
                      <ActionButton action="edit" label={t('admin.roles.editRole')} onClick={() => handleEditClick(role)} />
                      <ActionButton
                        action="delete"
                        label={t('admin.roles.deleteRole')}
                        onClick={() => handleDeleteClick(role)}
                        disabled={role.system}
                        title={role.system ? t('admin.roles.systemCannotDelete') : ''}
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
          icon={editingRole ? 'edit' : 'plus'}
          iconFill={editingRole ? '' : '#057c05'}
          title={editingRole ? t('admin.roles.modalEditTitle') : t('admin.roles.modalCreateTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('admin.roles.cancel')}
              </Button>
              <SpinnerButton className="btn-confirm" variant="primary" type="submit" onClick={handleSubmit} loading={saving}>
                {editingRole ? t('admin.roles.saveChanges') : t('admin.roles.modalCreateTitle')}
              </SpinnerButton>
            </>
          }
        >
          <Form>
            <Form.Group controlId="formRoleName">
              <Form.Label>
                <b>{t('admin.roles.identifierLabel')}</b> <span className="text-secondary small">{t('admin.roles.identifierHint')}</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('admin.roles.identifierPlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingRole}
                size="lg"
              />
            </Form.Group>

            <Form.Group controlId="formRoleLabel" className="mt-3">
              <Form.Label>
                <b>{t('admin.roles.displayNameLabel')}</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('admin.roles.displayNamePlaceholder')}
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                size="lg"
              />
            </Form.Group>

            <hr />
            <h6 className="mt-3">
              <b>{t('admin.roles.permissionsHeading')}</b>
            </h6>
            <Row>
              {permissions.map((perm) => (
                <Col xs={12} md={6} key={perm.id}>
                  <Form.Check
                    type="checkbox"
                    id={`perm-${perm.id}`}
                    checked={selectedPerms.has(perm.id)}
                    onChange={() => togglePerm(perm.id)}
                    label={
                      <span>
                        {perm.label || perm.name} <code className="small text-secondary">{perm.name}</code>
                      </span>
                    }
                  />
                </Col>
              ))}
            </Row>
          </Form>
        </CustomModal>

        <CustomModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          variant="cancel"
          title={t('admin.roles.confirmDeleteTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('admin.roles.cancel')}
              </Button>
              <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDelete} loading={saving}>
                {t('admin.roles.deleteBtn')}
              </SpinnerButton>
            </>
          }
        >
          <Trans
            i18nKey="admin.roles.deleteConfirmText"
            components={{ strong: <strong /> }}
            values={{ name: roleToDelete?.label || roleToDelete?.name }}
          />
        </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminRolesManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminRolesManagement;
