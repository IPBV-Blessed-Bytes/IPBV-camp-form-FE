import { useState } from 'react';
import { Container, Col, Row, Button, Modal } from 'react-bootstrap';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Icons from '@/components/Icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerLog } from '@/fetchers/userLogs';
import Loading from '@/components/Loading';

const AdminUserLogs = ({ loggedUsername }) => {
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDeleteLogs = async () => {
    setLoading(true);

    try {
      const response = await fetcher.delete('logs');

      if (response.status === 200) {
        toast.success('Todos os logs foram deletados com sucesso');
        registerLog(`Deletou todos os logs`, loggedUsername);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error adding data:', error);
      toast.error('Erro ao deletar logs');
    } finally {
      setLoading(false);
    }
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
          <h4 className="fw-bold m-0">Logs de Usuários:</h4>
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="table-tools--rides-buttons-wrapper mb-4">
        <Col lg={12} md={12} xs={12}>
          <div className="table-tools__right-buttons-ride flex-sm-column flex-md-row  d-flex gap-2">
            <Button
              variant="warning"
              onClick={() => setShowDeleteModal(true)}
              className="d-flex align-items-center"
              size="lg"
            >
              <Icons typeIcon="danger" iconSize={20} fill="#000" />
              <span>&nbsp;Deletar Todos Logs</span>
            </Button>
          </div>
        </Col>
      </Row>
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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir todos os Logs?{' '}
          <em>
            <b>Essa ação é irreversível!</b>
          </em>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteLogs}>
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminUserLogs;
