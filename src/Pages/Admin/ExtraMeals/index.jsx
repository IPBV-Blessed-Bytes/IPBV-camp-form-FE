import { useState, useEffect } from 'react';
import { Table, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './style.scss';
import * as XLSX from 'xlsx';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Tools from '@/components/Admin/Header/Tools';

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

  const generateExcel = () => {
    const fieldMapping = usersWithExtraMeals.flatMap((users) => ({
      Acampante: users.personalInformation.name,
      Refeições: users.extraMeals.extraMeals[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(fieldMapping);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alimentação');
    XLSX.writeFile(workbook, 'alimentacao.xlsx');
  };

  return (
    <Container fluid>
      <AdminHeader pageName="Usuários com Refeições Extras" sessionTypeIcon="food" iconSize={80} fill={'#204691'} />

      <Tools
        headerToolsClassname="table-tools__right-buttons-generic flex-sm-column flex-md-row  d-flex gap-2"
        headerToolsTypeButton="success"
        headerToolsOpenModal={generateExcel}
        headerToolsButtonIcon="excel"
        headerToolsButtonName="Baixar Excel"
      />

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
