import { useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import {
  createWristband,
  updateWristband,
  deleteWristband,
} from '@/services/wristbands';
import { registerLog } from '@/services/logs';
import { useWristbandsList } from '@/hooks/useWristbandsList';
import scrollUp from '@/hooks/useScrollUp';
import { FOOD_NAME_OPTIONS } from '@/utils/constants';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';

const AdminWristbandsManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const { wristbands, isLoading: loadingWristbands, refetch: refetchWristbands } = useWristbandsList();
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

  const validateForm = () => {
    const { type, label, color } = formData;

    if (!type || !label || !color) {
      toast.error('Todos os campos são obrigatórios');
      return false;
    }

    if (type === 'FOOD') {
      const duplicatedFood = wristbands.find(
        (band) =>
          band.type === 'FOOD' && band.label === label && (!editingWristband || band.id !== editingWristband.id),
      );

      if (duplicatedFood) {
        toast.error(`Já existe uma pulseira de alimentação do tipo ${label}. Não é possível cadastrar outra igual.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingWristband) {
        await updateWristband(editingWristband.id, formData);
        toast.success('Pulseira editada com sucesso');
        registerLog(`Editou pulseira ${formData.label}`, loggedUsername);
      } else {
        await createWristband(formData);
        toast.success('Pulseira criada com sucesso');
        registerLog(`Criou pulseira ${formData.label}`, loggedUsername);
      }

      setFormData({ type: '', label: '', color: '#000000', active: true });
      setEditingWristband(null);
      setShowModal(false);
      refetchWristbands();
    } catch (error) {
      toast.error('Erro ao salvar pulseira');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteWristband(wristbandToDelete.id);
      toast.success('Pulseira removida com sucesso');
      registerLog(`Removeu pulseira ${wristbandToDelete.label}`, loggedUsername);
      refetchWristbands();
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

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-wristband',
      name: 'Criar Nova Pulseira',
      onClick: handleCreateClick,
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--wristbands">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Gerenciamento de Pulseiras"
        subtitle="Pulseiras de times e de alimentação"
        typeIcon="wristband"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <SectionHeader title="Pulseiras" count={wristbands.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Tipo:</th>
                <th className="table-cells-header">Nome:</th>
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
                    <div className="color-swatch" style={{ background: band.color }} />
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
        </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="confirm"
        icon={editingWristband ? 'edit' : 'plus'}
        iconFill={editingWristband ? '' : '#057c05'}
        title={editingWristband ? 'Editar Pulseira' : 'Criar Pulseira'}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button className="btn-confirm" variant="primary" onClick={handleSubmit}>
              {editingWristband ? 'Salvar alterações' : 'Criar Pulseira'}
            </Button>
          </>
        }
      >
        <Form>
            <Form.Group>
              <Form.Label>
                <b>Tipo:</b>
              </Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, label: '' })}
              >
                <option disabled value="">
                  Selecione uma opção
                </option>
                <option value="TEAM">Time</option>
                <option value="FOOD">Alimentação</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>Nome:</b>
              </Form.Label>

              {formData.type === 'FOOD' ? (
                <Form.Select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                >
                  <option value="" disabled>
                    Selecione uma opção
                  </option>
                  {FOOD_NAME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  placeholder="Digite o nome"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              )}
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>Cor:</b>
              </Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="color"
                  className="color-input"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
            <Button variant="danger" onClick={handleDelete}>
              Deletar
            </Button>
          </>
        }
      >
        Deseja remover a pulseira <strong>{wristbandToDelete?.label}</strong>?
      </CustomModal>

        <Loading loading={loading || loadingWristbands} />
      </div>
    </div>
  );
};

AdminWristbandsManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminWristbandsManagement;
