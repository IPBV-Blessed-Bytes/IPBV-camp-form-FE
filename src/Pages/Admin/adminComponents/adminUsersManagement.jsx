import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import privateFetcher from '@/fetchers/fetcherWithCredentials';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Icons from '@/components/Icons';
import Loading from '@/components/Loading';
import { registerLog } from '@/fetchers/userLogs';
import { useNavigate } from 'react-router-dom';

const AdminUsersManagement = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
          <h4 className="fw-bold m-0">Gerenciamento de Usuários</h4>
          <Icons className="m-left" typeIcon="add-person" iconSize={80} fill={'#204691'} />
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="justify-content-center">
      
      </Row>
      <Loading loading={loading} />
    </Container>
  );
};

export default AdminUsersManagement;
