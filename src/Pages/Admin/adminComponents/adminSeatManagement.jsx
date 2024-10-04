import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import Icons from '@/components/Icons';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/Loading';

const AdminSeatManagement = ({ loggedUsername }) => {
  const [availableSeats, setAvailableSeats] = useState(0);
  const [inputSeats, setInputSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiURL = 'http://localhost:3001/seats';

  useEffect(() => {
    fetchAvailableSeats();
  }, []);

  const fetchAvailableSeats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(apiURL);
      setAvailableSeats(response.data.availableSeats);
    } catch (error) {
      setError('Erro ao buscar vagas disponíveis.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateSeats = async (newSeats) => {
    setError(null);
    try {
      await axios.put(apiURL, { availableSeats: newSeats });
      setAvailableSeats(newSeats);
    } catch (error) {
      setError('Erro ao atualizar vagas.');
      console.error(error);
    }
  };

  const reserveSeats = () => {
    const newSeats = availableSeats - inputSeats;
    if (newSeats < 0) {
      alert('Não há vagas suficientes!');
      return;
    }
    updateSeats(newSeats);
  };

  const releaseSeats = () => {
    const newSeats = availableSeats + inputSeats;
    updateSeats(newSeats);
  };

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
          <h4 className="fw-bold m-0">Tabela de Gerenciamento de Caronas</h4>
          <Icons className="m-left" typeIcon="camp" iconSize={80} fill={'#204691'} />
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          {error && <Alert variant="danger">{error}</Alert>}

          <h3 className="text-center">Vagas Disponíveis: {availableSeats}</h3>

          <Form className="my-4">
            <Form.Group controlId="inputSeats" className="text-center">
              <Form.Label>Quantidade:</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={inputSeats}
                onChange={(e) => setInputSeats(Number(e.target.value))}
                className="mx-auto"
                style={{ width: '100px' }}
              />
            </Form.Group>
          </Form>

          <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" onClick={reserveSeats}>
              Reservar Vaga(s)
            </Button>
            <Button variant="success" onClick={releaseSeats}>
              Liberar Vaga(s)
            </Button>
          </div>
        </Col>
      </Row>
      <Loading loading={loading} />
    </Container>
  );
};

export default AdminSeatManagement;
