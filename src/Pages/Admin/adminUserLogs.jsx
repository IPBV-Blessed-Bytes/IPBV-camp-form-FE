import { useState } from 'react';
import { Container, Col, Row, Button } from 'react-bootstrap';
import axios from 'axios';
import Icons from '@/components/Icons';
import { useNavigate } from 'react-router-dom';

const AdminUserLogs = () => {
  const [userLogs, setUserLogs] = useState([]);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/logs');
      setUserLogs(response.data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  fetchLogs();

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
          <h4 className="fw-bold m-0">Logs de Usuários:</h4>
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row>
        <ul>
          {userLogs.map((log, index) => (
            <li key={index}>
              <b>{log.user}</b>: {log.action} em {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </Row>
    </Container>
  );
};

export default AdminUserLogs;
