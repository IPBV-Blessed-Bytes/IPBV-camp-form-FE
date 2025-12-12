import { useState, useEffect } from 'react';
import { Container, Row, Button, Modal, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Tools from '@/components/Admin/Header/Tools';
import Icons from '@/components/Global/Icons';

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

  const generateExcel = () => {
    if (!groupedLogs || Object.keys(groupedLogs).length === 0) {
      toast.error('Nenhum log disponível para exportar');
      return;
    }

    const workbook = XLSX.utils.book_new();

    Object.entries(groupedLogs).forEach(([username, logs]) => {
      const sheetData = logs.map((log, index) => ({
        Nº: index + 1,
        Usuário: username,
        Ação: log.action,
        Data: new Date(log.timestamp).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        IP: log.ip,
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);

      const safeSheetName = username.substring(0, 30);
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    });

    XLSX.writeFile(workbook, 'logs.xlsx');
  };

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center mb-3 mb-md-0',
      cols: { xs: 12, md: 6 },
      fill: '#007185',
      iconSize: 40,
      id: 'export-logs',
      name: 'Baixar Relatório',
      onClick: () => generateExcel(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center mb-3 mb-md-0',
      cols: { xs: 12, md: 6 },
      fill: '#dc3545',
      iconSize: 40,
      id: 'delete-all-logs',
      name: 'Deletar Todos Logs',
      onClick: () => setShowDeleteModal(true),
      typeButton: 'outline-danger',
      typeIcon: 'danger',
    },
  ];

  return (
    <Container fluid>
      <AdminHeader pageName="Logs de Usuários" sessionTypeIcon="logs" iconSize={80} fill={'#007185'} />

      <Tools buttons={toolsButtons} />

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

      <Modal className="custom-modal" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
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
          <Button variant="danger" className="btn-cancel" onClick={handleDeleteLogs}>
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
