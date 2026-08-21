import { useEffect, useMemo, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import { useCampersList } from '@/hooks/useCampersList';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';

const AdminExtraMeals = () => {
  scrollUp();

  const { campers, isLoading: loading, isError } = useCampersList();
  const [search, setSearch] = useState('');

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

  const totalDays = usersWithExtraMeals.reduce(
    (acc, user) => acc + (user.extraMeals?.extraMeals?.length || 0),
    0,
  );
  const statItems = [
    { label: 'Acampantes', value: usersWithExtraMeals.length },
    { label: 'Total de dias', value: totalDays, tone: 'info' },
  ];
  const term = search.trim().toLowerCase();
  const filteredUsers = usersWithExtraMeals.filter(
    (user) => !term || (user.personalInformation?.name || '').toLowerCase().includes(term),
  );

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

        <StatCards items={statItems} />

        <div className="meals-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por acampante..." />
        </div>

        <SectionHeader title="Refeições extras" count={filteredUsers.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
          <tr>
            <th className="table-cells-header">Acampante:</th>
            <th className="table-cells-header">Refeições Extras (Dias):</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.personalInformation.name}</td>
              <td>
                {user.extraMeals.extraMeals.length > 0 ? (
                  <span className="meal-days">
                    {user.extraMeals.extraMeals.map((day, dayIndex) => (
                      <Badge key={`${user.id}-${dayIndex}`} bg="info" text="dark">
                        {day}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  <span className="text-secondary small">Nenhum dia</span>
                )}
              </td>
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
