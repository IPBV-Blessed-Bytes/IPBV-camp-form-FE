import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

import { permissionsSections } from '@/fetchers/permissions';
import { useCampersList } from '@/hooks/useCampersList';
import CheckinBalance from '@/components/Admin/CheckinBalance';
import VacanciesProgression from '@/components/Admin/VacanciesProgression';
import '../Style/AdminCharts.scss';

const COLORS = ['#204691', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#F44336', '#607D8B'];
const NON_HOST_KEYS = ['food-complete', 'no-food', 'bus-yes', 'bus-no'];

const labelMap = {
  'host-college-family': 'Colégio Família',
  'host-college-camping': 'Colégio Camping',
  'host-college-collective': 'Colégio Individual',
  'host-external': 'Externo',
  'host-seminario': 'Seminário',
};

const translateLabel = (key) => labelMap[key] || key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const PieCard = ({ title, data }) => (
  <div className="admin-charts__card">
    <h3 className="admin-charts__card-title">{title}</h3>
    <div className="admin-charts__pie">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" data={data} label outerRadius="75%">
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

PieCard.propTypes = { title: PropTypes.string, data: PropTypes.array };

const AdminCharts = ({ availablePackages, userRole }) => {
  const { vacanciesProgressionPermissions, checkinBalancePermissions, filledVacanciesChartPermissions, allInfoChartPermissions } =
    permissionsSections(userRole);

  const { campers } = useCampersList();

  const usedPackages = availablePackages?.usedPackages || {};
  const totalPackages = availablePackages?.totalPackages || {};

  const fillingVacancies = useMemo(
    () =>
      campers
        .filter((camper) => camper.checkin === true)
        .map((camper) => ({ checkin: camper.checkin, accomodationName: camper.package?.accomodationName || 'Desconhecido' })),
    [campers],
  );

  const { usedPackagesData, usedValidData, schoolPackagesData, foodData, busData } = useMemo(() => {
    const usedPk = availablePackages?.usedPackages || {};
    const usedValidPk = availablePackages?.usedValidPackages || {};
    const toHostEntries = (obj) =>
      Object.entries(obj)
        .filter(([key]) => !NON_HOST_KEYS.includes(key))
        .map(([key, value]) => ({ name: translateLabel(key), value }));

    return {
      usedPackagesData: toHostEntries(usedPk),
      usedValidData: toHostEntries(usedValidPk),
      schoolPackagesData: [
        { name: 'Colégio Família', value: usedPk['host-college-family'] || 0 },
        { name: 'Colégio Camping', value: usedPk['host-college-camping'] || 0 },
        { name: 'Colégio Individual', value: usedPk['host-college-collective'] || 0 },
      ],
      foodData: [
        { name: 'Com Alimentação', value: usedPk['food-complete'] || 0 },
        { name: 'Sem Alimentação', value: usedPk['no-food'] || 0 },
      ],
      busData: [
        { name: 'Com Ônibus', value: usedPk['bus-yes'] || 0 },
        { name: 'Sem Ônibus', value: usedPk['bus-no'] || 0 },
      ],
    };
  }, [availablePackages]);

  const hasAnyChart =
    vacanciesProgressionPermissions || checkinBalancePermissions || filledVacanciesChartPermissions || allInfoChartPermissions;

  if (!hasAnyChart) return null;

  return (
    <div className="admin-charts">
      {(vacanciesProgressionPermissions || checkinBalancePermissions) && (
        <div className="admin-charts__grid admin-charts__grid--progress">
          {vacanciesProgressionPermissions && (
            <div className="admin-charts__card">
              <h3 className="admin-charts__card-title">Avanço de Inscrições</h3>
              <VacanciesProgression usedValidPackages={usedPackagesData} totalPackages={totalPackages} />
            </div>
          )}
          {checkinBalancePermissions && (
            <div className="admin-charts__card">
              <h3 className="admin-charts__card-title">Avanço de Check-in</h3>
              <CheckinBalance fillingVacancies={fillingVacancies} usedPackages={usedPackages} />
            </div>
          )}
        </div>
      )}

      {filledVacanciesChartPermissions && (
        <div className="admin-charts__grid">
          <PieCard title="Vagas Preenchidas" data={usedPackagesData} />
          <PieCard title="Adultos Pagantes" data={usedValidData} />
        </div>
      )}

      {allInfoChartPermissions && (
        <div className="admin-charts__grid">
          <PieCard title="Colégio (Família / Camping / Individual)" data={schoolPackagesData} />
          <PieCard title="Com e Sem Alimentação" data={foodData} />
          <PieCard title="Com e Sem Ônibus" data={busData} />
        </div>
      )}
    </div>
  );
};

AdminCharts.propTypes = {
  availablePackages: PropTypes.shape({
    usedPackages: PropTypes.object,
    usedValidPackages: PropTypes.object,
    totalPackages: PropTypes.object,
  }),
  userRole: PropTypes.string,
};

export default AdminCharts;
