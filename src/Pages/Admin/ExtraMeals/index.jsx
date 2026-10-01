import { useEffect, useMemo, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import { useParticipantsList } from '@/hooks/useParticipantsList';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';

const AdminExtraMeals = () => {
  const { t } = useTranslation();
  scrollUp();

  const { campers, isLoading: loading, isError } = useParticipantsList();
  const [search, setSearch] = useState('');

  const usersWithExtraMeals = useMemo(() => campers.filter((user) => user.extraMeals?.someFood), [campers]);

  useEffect(() => {
    if (isError) toast.error(t('admin.extraMeals.fetchError'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const generateExcel = () => {
    const rows = usersWithExtraMeals.map((user) => ({
      Inscrito: user.personalInformation.name,
      Refeições: user.extraMeals.extraMeals[0],
    }));

    downloadSingleSheet({ filename: 'alimentacao.xlsx', sheetName: 'Alimentação', rows });
  };

  const totalDays = usersWithExtraMeals.reduce(
    (acc, user) => acc + (user.extraMeals?.extraMeals?.length || 0),
    0,
  );
  const statItems = [
    { label: t('admin.extraMeals.statRegistered'), value: usersWithExtraMeals.length },
    { label: t('admin.extraMeals.statDays'), value: totalDays, tone: 'info' },
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
      name: t('admin.extraMeals.downloadReport'),
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--meals">
      <AdminSubpageHeader
        title={t('admin.extraMeals.title')}
        subtitle={t('admin.extraMeals.subtitle')}
        typeIcon="food"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="meals-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.extraMeals.searchPlaceholder')} />
        </div>

        <SectionHeader title={t('admin.extraMeals.sectionTitle')} count={filteredUsers.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
          <tr>
            <th className="table-cells-header">{t('admin.extraMeals.colName')}</th>
            <th className="table-cells-header">{t('admin.extraMeals.colMeals')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-start text-secondary p-4">
                {t('admin.extraMeals.empty')}
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
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
                  <span className="text-secondary small">{t('admin.extraMeals.noDays')}</span>
                )}
              </td>
            </tr>
          ))
          )}
        </tbody>
          </Table>
        </div>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

export default AdminExtraMeals;
