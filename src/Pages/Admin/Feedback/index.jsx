import { useState, useEffect } from 'react';
import { Container, Table, Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/AdminHeader';

const TABLE_HEADERS = [
  'ID',
  'Nome',
  'Organização',
  'Experiência',
  'Alimentação',
  'Programação',
  'Estrutura Física',
  'Acolhimento',
  'Probabilidade de Volta',
  'Campo Aberto',
];

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
      console.error('Error adding data:', error);
      toast.error('Erro ao deletar feedbacks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <AdminHeader
        pageName="Gerenciamento de Feedbacks"
        sessionTypeIcon="feedback"
        iconSize={80}
        fill="#204691"
        showHeaderTools
        headerToolsClassname="table-tools__right-buttons-generic flex-sm-column flex-md-row  d-flex gap-2"
        headerToolsTypeButton="warning"
        headerToolsOpenModal={() => setShowDeleteModal(true)}
        headerToolsButtonIcon="danger"
        headerToolsButtonSize={20}
        headerToolsButtonFill={'#000'}
        headerToolsButtonName="Deletar Todos Feedbacks"
      />
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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
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
          <Button variant="danger" onClick={handleDeleteFeedbacks}>
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
