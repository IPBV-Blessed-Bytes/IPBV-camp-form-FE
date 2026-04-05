import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Modal, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomEditor from '@/components/Global/CustomEditor';
import { iconsOptions } from '@/utils/constants';
import AdminHeader from '@/components/Admin/Header/AdminHeader';

const AdminHomeInfoManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showNewBottomForm, setShowNewBottomForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);

  const [newBottomItem, setNewBottomItem] = useState({
    id: 0,
    icon: '',
    title: '',
    description: '',
  });

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

  scrollUp();

  const fetchHomepageInfo = async () => {
    try {
      setLoading(true);
      const response = await fetcher.get('/homepage-info');

      if (response?.data) {
        setFormData({
          ...response.data,
          bottom:
            response.data.bottom?.map((item) => ({
              id: item.id ?? 0,
              icon: item.icon,
              title: item.title,
              description: item.description,
            })) || [],
        });
        setEditing(true);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao buscar informações da home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageInfo();
  }, []);

  const handleTopChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      top: {
        ...prev.top,
        [field]: value,
      },
    }));
  };

  const handleBottomChange = (index, field, value) => {
    const updatedBottom = [...formData.bottom];
    updatedBottom[index] = {
      ...updatedBottom[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      bottom: updatedBottom,
    }));
  };

  const handleCreateBottomItem = async () => {
    if (!newBottomItem.icon || !newBottomItem.title) {
      toast.error('Preencha pelo menos ícone e título');
      return;
    }

    const newItem = {
      ...newBottomItem,
      id: Date.now(),
    };

    try {
      setLoadingContent(true);

      const payload = {
        bottom: [newItem],
      };

      await fetcher.post('/homepage-info', payload);

      toast.success('Item adicionado com sucesso');
      registerLog('Adicionou item bottom', loggedUsername);

      setNewBottomItem({
        id: 0,
        icon: '',
        title: '',
        description: '',
      });

      setShowNewBottomForm(false);

      fetchHomepageInfo();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar item');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleRemoveBottomItem = async (index) => {
    const itemToRemove = formData.bottom[index];

    if (!itemToRemove.id) {
      const updatedBottom = formData.bottom.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, bottom: updatedBottom }));
      return;
    }

    try {
      setLoadingContent(true);

      const payload = {
        top: formData.top,
        bottom: [{ id: itemToRemove.id }],
      };

      await fetcher.delete('/homepage-info/on-demand', {
        data: payload,
      });

      toast.success('Item removido com sucesso');
      registerLog('Removeu item bottom', loggedUsername);

      const updatedBottom = formData.bottom.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, bottom: updatedBottom }));
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover item');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleUpdateBottomItem = async (index) => {
    const itemToUpdate = formData.bottom[index];

    try {
      setLoadingContent(true);
      const payload = {
        top: formData.top,
        bottom: [
          {
            id: itemToUpdate.id,
            icon: itemToUpdate.icon,
            title: itemToUpdate.title,
            description: itemToUpdate.description,
          },
        ],
      };
      await fetcher.put('/homepage-info', payload);

      toast.success('Item atualizado com sucesso');
      registerLog('Editou item bottom', loggedUsername);

      fetchHomepageInfo();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar item');
    } finally {
      setLoadingContent(false);
    }
  };

  const confirmRemoveBottomItem = (index) => {
    setItemToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteItem = async () => {
    if (itemToDeleteIndex === null) return;

    await handleRemoveBottomItem(itemToDeleteIndex);

    setItemToDeleteIndex(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteAll = async () => {
    await handleDeleteAll();
    setShowDeleteAllModal(false);
  };

  const handleSubmit = async () => {
    try {
      setLoadingContent(true);

      if (editing) {
        const payload = {
          top: formData.top,
          bottom: formData.bottom.map((item) => ({
            id: item.id ?? 0,
            icon: item.icon,
            title: item.title,
            description: item.description,
          })),
        };
        await fetcher.put('/homepage-info', payload);
        toast.success('Homepage atualizada com sucesso');
        registerLog('Editou informações da homepage', loggedUsername);
      } else {
        await fetcher.post('/homepage-info', formData);
        toast.success('Homepage criada com sucesso');
        registerLog('Criou informações da homepage', loggedUsername);
      }

      fetchHomepageInfo();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar informações');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setLoadingContent(true);

      await fetcher.delete('/homepage-info');
      toast.success('Informações removidas com sucesso');
      registerLog('Removeu informações da homepage', loggedUsername);

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
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover informações');
    } finally {
      setLoadingContent(false);
    }
  };

  const topFieldsConfig = {
    title: {
      label: 'Título:',
      placeholder: 'Ex: Acampamento no Período de Carnaval 2000',
    },
    subtitle: {
      label: 'Subtítulo:',
      placeholder: 'Ex: Unidos pela palavra da Verdade',
    },
    locationAndDate: {
      label: 'Local e Data:',
      placeholder: 'Ex: IP de Boa Viagem • 01 a 04 de fevereiro • Garanhuns',
    },
    place: {
      label: 'Local do Evento:',
      placeholder: 'Ex: Colégio XV de Novembro',
    },
    speaker: {
      label: 'Preletor:',
      placeholder: 'Ex: Victor Ximenes',
    },
    registrationsDeadline: {
      label: 'Prazo para Inscrição:',
      placeholder: 'Ex: 01 de Fevereiro',
    },
  };

  const sortedIconsOptions = [...iconsOptions].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento da Info Home" sessionTypeIcon="simple-info" iconSize={80} fill="#007185" />

      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <Form className="my-4">
            <h5 className="mb-3 fw-bold">Informações Base:</h5>

            {Object.keys(formData.top).map((field) => (
              <Form.Group key={field} className="mt-2">
                <Form.Label>
                  <b>{topFieldsConfig[field].label}</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.top[field]}
                  placeholder={topFieldsConfig[field].placeholder}
                  onChange={(e) => handleTopChange(field, e.target.value)}
                />
              </Form.Group>
            ))}

            <div className="d-flex mt-3 justify-content-end gap-2">
              <Button type="button" variant="teal-blue" onClick={handleSubmit}>
                {editing ? 'Salvar Alterações' : 'Criar Homepage'}
              </Button>
            </div>
          </Form>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Form className="my-4">
            <div className="d-xl-flex justify-content-between mb-3">
              <h5 className="fw-bold">Informações Importantes:</h5>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-teal-blue"
                  className="mb-3 d-flex align-items-center"
                  onClick={() => setShowNewBottomForm(true)}
                >
                  <Icons typeIcon="plus" iconSize={16} fill="#007185" />
                  &nbsp;Adicionar
                </Button>
                <Button
                  variant="danger"
                  className="mb-3 d-flex align-items-center"
                  onClick={() => setShowDeleteAllModal(true)}
                >
                  <Icons typeIcon="danger" iconSize={16} fill="#fff" />
                  &nbsp;Limpar Campos
                </Button>
              </div>
            </div>

            {showNewBottomForm && (
              <div className="border rounded p-3 mb-3 bg-light">
                <Form.Group className="mt-2">
                  <Form.Label>
                    <b>Ícone:</b>
                  </Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Select
                      value={newBottomItem.icon}
                      onChange={(e) => setNewBottomItem({ ...newBottomItem, icon: e.target.value })}
                    >
                      <option value="" disabled>
                        Selecione um Ícone
                      </option>
                      {sortedIconsOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>

                    {newBottomItem.icon && (
                      <div className="icon-preview">
                        <Icons typeIcon={newBottomItem.icon} iconSize={20} />
                      </div>
                    )}
                  </div>
                </Form.Group>

                <Form.Group className="mt-2">
                  <Form.Label>
                    <b>Título:</b>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newBottomItem.title}
                    onChange={(e) => setNewBottomItem({ ...newBottomItem, title: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mt-2">
                  <Form.Label>
                    <b>Descrição:</b>
                  </Form.Label>

                  <CustomEditor
                    value={newBottomItem.description}
                    onChange={(value) =>
                      setNewBottomItem((prev) => ({
                        ...prev,
                        description: value,
                      }))
                    }
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="secondary" onClick={() => setShowNewBottomForm(false)}>
                    Cancelar
                  </Button>

                  <Button variant="teal-blue" onClick={handleCreateBottomItem}>
                    Salvar Item
                  </Button>
                </div>
              </div>
            )}

            <Accordion className="homeinfo-custom-accordion" alwaysOpen>
              {formData.bottom.map((item, index) => (
                <Accordion.Item eventKey={String(index)} key={item.id}>
                  <Accordion.Header>
                    <div className="d-flex align-items-center gap-2">
                      {item.icon && <Icons typeIcon={item.icon} iconSize={18} />}
                      <span>{item.title || `Item ${index + 1}`}</span>
                    </div>
                  </Accordion.Header>

                  <Accordion.Body>
                    <Form.Group className="mt-2">
                      <Form.Label>
                        <b>Ícone:</b>
                      </Form.Label>

                      <div className="d-flex align-items-center gap-2">
                        <Form.Select
                          value={item.icon || ''}
                          onChange={(e) => handleBottomChange(index, 'icon', e.target.value)}
                        >
                          <option value="" disabled>
                            Selecione um Ícone
                          </option>

                          {sortedIconsOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>

                        {item.icon && (
                          <div className="icon-preview">
                            <Icons typeIcon={item.icon} iconSize={20} />
                          </div>
                        )}
                      </div>
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>
                        <b>Título:</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={item.title}
                        onChange={(e) => handleBottomChange(index, 'title', e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>
                        <b>Descrição:</b>
                      </Form.Label>
                      <CustomEditor
                        value={item.description}
                        onChange={(value) => handleBottomChange(index, 'description', value)}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <Button variant="outline-danger" size="sm" onClick={() => confirmRemoveBottomItem(index)}>
                        Remover
                      </Button>

                      <Button variant="outline-teal-blue" size="sm" onClick={() => handleUpdateBottomItem(index)}>
                        Salvar
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Form>
        </Col>
      </Row>

      <Modal className="custom-modal" show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>Tem certeza que deseja remover este item?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>

          <Button className="btn-cancel" variant="danger" onClick={handleConfirmDeleteItem}>
            Remover
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="custom-modal" show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Remover todas as informações</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>Essa ação removerá todas as informações da homepage. Deseja continuar?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>
            Cancelar
          </Button>

          <Button className="btn-cancel" variant="danger" onClick={handleConfirmDeleteAll}>
            Remover Tudo
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading || loadingContent} />
    </Container>
  );
};

AdminHomeInfoManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminHomeInfoManagement;
