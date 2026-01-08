import { useState, useEffect } from 'react';
import { Container, Accordion, Row, Col, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { permissions } from '@/fetchers/permissions';
import PropTypes from 'prop-types';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import CheckinBalance from '@/components/Admin/CheckinBalance';
import VacanciesProgression from '@/components/Admin/VacanciesProgression';

const COLORS = ['#204691', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#F44336', '#607D8B'];

const labelMap = {
  'host-college-family': 'Colégio Família',
  'host-college-camping': 'Colégio Camping',
  'host-college-collective': 'Colégio Individual',
  'host-external': 'Externo',
  'host-seminario': 'Seminário',
};

const translateLabel = (key) => labelMap[key] || key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const AdminDataPanel = ({ totalPackages, usedPackages, userRole }) => {
  const [loading, setLoading] = useState(true);
  const [fillingVacancies, setFillingVacancies] = useState();
  const [packageData, setPackageData] = useState(null);

  const vacanciesProgressionPermissions = permissions(userRole, 'vacancies-progression-panel');
  const checkinBalancePermissions = permissions(userRole, 'checkin-balance-panel');
  const filledVacanciesChartPermissions = permissions(userRole, 'filled-vacancies-chart-panel');
  const allInfoChartPermissions = permissions(userRole, 'all-info-chart-panel');

  scrollUp();

  useEffect(() => {
    const extractCheckinAndAccommodation = (data) => {
      if (!Array.isArray(data)) {
        console.error('Data received is not an array:', data);
        return [];
      }

      return data
        .filter((camper) => camper.checkin === true)
        .map((camper) => ({
          checkin: camper.checkin,
          accomodationName: camper.package?.accomodationName || 'Desconhecido',
        }));
    };

    const fetchCampers = async () => {
      try {
        const response = await fetcher.get('camper', {
          params: { size: 100000 },
        });

        if (Array.isArray(response.data.content)) {
          const checkinData = extractCheckinAndAccommodation(response.data.content);
          setFillingVacancies(checkinData);
        }
      } catch (error) {
        console.error('Error fetching campers:', error);
      }
    };

    fetchCampers();
  }, []);

  useEffect(() => {
    const fetchPieData = async () => {
      try {
        const [packageRes] = await Promise.all([fetcher.get('/package-count'), fetcher.get('/total-registrations')]);

        setPackageData({
          usedPackages: packageRes.data?.usedPackages || {},
          usedValidPackages: packageRes.data?.usedValidPackages || {},
        });
      } catch (error) {
        console.error('Erro ao buscar dados do Pie Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPieData();
  }, []);

  if (loading) return <Loading loading={true} />;

  if (!packageData) return <p>Não foi possível carregar os dados dos pacotes.</p>;

  const { usedPackages: usedPk, usedValidPackages: usedValidPk } = packageData;

  const usedPackagesData = Object.entries(usedPk || {})
    .filter(([key]) => !['food-complete', 'no-food', 'bus-yes', 'bus-no'].includes(key))
    .map(([key, value]) => ({ name: translateLabel(key), value }));

  const usedValidData = Object.entries(usedValidPk || {})
    .filter(([key]) => !['food-complete', 'no-food', 'bus-yes', 'bus-no'].includes(key))
    .map(([key, value]) => ({ name: translateLabel(key), value }));

  const schoolPackagesData = [
    { name: 'Colégio Família', value: usedPk['host-college-family'] || 0 },
    { name: 'Colégio Camping', value: usedPk['host-college-camping'] || 0 },
    { name: 'Colégio Individual', value: usedPk['host-college-collective'] || 0 },
  ];

  const foodData = [
    { name: 'Com Alimentação', value: usedPk['food-complete'] || 0 },
    { name: 'Sem Alimentação', value: usedPk['no-food'] || 0 },
  ];

  const busData = [
    { name: 'Com Ônibus', value: usedPk['bus-yes'] || 0 },
    { name: 'Sem Ônibus', value: usedPk['bus-no'] || 0 },
  ];

  const renderPieChart = (title, data) => (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title className="text-center mb-3">{title}</Card.Title>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={data} label outerRadius="80%">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid>
      <AdminHeader pageName="Painel de Dados" sessionTypeIcon="chart" iconSize={80} fill={'#007185'} />

      {vacanciesProgressionPermissions && (
        <Accordion className="mb-3">
          <Accordion.Header>Gráfico de Avanço de Inscrições</Accordion.Header>
          <Accordion.Body>
            <VacanciesProgression usedValidPackages={usedPackagesData} totalPackages={totalPackages} />
          </Accordion.Body>
        </Accordion>
      )}

      {checkinBalancePermissions && (
        <Accordion className="mb-3">
          <Accordion.Header>Gráfico de Avanço de Check-in</Accordion.Header>
          <Accordion.Body>
            <CheckinBalance fillingVacancies={fillingVacancies} usedPackages={usedPackages} />
          </Accordion.Body>
        </Accordion>
      )}

      {filledVacanciesChartPermissions && (
        <Accordion className="mb-3">
          <Accordion.Header>Gráfico de Vagas Preenchidas</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6}>{renderPieChart('Vagas Preenchidas', usedPackagesData)}</Col>
              <Col md={6}>{renderPieChart('Adultos Pagantes', usedValidData)}</Col>
            </Row>
          </Accordion.Body>
        </Accordion>
      )}

      {allInfoChartPermissions && (
        <Accordion className="mb-3">
          <Accordion.Header>Gráfico de Colégio, Alimentação e Ônibus</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6}>{renderPieChart('Colégio (Família / Camping / Individual)', schoolPackagesData)}</Col>
              <Col md={6}>{renderPieChart('Com e Sem Alimentação', foodData)}</Col>
            </Row>
            <Row>
              <Col md={{ span: 6, offset: 3 }}>{renderPieChart('Com e Sem Ônibus', busData)}</Col>
            </Row>
          </Accordion.Body>
        </Accordion>
      )}

      <Loading loading={loading} />
    </Container>
  );
};

AdminDataPanel.propTypes = {
  userRole: PropTypes.string,
  totalPackages: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  usedPackages: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};

export default AdminDataPanel;
