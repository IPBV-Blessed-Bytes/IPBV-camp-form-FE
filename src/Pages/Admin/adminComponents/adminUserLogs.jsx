import { useState } from 'react';
import { Container, Col, Row, Button } from 'react-bootstrap';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Icons from '@/components/Icons';
import { useNavigate } from 'react-router-dom';

const AdminUserLogs = ({}) => {
  const [userLogs, setUserLogs] = useState([]);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    try {
      const response = await fetcher.get('logs');
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
          {userLogs.map((log, index) => {
            const splitedUsernameLog = log.user?.split('@')[0];

            return (
              <>
                <li key={index}>
                  <b>
                    <em>{index}:&nbsp;</em>
                    {splitedUsernameLog}
                  </b>
                  : {log.action} em{' '}
                  {new Date(log.timestamp).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  | <em>(IP: {log.ip})</em>
                </li>
                <hr className="horizontal-line" />
              </>
            );
          })}
        </ul>
      </Row>
    </Container>
  );
};

export default AdminUserLogs;
