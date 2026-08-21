import { useState, useEffect } from 'react';
import { Button, Form, Table, Badge, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/services/roles';
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

const emptyForm = { name: '', label: '' };

const AdminRolesManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData.sort((a, b) => a.name.localeCompare(b.name)) : []);
    } catch (error) {
      toast.error('Erro ao buscar papéis e permissões');
    } finally {
      setLoading(false);
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
      toast.error('O nome (identificador) do papel é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const permsPayload = permissions.filter((p) => selectedPerms.has(p.id));

    setLoading(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, { label: formData.label, permissions: permsPayload });
        toast.success('Papel atualizado com sucesso');
        registerLog(`Editou papel ${editingRole.name}`, loggedUsername);
      } else {
        await createRole({ name: formData.name, label: formData.label, system: false, permissions: permsPayload });
        toast.success('Papel criado com sucesso');
        registerLog(`Criou papel ${formData.name}`, loggedUsername);
      }
      setShowModal(false);
      setEditingRole(null);
      setFormData(emptyForm);
      setSelectedPerms(new Set());
      fetchAll();
    } catch (error) {
      toast.error('Erro ao salvar papel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRole(roleToDelete.id);
      toast.success('Papel excluído com sucesso');
      registerLog(`Excluiu papel ${roleToDelete.name}`, loggedUsername);
      setShowDeleteModal(false);
      fetchAll();
    } catch (error) {
      toast.error('Não foi possível excluir o papel (papéis de sistema não podem ser excluídos)');
    } finally {
      setLoading(false);
    }
  };

  const systemCount = roles.filter((r) => r.system).length;
  const customCount = roles.length - systemCount;
  const statItems = [
    { label: 'Total de papéis', value: roles.length },
    { label: 'Permissões', value: permissions.length, tone: 'info' },
    { label: 'De sistema', value: systemCount, tone: 'accent' },
    { label: 'Personalizados', value: customCount, tone: 'free' },
  ];
  const kindChips = [
    { value: 'all', label: 'Todos', count: roles.length },
    { value: 'system', label: 'Sistema', count: systemCount },
    { value: 'custom', label: 'Personalizados', count: customCount },
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
      name: 'Criar Novo Papel',
      onClick: () => handleCreateClick(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'feedback',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--roles">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Papéis e Permissões"
        subtitle="Crie papéis e defina o que cada um pode acessar"
        typeIcon="feedback"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="roles-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por papel ou identificador..." />
          <FilterChips options={kindChips} value={kindFilter} onChange={setKindFilter} />
        </div>

        <SectionHeader title="Papéis" count={filteredRoles.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Papel:</th>
                <th className="table-cells-header">Identificador:</th>
                <th className="table-cells-header">Permissões:</th>
                <th className="table-cells-header">Ações:</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <em>{role.label || role.name}</em>
                    {role.system && (
                      <Badge bg="secondary" className="ms-2">
                        Sistema
                      </Badge>
                    )}
                  </td>
                  <td>
                    <code>{role.name}</code>
                  </td>
                  <td>
                    <Badge bg={(role.permissions || []).length ? 'info' : 'secondary'} text="dark">
                      {(role.permissions || []).length} permissões
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-success" className="me-2" onClick={() => handleEditClick(role)}>
                      <Icons typeIcon="edit" iconSize={24} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(role)}
                      disabled={role.system}
                      title={role.system ? 'Papel de sistema não pode ser excluído' : ''}
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
          icon={editingRole ? 'edit' : 'plus'}
          iconFill={editingRole ? '' : '#057c05'}
          title={editingRole ? 'Editar Papel' : 'Criar Papel'}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button className="btn-confirm" variant="primary" type="submit" onClick={handleSubmit}>
                {editingRole ? 'Salvar Alterações' : 'Criar Papel'}
              </Button>
            </>
          }
        >
          <Form>
            <Form.Group controlId="formRoleName">
              <Form.Label>
                <b>Identificador:</b> <span className="text-secondary small">(ex.: financeiro)</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nome interno do papel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingRole}
                size="lg"
              />
            </Form.Group>

            <Form.Group controlId="formRoleLabel" className="mt-3">
              <Form.Label>
                <b>Nome exibido:</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex.: Equipe Financeira"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                size="lg"
              />
            </Form.Group>

            <hr />
            <h6 className="mt-3">
              <b>Permissões</b>
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
          title="Confirmar Exclusão"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" className="btn-cancel" onClick={handleDelete}>
                Excluir
              </Button>
            </>
          }
        >
          Tem certeza que deseja excluir o papel <strong>{roleToDelete?.label || roleToDelete?.name}</strong>?
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
