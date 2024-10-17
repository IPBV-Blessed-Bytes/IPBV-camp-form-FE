import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Icons from '@/components/Icons';
import Loading from '@/components/Loading';
import { useNavigate } from 'react-router-dom';

const AdminFeedback = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    scrollUp();
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
          <h4 className="fw-bold m-0">Gerenciamento de Feedbacks</h4>
          <Icons className="m-left" typeIcon="add-person" iconSize={80} fill={'#204691'} />
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row>
        <Table striped bordered hover responsive className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">Nome:</th>
              <th className="table-cells-header">Organização:</th>
              <th className="table-cells-header">Experiência:</th>
              <th className="table-cells-header">Alimentação:</th>
              <th className="table-cells-header">Programação:</th>
              <th className="table-cells-header">Estrutura Física:</th>
              <th className="table-cells-header">Acolhimento:</th>
              <th className="table-cells-header">Probabilidade de Volta:</th>
              <th className="table-cells-header">Campo Aberto:</th>
            </tr>
          </thead>
          <tbody></tbody>
        </Table>
      </Row>

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminFeedback;
