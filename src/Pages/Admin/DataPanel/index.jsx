import { useState, useEffect } from 'react';
import { Container, Accordion } from 'react-bootstrap';
import { BASE_URL } from '@/config/index';
import { permissions } from '@/fetchers/permissions';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/adminHeader';
import CheckinBalance from '@/components/Admin/CheckinBalance';
import VacanciesProgression from '@/components/Admin/VacanciesProgression';

const AdminDataPanel = ({ userRole }) => {
  const [loading, setLoading] = useState(true);
  const [usedValidPackages, setUsedValidPackages] = useState({});
  const [totalPackages, setTotalPackages] = useState(null);
  const [fillingVacancies, setFillingVacancies] = useState();
  const [usedPackages, setUsedPackages] = useState();
  const vacanciesProgressionPermissions = permissions(userRole, 'vacancies-progression-panel');
  const checkinBalancePermissions = permissions(userRole, 'checkin-balance-panel');

  scrollUp();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetcher.get(`${BASE_URL}/package-count`);
        setTotalPackages(response.data?.totalPackages || {});
        setUsedPackages(response.data?.usedPackages || {});
        setUsedValidPackages(response.data?.usedValidPackages || {});
      } catch (error) {
        console.error('Erro ao buscar os pacotes:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

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
          params: {
            size: 100000,
          },
        });

        if (Array.isArray(response.data.content)) {
          const checkinData = extractCheckinAndAccommodation(response.data.content);
          setFillingVacancies(checkinData);
        } else {
          console.error('Data received is not an array:', response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
    fetchCampers();
  }, []);

  return (
    <Container fluid>
      <AdminHeader pageName="Painel de Dados" sessionTypeIcon="chart" iconSize={80} fill={'#204691'} />

      {vacanciesProgressionPermissions && (
        <Accordion className="mb-3">
          <Accordion.Header>Gráfico de Inscrições</Accordion.Header>
          <Accordion.Body>
            <VacanciesProgression usedValidPackages={usedValidPackages} totalPackages={totalPackages} />
          </Accordion.Body>
        </Accordion>
      )}

      {checkinBalancePermissions && (
        <Accordion className="mb-3">
          <Accordion.Header>Gráfico de Check-in</Accordion.Header>
          <Accordion.Body>
            <CheckinBalance fillingVacancies={fillingVacancies} usedPackages={usedPackages} />
          </Accordion.Body>
        </Accordion>
      )}

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminDataPanel;