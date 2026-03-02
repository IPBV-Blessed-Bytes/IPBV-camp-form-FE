import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
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

const AdminHomepaAdminHomeInfoManagementgeInfoManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [homepageInfo, setHomepageInfo] = useState(null);

  const [formData, setFormData] = useState({
    top: {
      title: '',
      subtitle: '',
      locationAndDate: '',
      place: '',
      speaker: '',
      registrationsDeadline: '',
    },
    bottom: [],
  });

  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  scrollUp();

  const fetchHomepageInfo = async () => {
    setLoading(true);
    try {
      const response = await fetcher.get('/homepage-info');
      if (response?.data) {
        setHomepageInfo(response.data);
        setFormData(response.data);
        setEditing(true);
      }
    } catch (error) {
      console.error('[AdminHomepaAdminHomeInfoManagementgeInfoManagement] erro ao buscar homepage-info', error);
      toast.error('Erro ao buscar informações da home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageInfo();
  }, []);

  const handleTopChange = (field, value) => {
    setFormData({
      ...formData,
      top: {
        ...formData.top,
        [field]: value,
      },
    });
  };

  const handleBottomChange = (index, field, value) => {
    const updatedBottom = [...formData.bottom];
    updatedBottom[index] = {
      ...updatedBottom[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      bottom: updatedBottom,
    });
  };

  const handleAddBottomItem = () => {
    setFormData({
      ...formData,
      bottom: [...formData.bottom, { icon: '', title: '', description: '' }],
    });
  };

  const handleRemoveBottomItem = (index) => {
    const updatedBottom = formData.bottom.filter((_, i) => i !== index);
    setFormData({ ...formData, bottom: updatedBottom });
  };

  const validateForm = () => {
    const { top } = formData;

    if (!top.title || !top.subtitle || !top.place) {
      toast.error('Preencha os campos obrigatórios do topo');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editing) {
        await fetcher.put('/homepage-info', formData);
        toast.success('Homepage atualizada com sucesso');
        registerLog('Editou informações da homepage', loggedUsername);
      } else {
        await fetcher.post('/homepage-info', formData);
        toast.success('Homepage criada com sucesso');
        registerLog('Criou informações da homepage', loggedUsername);
      }

      setShowModal(false);
      fetchHomepageInfo();
    } catch (error) {
      toast.error('Erro ao salvar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      await fetcher.delete('/homepage-info');
      toast.success('Informações da homepage removidas');
      registerLog('Removeu informações da homepage', loggedUsername);

      setHomepageInfo(null);
      setFormData({
        top: {
          title: '',
          subtitle: '',
          locationAndDate: '',
          place: '',
          speaker: '',
          registrationsDeadline: '',
        },
        bottom: [],
      });

      setEditing(false);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Erro ao remover informações');
    } finally {
      setLoading(false);
    }
  };

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center',
      cols: { xs: 12, md: 6 },
      fill: '#007185',
      iconSize: 40,
      id: 'edit-homepage',
      name: homepageInfo ? 'Editar Informações da Home' : 'Criar Informações da Home',
      onClick: () => setShowModal(true),
      typeButton: 'outline-teal-blue',
      typeIcon: homepageInfo ? 'edit' : 'plus',
    },
    // ...(homepageInfo
    //   ? [
    //       {
    //         buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center',
    //         cols: { xs: 12, md: 6 },
    //         fill: '#DC3545',
    //         iconSize: 40,
    //         id: 'delete-homepage',
    //         name: 'Remover Informações',
    //         onClick: () => setShowDeleteModal(true),
    //         typeButton: 'outline-danger',
    //         typeIcon: 'delete',
    //       },
    //     ]
    //   : []),
  ];

  return (
    <Container fluid>
      <AdminHeader
        pageName="Gerenciamento da Info Home"
        sessionTypeIcon="simple-info"
        iconSize={60}
        fill="#007185"
      />

      <Tools buttons={toolsButtons} />

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="custom-modal">
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon={editing ? 'edit' : 'plus'} iconSize={25} />
            <b>{editing ? 'Editar Homepage' : 'Criar Homepage'}</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <h5>Topo da Página</h5>

            {Object.keys(formData.top).map((field) => (
              <Form.Group key={field} className="mt-3">
                <Form.Label>
                  <b>{field}</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.top[field]}
                  onChange={(e) => handleTopChange(field, e.target.value)}
                />
              </Form.Group>
            ))}

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center">
              <h5>Seção Inferior</h5>
              <Button variant="outline-primary" onClick={handleAddBottomItem}>
                <Icons typeIcon="plus" iconSize={18} /> Adicionar Item
              </Button>
            </div>

            {formData.bottom.map((item, index) => (
              <div key={index} className="border rounded p-3 mt-3">
                <Row>
                  <Col md={3}>
                    <Form.Control
                      type="text"
                      placeholder="Ícone"
                      value={item.icon}
                      onChange={(e) => handleBottomChange(index, 'icon', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="text"
                      placeholder="Título"
                      value={item.title}
                      onChange={(e) => handleBottomChange(index, 'title', e.target.value)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Descrição"
                      value={item.description}
                      onChange={(e) => handleBottomChange(index, 'description', e.target.value)}
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-center">
                    <Button variant="outline-danger" onClick={() => handleRemoveBottomItem(index)}>
                      <Icons typeIcon="delete" iconSize={20} fill="#DC3545" />
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button className="btn-confirm" variant="primary" onClick={handleSubmit}>
            {editing ? 'Salvar Alterações' : 'Criar Homepage'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} className="custom-modal">
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill="#DC3545" />
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Deseja remover todas as informações da homepage?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteAll}>
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

AdminHomepaAdminHomeInfoManagementgeInfoManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminHomepaAdminHomeInfoManagementgeInfoManagement;