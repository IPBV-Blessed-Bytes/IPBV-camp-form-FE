import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Tools from '@/components/Admin/Header/Tools';
import Icons from '@/components/Global/Icons';

const defaultPrice = {
  seminary: '',
  registrationFee: '',
  completeFood: '',
  partialFood: '',
  bus: '',
};

const defaultVacancies = {
  seminary: '',
  registrationFee: '',
  food: '',
  bus: '',
};

const AdminLotManagement = ({ loading, loggedUsername }) => {
  const [loadingContent, setLoadingContent] = useState(false);
  const [lots, setLots] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLot, setNewLot] = useState({
    name: '',
    price: { ...defaultPrice },
    vacancies: { ...defaultVacancies },
    startDate: '',
    endDate: '',
  });

  scrollUp();

  const fetchLots = async () => {
    try {
      setLoadingContent(true);
      const response = await fetcher.get('lots');
      setLots(response.data?.lots || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar lotes');
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleLotChange = (id, field, value, nestedField = null) => {
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id !== id) return lot;

        if ((field === 'price' || field === 'vacancies') && nestedField) {
          return {
            ...lot,
            [field]: { ...lot[field], [nestedField]: value },
          };
        }

        return { ...lot, [field]: value };
      }),
    );
  };

  const updateLot = async (lot) => {
    try {
      setLoadingContent(true);
      await fetcher.patch(`lots/${lot.id}`, {
        name: lot.name,
        startDate: lot.startDate,
        endDate: lot.endDate,
        price: { ...lot.price },
        vacancies: { ...lot.vacancies },
      });
      toast.success(`${lot.name} atualizado com sucesso`);
      registerLog(`Atualizou o ${lot.name}`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar lote');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDeleteLot = async () => {
    if (!selectedLot) return;

    try {
      setLoadingContent(true);
      await fetcher.delete(`lots/${selectedLot.id}`);
      toast.success(`${selectedLot.name} deletado com sucesso`);
      registerLog(`Deletou o ${selectedLot.name}`, loggedUsername);
      setShowDeleteModal(false);
      fetchLots();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao deletar lote');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleAddLot = async () => {
    try {
      setLoadingContent(true);
      await fetcher.post('lots', {
        name: newLot.name,
        startDate: newLot.startDate,
        endDate: newLot.endDate,
        price: { ...newLot.price },
        vacancies: { ...newLot.vacancies },
      });
      toast.success(`${newLot.name} adicionado com sucesso`);
      registerLog(`Adicionou o ${newLot.name}`, loggedUsername);
      setShowAddModal(false);
      setNewLot({
        name: '',
        price: { ...defaultPrice },
        vacancies: { ...defaultVacancies },
        startDate: '',
        endDate: '',
      });
      fetchLots();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao adicionar lote');
    } finally {
      setLoadingContent(false);
    }
  };

  const priceLabels = {
    seminary: 'Preço do Seminário',
    registrationFee: 'Preço da Taxa de Inscrição',
    completeFood: 'Preço da Alimentação Completa',
    partialFood: 'Preço da Alimentação Parcial',
    bus: 'Preço do Ônibus',
  };

  const vacanciesLabels = {
    seminary: 'Vagas Seminário',
    registrationFee: 'Vagas Taxa de Inscrição',
    food: 'Vagas Alimentação',
    bus: 'Vagas Ônibus',
  };

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Lotes" sessionTypeIcon="calendar" iconSize={65} fill={'#204691'} />

      <Tools
        headerToolsClassname="d-flex justify-content-end gap-2"
        headerToolsTypeButton="primary"
        headerToolsOpenModal={() => setShowAddModal(true)}
        headerToolsButtonIcon="plus"
        headerToolsButtonSize={20}
        headerToolsButtonFill={'#fff'}
        headerToolsButtonName="Adicionar Novo Lote"
      />

      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Form>
            {lots.map((lot) => (
              <div key={lot.id} className="border rounded p-3 mb-3">
                <h5>
                  <strong>{lot.name}:</strong>
                </h5>
                <Row>
                  {Object.keys(defaultPrice).map((field) => (
                    <Col xs={12} md={4} key={field}>
                      <Form.Group>
                        <Form.Label>
                          <strong>{priceLabels[field]}</strong>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={lot.price?.[field] || ''}
                          onChange={(e) => handleLotChange(lot.id, 'price', e.target.value, field)}
                        />
                      </Form.Group>
                    </Col>
                  ))}

                  {Object.keys(defaultVacancies).map((field) => (
                    <Col xs={12} md={4} key={field}>
                      <Form.Group>
                        <Form.Label>
                          <strong>{vacanciesLabels[field]}</strong>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={lot.vacancies?.[field] ?? 0}
                          onChange={(e) => handleLotChange(lot.id, 'vacancies', e.target.value, field)}
                        />
                      </Form.Group>
                    </Col>
                  ))}

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label>
                        <strong>Data Início</strong>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={lot.startDate || ''}
                        onChange={(e) => handleLotChange(lot.id, 'startDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label>
                        <strong>Data Fim</strong>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={lot.endDate || ''}
                        onChange={(e) => handleLotChange(lot.id, 'endDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex mt-3 justify-content-end gap-2">
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedLot(lot);
                      setShowDeleteModal(true);
                    }}
                  >
                    Deletar
                  </Button>
                  <Button variant="success" onClick={() => updateLot(lot)}>
                    Salvar
                  </Button>
                </div>
              </div>
            ))}
          </Form>
        </Col>
      </Row>

      <Modal className="custom-modal" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir <b>{selectedLot?.name}</b>?{' '}
          <em>
            <b>Essa ação é irreversível!</b>
          </em>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" className="btn-cancel" onClick={handleDeleteLot}>
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} size="xl" onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Adicionar Novo Lote</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} lg={4} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Nome:</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newLot.name}
                    onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
                    className={`form-control-lg form-control-bg admin-field--even`}
                    placeholder="Nome do Lote"
                  />
                </Form.Group>
              </Col>

              <Col md={12} lg={4} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Data Início:</strong>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={newLot.startDate}
                    onChange={(e) => setNewLot({ ...newLot, startDate: e.target.value })}
                    className={`form-control-lg form-control-bg admin-field--even`}
                    placeholder="Data de Início do Lote"
                  />
                </Form.Group>
              </Col>

              <Col md={12} lg={4} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Data Fim:</strong>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={newLot.endDate}
                    onChange={(e) => setNewLot({ ...newLot, endDate: e.target.value })}
                    className={`form-control-lg form-control-bg admin-field--even`}
                    placeholder="Data de Fim do Lote"
                  />
                </Form.Group>
              </Col>

              {Object.keys(defaultPrice).map((field) => (
                <Col md={12} lg={4} className="mb-3">
                  <Form.Group className="mb-3" key={field}>
                    <Form.Label>
                      <strong>{priceLabels[field]}:</strong>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={newLot.price[field]}
                      onChange={(e) => setNewLot({ ...newLot, price: { ...newLot.price, [field]: e.target.value } })}
                      className={`form-control-lg form-control-bg admin-field--odd`}
                      placeholder="Preços"
                    />
                  </Form.Group>
                </Col>
              ))}

              {Object.keys(defaultVacancies).map((field) => (
                <Col md={12} lg={4} className="mb-3">
                  <Form.Group className="mb-3" key={field}>
                    <Form.Label>
                      <strong>{vacanciesLabels[field]}:</strong>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={newLot.vacancies[field]}
                      onChange={(e) =>
                        setNewLot({ ...newLot, vacancies: { ...newLot.vacancies, [field]: e.target.value } })
                      }
                      className={`form-control-lg form-control-bg admin-field--even`}
                      placeholder="Vagas"
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAddLot}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading || loadingContent} />
    </Container>
  );
};

AdminLotManagement.propTypes = {
  loggedUsername: PropTypes.string,
  loading: PropTypes.bool.isRequired,
};

export default AdminLotManagement;
