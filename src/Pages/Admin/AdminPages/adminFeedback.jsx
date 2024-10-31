import { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Loading from '@/components/Loading';
import AdminHeader from '../AdminComponents/adminHeader';
import scrollUp from '@/hooks/useScrollUp';

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

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  scrollUp();

  console.log(feedbacks);

  useEffect(() => {
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
    fetchFeedbacks();
  }, []);

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Feedbacks" sessionTypeIcon="feedback" iconSize={80} fill="#204691" />
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
      <Loading loading={loading} />
    </Container>
  );
};

export default AdminFeedback;
