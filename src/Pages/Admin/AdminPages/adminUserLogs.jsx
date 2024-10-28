import { useState, useEffect } from 'react';
import { Container, Row, Button, Modal, Accordion } from 'react-bootstrap';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { toast } from 'react-toastify';
import { registerLog } from '@/fetchers/userLogs';
import Loading from '@/components/Loading';
import AdminHeader from '../AdminComponents/adminHeader';
import PropTypes from 'prop-types';
import scrollUp from '@/fetchers/scrollUp';

const AdminUserLogs = ({ loggedUsername }) => {
  const [groupedLogs, setGroupedLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  scrollUp();

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const response = await fetcher.get('logs');
      const logs = response.data;
      const grouped = groupByUser(logs);
      setGroupedLogs(grouped);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const groupByUser = (logs) => {
    return logs.reduce((acc, log) => {
      const username = log.user?.split('@')[0] || 'Desconhecido';
      if (!acc[username]) {
        acc[username] = [];
      }
      acc[username].push(log);
      return acc;
    }, {});
  };

  const handleDeleteLogs = async () => {
    setLoading(true);

    try {
      const response = await fetcher.delete('logs');

      if (response.status === 200) {
        toast.success('Todos os logs foram deletados com sucesso');
        registerLog(`Deletou todos os logs`, loggedUsername);
        setShowDeleteModal(false);
        setGroupedLogs({});
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
      <AdminHeader
        pageName="Logs de Usuários"
        sessionTypeIcon="logs"
        iconSize={80}
        fill={'#204691'}
        showHeaderTools
        headerToolsClassname="table-tools__right-buttons-generic flex-sm-column flex-md-row  d-flex gap-2"
        headerToolsTypeButton="warning"
        headerToolsOpenModal={() => setShowDeleteModal(true)}
        headerToolsButtonIcon="danger"
        headerToolsButtonSize={20}
        headerToolsButtonFill={'#000'}
        headerToolsButtonName="Deletar Todos Logs"
      />

      <Row>
        <Accordion defaultActiveKey="0">
          {Object.entries(groupedLogs).map(([username, logs], index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>{username.toUpperCase()}</Accordion.Header>
              <Accordion.Body>
                <ul>
                  {logs.map((log, logIndex) => (
                    <li key={logIndex}>
                      <b>
                        <em>{logIndex + 1}:&nbsp;</em>
                        {username}
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
                  ))}
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
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

AdminUserLogs.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminUserLogs;
