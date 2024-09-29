import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Dropdown, DropdownButton, Accordion, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icons from '@/components/Icons';
import fetcher from '@/fetchers/fetcherWithCredentials';

const AdminAggregate = () => {
  const [dropdownCampers, setDropdownCampers] = useState([]);
  const [selectedCamper, setSelectedCamper] = useState(null);
  const [aggregate, setAggregate] = useState([]);
  const [selectedAggregate, setSelectedAggregate] = useState(null);
  const [newAggregate, setNewAggregate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetcher.get('camper', {
          params: {
            size: 100000,
          },
        });

        const sortedCampers = response.data.content.sort((a, b) =>
          a.personalInformation.name.localeCompare(b.personalInformation.name),
        );

        const filteredCampers = sortedCampers
          .filter((camper) => camper.contact.hasAggregate)
          .map((camper) => ({
            personalInformation: {
              name: camper.personalInformation.name,
            },
            contact: {
              hasAggregate: camper.contact.hasAggregate,
              aggregate: camper.contact.aggregate,
            },
          }));

        setDropdownCampers(filteredCampers);

        try {
          await axios.post('http://localhost:3001/camper', filteredCampers);
        } catch (error) {
          console.error('Erro ao salvar campers no backend:', error);
        }
      } catch (error) {
        toast.error('Erro ao carregar usuários');
        console.error('Erro ao buscar campers:', error);
      }
    };

    fetchUsers();
  }, []);

  const hadleSelectCamper = (camper) => {
    setSelectedCamper(camper);

    const camperAggregate = camper.contact.aggregate ? camper.contact.aggregate.split('|').sort() : [];
    setAggregate(camperAggregate);
  };

  const handleShowModal = (aggregate = null) => {
    setSelectedAggregate(aggregate);
    setNewAggregate(aggregate ? aggregate : null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewAggregate(null);
    setSelectedAggregate(null);
  };

  const handleSave = async () => {
    if (!newAggregate) {
      toast.error('Selecione um agregado');
      return;
    }

    if (aggregate.includes(newAggregate.name)) {
      toast.error('Este usuário já faz parte da família');
      return;
    }

    const newFamily = selectedAggregate
      ? aggregate.map((aggregate) => (aggregate === selectedAggregate ? newAggregate.name : aggregate))
      : [...aggregate, newAggregate.name];

    const sortedFamily = newFamily.sort();
    setAggregate(sortedFamily);

    const updatedAggregate = sortedFamily.join('|');
    try {
      await axios.put(`/camper/${selectedCamper.id}`, {
        ...selectedCamper,
        contact: { ...selectedCamper.contact, aggregate: updatedAggregate },
      });
      toast.success('Agregado salvo com sucesso');
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao salvar agregado');
      console.error(error);
    }
  };

  const handleDelete = async (aggregateToDelete) => {
    const newFamily = aggregate.filter((name) => name !== aggregateToDelete);

    const sortedFamily = newFamily.sort();
    setAggregate(sortedFamily);

    const updatedAggregate = sortedFamily.join('|');
    try {
      await axios.put(`/camper/${selectedCamper.id}`, {
        ...selectedCamper,
        contact: { ...selectedCamper.contact, aggregate: updatedAggregate },
      });
      toast.success('Agregado removido com sucesso');
    } catch (error) {
      toast.error('Erro ao remover agregado');
      console.error(error);
    }
  };

  return (
    <>
      <Container fluid>
        <Row className="mt-3">
          <Col>
            <Button variant="danger" onClick={() => navigate('/admin')}>
              <Icons typeIcon="arrow-left" iconSize={30} fill="#fff" />
              &nbsp;Voltar
            </Button>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <h4 className="fw-bold m-0">Gerenciamento de Agregados:</h4>
          </Col>
        </Row>
        <hr className="horizontal-line" />

        <Row>
          <Col>
            <DropdownButton
              variant="secondary"
              title={selectedCamper ? selectedCamper.personalInformation.name : 'Selecione um Usuário'}
            >
              {dropdownCampers.map((camper) => (
                <Dropdown.Item key={camper.id} onClick={() => hadleSelectCamper(camper)}>
                  {camper.personalInformation.name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Col>
        </Row>

        {selectedCamper && (
          <Row className="mt-3">
            <Col>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Agregados de {selectedCamper.personalInformation.name}</Accordion.Header>
                  <Accordion.Body>
                    {aggregate.length === 0 ? (
                      <p>Nenhum agregado selecionado</p>
                    ) : (
                      aggregate.map((aggregate, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                          <span>{aggregate}</span>
                          <div className="d-flex gap-1">
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(aggregate)}>
                              <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    <Button className="mt-3" onClick={() => handleShowModal()}>
                      Adicionar Agregado
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        )}

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedAggregate ? 'Editar Agregado' : 'Adicionar Agregado'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>
                  <b>Selecione o Agregado:</b>
                </Form.Label>
                <Form.Control
                  as="select"
                  value={newAggregate ? newAggregate.personalInformation.name : ''}
                  onChange={(e) =>
                    setNewAggregate(
                      dropdownCampers.find((camper) => camper.personalInformation.name === e.target.value),
                    )
                  }
                >
                  <option value="">Selecione um agregado</option>
                  {dropdownCampers
                    .filter((camper) => {
                      return (
                        selectedCamper &&
                        camper.personalInformation.name !== selectedCamper.personalInformation.name &&
                        !aggregate.includes(camper.personalInformation.name)
                      );
                    })
                    .map((camper) => {
                      return (
                        <option key={camper.personalInformation.name} value={camper.personalInformation.name}>
                          {camper.personalInformation.name}
                        </option>
                      );
                    })}
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {selectedAggregate ? 'Atualizar' : 'Adicionar'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AdminAggregate;
