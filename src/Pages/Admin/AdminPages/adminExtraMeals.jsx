import { useState, useEffect } from 'react';
import { Table, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Loading from '@/components/Loading';
import AdminHeader from '../AdminComponents/adminHeader';
import scrollUp from '@/hooks/useScrollUp';

const AdminExtraMeals = () => {
  const [usersWithExtraMeals, setUsersWithExtraMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  scrollUp();

  useEffect(() => {
    fetchUsersWithExtraMeals();
  }, []);

  const fetchUsersWithExtraMeals = async () => {
    try {
      const response = await fetcher.get('camper', { params: { size: 100000 } });
      if (Array.isArray(response.data.content)) {
        const filteredUsers = response.data.content.filter((user) => user.extraMeals.someFood);
        setUsersWithExtraMeals(filteredUsers);
      } else {
        console.error('Erro: Dados não estão no formato esperado.');
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao buscar usuários com refeições extras');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <AdminHeader pageName="Usuários com Refeições Extras" sessionTypeIcon="food" iconSize={80} fill={'#204691'} />

      <Table striped bordered hover responsive className="custom-table">
        <thead>
          <tr>
            <th className="table-cells-header">Acampante:</th>
            <th className="table-cells-header">Refeições Extras (Dias):</th>
          </tr>
        </thead>
        <tbody>
          {usersWithExtraMeals.map((user) => (
            <tr key={user.id}>
              <td>{user.personalInformation.name}</td>
              <td>{user.extraMeals.extraMeals.length > 0 ? user.extraMeals.extraMeals : 'Nenhum dia'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminExtraMeals;
