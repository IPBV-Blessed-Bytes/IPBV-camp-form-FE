import { useState, useEffect } from 'react';
import { Container, Table, Modal, Button } from 'react-bootstrap';
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
import { TABLE_HEADERS } from '@/utils/constants';

const AdminFeedback = ({ loggedUsername }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  scrollUp();

  const fetchFeedbacks = async () => {
    try {
      const { data } = await fetcher.get('feedback');
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
      const response = await fetcher.delete('feedback');

      if (response.status === 200) {
        toast.success('Todos os feedbacks foram deletados com sucesso');
        registerLog(`Deletou todos os feedbacks`, loggedUsername);
        setShowDeleteModal(false);
        fetchFeedbacks();
      }
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

    const workbook = XLSX.utils.book_new();

    const filteredHeaders = TABLE_HEADERS.filter((header) => header !== 'ID');

    const sheetData = feedbacks.map((feedback) => {
      const values = Object.values(feedback);
      const row = {};

      TABLE_HEADERS.forEach((header, index) => {
        if (header !== 'ID') {
          const value = values[index];

          if (value && !isNaN(Date.parse(value))) {
            row[header] = new Date(value).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          } else {
            row[header] = value;
          }
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetData, {
      header: filteredHeaders,
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');

    XLSX.writeFile(workbook, 'feedbacks.xlsx');
  };

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center mb-3 mb-md-0',
      cols: { xs: 12, md: 6 },
      fill: '#007185',
      iconSize: 40,
      id: 'export-feedbacks',
      name: 'Baixar Relatório',
      onClick: () => generateExcel(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center mb-3 mb-md-0',
      cols: { xs: 12, md: 6 },
      fill: '#dc3545',
      iconSize: 35,
      id: 'delete-all',
      name: 'Deletar Todos Feedbacks',
      onClick: () => setShowDeleteModal(true),
      typeButton: 'outline-danger',
      typeIcon: 'danger',
    },
  ];

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Feedbacks" sessionTypeIcon="feedback" iconSize={80} fill="#204691" />

      <Tools buttons={toolsButtons} />

      <Table striped bordered hover responsive className="custom-table mt-3">
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

      <Modal className="custom-modal" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir todos os Feedbacks?{' '}
          <em>
            <b>Essa ação é irreversível!</b>
          </em>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" className="btn-cancel" onClick={handleDeleteFeedbacks}>
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

AdminFeedback.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFeedback;
