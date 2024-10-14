import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import Icons from '@/components/Icons';
import Loading from '@/components/Loading';
import { registerLog } from '@/fetchers/userLogs';
import { useNavigate } from 'react-router-dom';

const AdminSeatManagement = ({ loggedUsername }) => {
  const [seats, setSeats] = useState();
  const [totalPackages, setTotalPackages] = useState({});
  const [inputSeats, setInputSeats] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const packageLabels = {
    colegioIndividual: 'Colégio Individual',
    colegioFamilia: 'Colégio Família',
    colegioCamping: 'Colégio Camping',
    seminario: 'Seminário',
    outro: 'Outro',
  };

  const packageOrder = ['colegioIndividual', 'colegioFamilia', 'colegioCamping', 'seminario', 'outro'];

  useEffect(() => {
    fetchAvailableSeats();
  }, []);

  const fetchAvailableSeats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/seats');
      setSeats(response.data.seats);
      setInputSeats(response.data.seats);
      setTotalPackages(response.data.totalPackages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateSeats = async () => {
    const currentTotalPackages = Object.values(totalPackages).reduce((acc, curr) => acc + curr, 0);

    if (inputSeats < currentTotalPackages) {
      toast.error(
        `A quantidade de vagas totais não pode ser inferior à soma das vagas por pacotes que é de ${currentTotalPackages}!`,
      );
      return;
    }

    try {
      await axios.put('http://localhost:3001/seats', {
        seats: inputSeats,
        totalPackages,
      });
      setSeats(inputSeats);
      toast.success(`Quantidade de vagas totais e por pacote ajustadas com sucesso`);
      registerLog(`Ajustou a quantidade de vagas totais e por pacote`, loggedUsername);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePackageChange = (packageType, newPackageValue) => {
    setTotalPackages((prevTotalPackages) => ({
      ...prevTotalPackages,
      [packageType]: newPackageValue,
    }));
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
          <h4 className="fw-bold m-0">Tabela de Gerenciamento de Vagas</h4>
          <Icons className="m-left" typeIcon="camp" iconSize={80} fill={'#204691'} />
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <Form className="my-4 text-center">
            <Form.Group controlId="inputSeats">
              <Form.Label>
                <b>Ajustar Vagas Totais:</b>
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={inputSeats}
                onChange={(e) => setInputSeats(Number(e.target.value))}
              />
            </Form.Group>

            {packageOrder.map((packageType) => (
              <Form.Group className="mt-2" controlId={`input-${packageType}`} key={packageType}>
                <Form.Label>{packageLabels[packageType]}:</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={totalPackages[packageType]}
                  onChange={(e) => handlePackageChange(packageType, Number(e.target.value))}
                />
              </Form.Group>
            ))}

            <div className="d-flex mt-3 justify-content-end">
              <Button variant="primary" onClick={updateSeats}>
                Ajustar Vagas
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <Loading loading={loading} />
    </Container>
  );
};

export default AdminSeatManagement;
