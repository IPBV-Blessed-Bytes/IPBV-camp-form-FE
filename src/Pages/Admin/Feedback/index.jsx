import { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import { registerLog } from '@/services/logs';
import { listFeedback, deleteAllFeedback } from '@/services/feedback';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import CustomModal from '@/components/Global/CustomModal';
import { TABLE_HEADERS } from '@/utils/constants';

const AdminFeedback = ({ loggedUsername }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  scrollUp();

  const fetchFeedbacks = async () => {
    try {
      const data = await listFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDeleteFeedbacks = async () => {
    try {
      await deleteAllFeedback();

      toast.success('Todos os feedbacks foram deletados com sucesso');
      registerLog(`Deletou todos os feedbacks`, loggedUsername);
      setShowDeleteModal(false);
      fetchFeedbacks();
    } catch (error) {
      console.error('Erro ao deletar feedbacks:', error);
      toast.error('Erro ao deletar feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = () => {
    if (!feedbacks || feedbacks.length === 0) {
      toast.error('Nenhum feedback disponível para exportar');
      return;
    }

    const filteredHeaders = TABLE_HEADERS.filter((header) => header !== 'ID');

    const rows = feedbacks.map((feedback) => {
      const values = Object.values(feedback);
      const row = {};

      TABLE_HEADERS.forEach((header, index) => {
        if (header === 'ID') return;
        const value = values[index];
        row[header] =
          value && !isNaN(Date.parse(value))
            ? new Date(value).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : value;
      });

      return row;
    });

    downloadSingleSheet({
      filename: 'feedbacks.xlsx',
      sheetName: 'Feedbacks',
      rows,
      headers: filteredHeaders,
    });
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'export-feedbacks',
      name: 'Baixar Relatório',
      onClick: () => generateExcel(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#dc3545',
      iconSize: 22,
      id: 'delete-all',
      name: 'Deletar Todos Feedbacks',
      onClick: () => setShowDeleteModal(true),
      typeButton: 'outline-danger',
      typeIcon: 'danger',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--feedback">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Gerenciamento de Feedbacks"
        subtitle="Opiniões enviadas pelos participantes"
        typeIcon="feedback"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <SectionHeader title="Feedbacks" count={feedbacks.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
        <thead>
          <tr>
            {TABLE_HEADERS.map((header, index) => (
              <th key={index} className="table-cells-header">
                {header}:
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback, index) => (
            <tr key={index}>
              {Object.values(feedback).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
          </Table>
        </div>

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
            <Button variant="danger" className="btn-cancel" onClick={handleDeleteFeedbacks}>
              Deletar
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir todos os Feedbacks?{' '}
        <em>
          <b>Essa ação é irreversível!</b>
        </em>
      </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminFeedback.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFeedback;
