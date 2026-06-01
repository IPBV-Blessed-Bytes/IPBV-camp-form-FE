import { useState, useEffect } from 'react';
import { Button, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { downloadMultiSheet } from '@/utils/excelExport';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog, listLogs, deleteAllLogs } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import CustomModal from '@/components/Global/CustomModal';

const AdminUserLogs = ({ loggedUsername }) => {
  const [groupedLogs, setGroupedLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  scrollUp();

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const logs = await listLogs();
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
      await deleteAllLogs();

      toast.success('Todos os logs foram deletados com sucesso');
      registerLog(`Deletou todos os logs`, loggedUsername);
      setShowDeleteModal(false);
      setGroupedLogs({});
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

    const sheets = Object.entries(groupedLogs).map(([username, logs]) => ({
      name: username,
      rows: logs.map((log, index) => ({
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
      })),
    }));

    downloadMultiSheet({ filename: 'logs.xlsx', sheets });
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'export-logs',
      name: 'Baixar Relatório',
      onClick: () => generateExcel(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#dc3545',
      iconSize: 22,
      id: 'delete-all-logs',
      name: 'Deletar Todos Logs',
      onClick: () => setShowDeleteModal(true),
      typeButton: 'outline-danger',
      typeIcon: 'danger',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--logs">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Logs de Usuários"
        subtitle="Histórico de ações por usuário"
        typeIcon="logs"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <SectionHeader title="Logs por usuário" count={Object.keys(groupedLogs).length} />

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

      <CustomModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        variant="cancel"
        title="Confirmar Exclusão"
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="btn-cancel" onClick={handleDeleteLogs}>
              Deletar
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir todos os Logs?{' '}
        <em>
          <b>Essa ação é irreversível!</b>
        </em>
      </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminUserLogs.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminUserLogs;
