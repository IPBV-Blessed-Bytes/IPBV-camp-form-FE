import { useState, useEffect } from 'react';
import { Button, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import { downloadMultiSheet } from '@/utils/excelExport';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog, listLogs, deleteAllLogs } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import CustomModal from '@/components/Global/CustomModal';

const AdminUserLogs = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState('');

  scrollUp();

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const data = await listLogs();
      setLogs(Array.isArray(data) ? data : []);
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
      const username = log.user?.split('@')[0] || t('admin.logs.unknownUser');
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

      toast.success(t('admin.logs.deleteSuccess'));
      registerLog(`Deletou todos os logs`, loggedUsername);
      setShowDeleteModal(false);
      setLogs([]);
    } catch (error) {
      console.error('Error adding data:', error);
      toast.error(t('admin.logs.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = () => {
    const allGrouped = groupByUser(logs);
    if (Object.keys(allGrouped).length === 0) {
      toast.error(t('admin.logs.noLogsToExport'));
      return;
    }

    const sheets = Object.entries(allGrouped).map(([username, userLogs]) => ({
      name: username,
      rows: userLogs.map((log, index) => ({
        [t('admin.logs.colNumber')]: index + 1,
        [t('admin.logs.colUser')]: username,
        [t('admin.logs.colAction')]: log.action,
        [t('admin.logs.colDate')]: new Date(log.timestamp).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        [t('admin.logs.colIp')]: log.ip,
      })),
    }));

    downloadMultiSheet({ filename: 'logs.xlsx', sheets });
  };

  const term = search.trim().toLowerCase();
  const filteredLogs = logs.filter(
    (log) =>
      !term ||
      (log.user || '').toLowerCase().includes(term) ||
      (log.action || '').toLowerCase().includes(term),
  );
  const groupedLogs = groupByUser(filteredLogs);
  const statItems = [
    { label: t('admin.logs.statTotal'), value: logs.length },
    { label: t('admin.logs.statUsers'), value: Object.keys(groupByUser(logs)).length, tone: 'accent' },
    { label: t('admin.logs.statResults'), value: filteredLogs.length, tone: 'info' },
  ];

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'export-logs',
      name: t('admin.logs.exportBtn'),
      onClick: () => generateExcel(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#dc3545',
      iconSize: 22,
      id: 'delete-all-logs',
      name: t('admin.logs.deleteAllBtn'),
      onClick: () => setShowDeleteModal(true),
      typeButton: 'outline-danger',
      typeIcon: 'danger',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--logs">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.logs.title')}
        subtitle={t('admin.logs.subtitle')}
        typeIcon="logs"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="logs-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.logs.searchPlaceholder')} />
        </div>

        <SectionHeader title={t('admin.logs.sectionTitle')} count={Object.keys(groupedLogs).length} />

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
                      : {log.action} {t('admin.logs.at')}{' '}
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
        title={t('admin.logs.confirmDeleteTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('admin.logs.cancel')}
            </Button>
            <Button variant="danger" className="btn-cancel" onClick={handleDeleteLogs}>
              {t('admin.logs.delete')}
            </Button>
          </>
        }
      >
        <Trans i18nKey="admin.logs.confirmDeleteText" components={{ em: <em />, b: <b /> }} />
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
