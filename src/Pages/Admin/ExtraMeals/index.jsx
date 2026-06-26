import { useEffect, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import { useCampersList } from '@/hooks/useCampersList';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';

const AdminExtraMeals = () => {
  scrollUp();

  const { campers, isLoading: loading, isError } = useCampersList();

  const usersWithExtraMeals = useMemo(() => campers.filter((user) => user.extraMeals?.someFood), [campers]);

  useEffect(() => {
    if (isError) toast.error('Erro ao buscar usuários com refeições extras');
  }, [isError]);

  const generateExcel = () => {
    const rows = usersWithExtraMeals.map((user) => ({
      Acampante: user.personalInformation.name,
      Refeições: user.extraMeals.extraMeals[0],
    }));

    downloadSingleSheet({ filename: 'alimentacao.xlsx', sheetName: 'Alimentação', rows });
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'extra-meals-excel',
      name: 'Baixar Relatório',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--meals">
      <AdminSubpageHeader
        title="Usuários com Refeições Extras"
        subtitle="Acampantes que solicitaram refeições adicionais"
        typeIcon="food"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <SectionHeader title="Refeições extras" count={usersWithExtraMeals.length} />

        <div className="admin-table-card">
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
        </div>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

export default AdminExtraMeals;
