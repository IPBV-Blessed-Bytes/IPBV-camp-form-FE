import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import fetcher from '@/fetchers/fetcherWithCredentials';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import { permissionsSections } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import PackageCard from '@/components/Admin/PackageCard';
import ExternalLinkRow from '@/components/Admin/ExternalLinkRow';
import SessionCard from '@/components/Admin/SessionCard';
import SideButtons from '@/components/Admin/SideButtons';

const AdminLoggedIn = ({
  availablePackages,
  loggedInUsername,
  logout,
  sendLoggedMessage,
  setSendLoggedMessage,
  spinnerLoading,
  totalBusVacancies,
  totalRegistrations,
  totalSeats,
  user,
  userRole,
}) => {
  const {
    registeredButtonHomePermissions,
    rideButtonHomePermissions,
    discountButtonHomePermissions,
    roomsButtonHomePermissions,
    teamsButtonHomePermissions,
    feedbackButtonHomePermissions,
    settingsButtonPermissions,
    packagesAndTotalCardsPermissions,
    dataPanelButtonPermissions,
    utilitiesLinksPermissions,
    checkinPermissions,
  } = permissionsSections(userRole);

  const [filteredCountNonPayingChildren, setFilteredCountNonPayingChildren] = useState([]);
  const [crewBusUsers, setCrewBusUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const splitedLoggedInUsername = loggedInUsername.split('@')[0];

  const { formContext } = useContext(AuthContext);
  const navigate = useNavigate();

  scrollUp();

  useEffect(() => {
    const fetchAdminHomeCounters = async () => {
      setLoading(true);

      try {
        const [nonPayingChildrenRes, crewBusRes] = await Promise.all([
          fetcher.get('/non-paying-children'),
          fetcher.get('/crew-bus'),
        ]);

        setFilteredCountNonPayingChildren(nonPayingChildrenRes.data?.quantity || 0);
        setCrewBusUsers(crewBusRes.data?.quantity || 0);
      } catch (error) {
        console.error('Erro ao buscar contadores do admin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminHomeCounters();
  }, []);

  useEffect(() => {
    if (sendLoggedMessage) {
      registerLog('Usuário logou', user);

      setSendLoggedMessage(false);
    }
  }, [sendLoggedMessage, setSendLoggedMessage, user]);

  const totalRegistrationsGlobal = totalRegistrations.totalRegistrations;
  const totalValidRegistrations = totalRegistrations.totalValidRegistrations;
  const totalChildren = totalRegistrations.totalChildren;
  const totalAdultsNonPaid = totalRegistrations.totalAdultsNonPaid;
  const totalAdultsPaid = totalValidRegistrations - totalAdultsNonPaid;

  const usedPackages = availablePackages?.usedPackages || {};
  const usedValidPackages = availablePackages?.usedValidPackages || {};
  const pendingPackages = availablePackages?.pendingPackages || {};
  const totalPackages = availablePackages?.totalPackages || {};

  // Valid Packages
  const familyCollegeValidFilledVacancies =
    Number(usedValidPackages['host-college-family'] || 0) + Number(pendingPackages['host-college-family'] || 0);

  const collectiveValidFilledVacancies =
    Number(usedValidPackages['host-college-collective'] || 0) + Number(pendingPackages['host-college-collective'] || 0);

  const campingValidFilledVacancies =
    Number(usedValidPackages['host-college-camping'] || 0) + Number(pendingPackages['host-college-camping'] || 0);

  const seminaryValidFilledVacancies =
    Number(usedValidPackages['host-seminario'] || 0) + Number(pendingPackages['host-seminario'] || 0);

  const externalValidFilledVacancies =
    Number(usedValidPackages['host-external'] || 0) + Number(pendingPackages['host-external'] || 0);

  const familyCollegeValidRemaining = (totalPackages?.schoolFamily || 0) - familyCollegeValidFilledVacancies;
  const collectiveValidRemaining = (totalPackages?.schoolIndividual || 0) - collectiveValidFilledVacancies;
  const campingValidRemaining = (totalPackages?.schoolCamping || 0) - campingValidFilledVacancies;
  const seminaryValidRemaining = (totalPackages?.seminary || 0) - seminaryValidFilledVacancies;
  const externalValidRemaining = (totalPackages?.other || 0) - externalValidFilledVacancies;

  const validPackageCardsData = [
    {
      title: 'Colégio Coletivo',
      remainingVacancies: Math.max(collectiveValidRemaining, 0),
      filledVacancies: collectiveValidFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Família',
      remainingVacancies: Math.max(familyCollegeValidRemaining, 0),
      filledVacancies: familyCollegeValidFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Camping',
      remainingVacancies: Math.max(campingValidRemaining, 0),
      filledVacancies: campingValidFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Seminário',
      remainingVacancies: Math.max(seminaryValidRemaining, 0),
      filledVacancies: seminaryValidFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Hospedagem Externa',
      remainingVacancies: Math.max(externalValidRemaining, 0),
      filledVacancies: externalValidFilledVacancies,
      showRemainingVacancies: true,
    },
  ];

  // All Packages
  const familyCollegeAllFilledVacancies =
    Number(usedPackages['host-college-family'] || 0) + Number(pendingPackages['host-college-family'] || 0);

  const collectiveAllFilledVacancies =
    Number(usedPackages['host-college-collective'] || 0) + Number(pendingPackages['host-college-collective'] || 0);

  const campingAllFilledVacancies =
    Number(usedPackages['host-college-camping'] || 0) + Number(pendingPackages['host-college-camping'] || 0);

  const seminaryAllFilledVacancies =
    Number(usedPackages['host-seminario'] || 0) + Number(pendingPackages['host-seminario'] || 0);

  const externalAllFilledVacancies =
    Number(usedPackages['host-external'] || 0) + Number(pendingPackages['host-external'] || 0);

  const familyCollegeAllRemaining = (totalPackages?.schoolFamily || 0) - familyCollegeAllFilledVacancies;
  const collectiveAllRemaining = (totalPackages?.schoolIndividual || 0) - collectiveAllFilledVacancies;
  const campingAllRemaining = (totalPackages?.schoolCamping || 0) - campingAllFilledVacancies;
  const seminaryAllRemaining = (totalPackages?.seminary || 0) - seminaryAllFilledVacancies;
  const externalAllRemaining = (totalPackages?.other || 0) - externalAllFilledVacancies;

  const allPackageCardsData = [
    {
      title: 'Colégio Coletivo',
      remainingVacancies: Math.max(collectiveAllRemaining, 0),
      filledVacancies: collectiveAllFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Família',
      remainingVacancies: Math.max(familyCollegeAllRemaining, 0),
      filledVacancies: familyCollegeAllFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Camping',
      remainingVacancies: Math.max(campingAllRemaining, 0),
      filledVacancies: campingAllFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Seminário',
      remainingVacancies: Math.max(seminaryAllRemaining, 0),
      filledVacancies: seminaryAllFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Hospedagem Externa',
      remainingVacancies: Math.max(externalAllRemaining, 0),
      filledVacancies: externalAllFilledVacancies,
      showRemainingVacancies: true,
    },
  ];

  // Food and Bus Packages
  const withFoodFilledVacancies = Number(usedPackages['food-complete'] || 0);
  const noFoodFilledVacancies = Number(usedPackages['no-food'] || 0);
  const busYesFilledVacancies = Number(usedValidPackages['bus-yes'] || 0) + Number(pendingPackages['bus-yes'] || 0);

  const totalCardsData = [
    {
      title: 'Total de Crianças Pagantes',
      filledVacancies: Number(totalChildren - filteredCountNonPayingChildren) || 0,
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Crianças Não Pagantes',
      filledVacancies: Number(filteredCountNonPayingChildren) || 0,
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Crianças',
      filledVacancies: Number(totalChildren) || 0,
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos Pagantes',
      filledVacancies: Number(totalAdultsPaid) || 0,
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos Não Pagantes',
      filledVacancies: Number(totalAdultsNonPaid) || 0,
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos',
      remainingVacancies: Number(totalSeats - totalValidRegistrations) || 0,
      filledVacancies: Number(totalValidRegistrations) || 0,
      showRemainingVacancies: true,
    },
    {
      title: 'Total de Inscritos Geral',
      filledVacancies: Number(totalRegistrationsGlobal) || 0,
      showRemainingVacancies: false,
    },
    {
      title: 'Ônibus Geral',
      remainingVacancies: Math.max(Number(totalBusVacancies - busYesFilledVacancies) || 0, 0),
      filledVacancies: Number(busYesFilledVacancies) || 0,
      showRemainingVacancies: true,
    },
    {
      title: 'Ônibus Equipe',
      remainingVacancies: Math.max(Number(22 - crewBusUsers) || 0, 0),
      filledVacancies: Number(crewBusUsers) || 0,
      showRemainingVacancies: true,
    },
    {
      title: 'Total com Alimentação',
      filledVacancies: withFoodFilledVacancies,
      showRemainingVacancies: false,
    },
    {
      title: 'Total sem Alimentação',
      filledVacancies: noFoodFilledVacancies,
      showRemainingVacancies: false,
    },
  ];

  const handleTableClick =
    formContext === 'maintenance' ? () => navigate('/dev/acampantes') : () => navigate('/admin/acampantes');

  const handleRideClick =
    formContext === 'maintenance' ? () => navigate('/dev/carona') : () => navigate('/admin/carona');

  const handleDiscountClick =
    formContext === 'maintenance' ? () => navigate('/dev/descontos') : () => navigate('/admin/descontos');

  const handleRoomsClick =
    formContext === 'maintenance' ? () => navigate('/dev/quartos') : () => navigate('/admin/quartos');

  const handleTeamsClick =
    formContext === 'maintenance' ? () => navigate('/dev/times') : () => navigate('/admin/times');

  const handleCheckinClick =
    formContext === 'maintenance' ? () => navigate('/dev/checkin') : () => navigate('/admin/checkin');

  const handleFeedbackClick =
    formContext === 'maintenance' ? () => navigate('/dev/opiniao') : () => navigate('/admin/opiniao');

  return (
    <>
      <Row className="mb-3">
        <Col className="admin-custom-col">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <Icons typeIcon="arrow-left" iconSize={30} fill="#fff" />
            &nbsp;Voltar <span className="d-sm-inline d-none">pro Formulário</span>
          </Button>
        </Col>
        <Col className="admin-custom-col text-end mb-2 mt-3 mt-lg-0">
          <p>
            Bem vindo(a),
            <span>
              <strong className="text-uppercase"> {splitedLoggedInUsername}</strong>
            </span>
            &ldquo;
          </p>
          <Button variant="danger" onClick={logout}>
            <Icons typeIcon="logout" iconSize={20} fill="#fff" />
            &nbsp;Desconectar
          </Button>
        </Col>
      </Row>

      <Row className="mb-md-5 navigation-header">
        <SessionCard
          permission={registeredButtonHomePermissions}
          onClick={handleTableClick}
          cardType="registered-card"
          title="Inscritos"
          typeIcon="person"
          iconSize={40}
        />

        <SessionCard
          permission={rideButtonHomePermissions}
          onClick={handleRideClick}
          cardType="ride-card"
          title="Caronas"
          typeIcon="ride"
          iconSize={50}
        />

        <SessionCard
          permission={discountButtonHomePermissions}
          onClick={handleDiscountClick}
          cardType="discount-card"
          title="Descontos"
          typeIcon="discount"
          iconSize={50}
        />

        <SessionCard
          permission={roomsButtonHomePermissions}
          onClick={handleRoomsClick}
          cardType="rooms-card"
          title="Quartos"
          typeIcon="rooms"
          iconSize={50}
        />

        <SessionCard
          permission={teamsButtonHomePermissions}
          onClick={handleTeamsClick}
          cardType="teams-card"
          title="Times"
          typeIcon="team"
          iconSize={50}
        />

        <SessionCard
          permission={feedbackButtonHomePermissions}
          onClick={handleFeedbackClick}
          cardType="feedback-card"
          title="Feedbacks"
          typeIcon="feedback"
          iconSize={50}
        />

        <SessionCard
          permission={checkinPermissions}
          onClick={handleCheckinClick}
          cardType="checkin-card"
          title="Check-in"
          typeIcon="checkin"
          iconSize={50}
        />
      </Row>

      {packagesAndTotalCardsPermissions && (
        <>
          {!spinnerLoading && !loading && (
            <>
              <Row>
                <h4 className="text-center fw-bold mb-4">PACOTES (válidos):</h4>
                {validPackageCardsData.map((card) => (
                  <PackageCard key={card.title} {...card} cardType="valid-package-card" />
                ))}
              </Row>

              <Row className="mt-4">
                <h4 className="text-center fw-bold mb-4">PACOTES (todos):</h4>
                {allPackageCardsData.map((card) => (
                  <PackageCard key={card.title} {...card} cardType="all-package-card" />
                ))}
              </Row>

              <Row className="mt-4">
                <h4 className="text-center fw-bold mb-4">TOTAL:</h4>
                {totalCardsData.map((card) => (
                  <PackageCard key={card.title} {...card} cardType="total-card" />
                ))}
              </Row>
            </>
          )}

          <div className="packages-horizontal-line" />
          <h4>Notas:</h4>
          <div>
            <ul>
              <li>
                <em>
                  <b>Total de Inscritos Geral</b>
                </em>
                : Contagem de adultos e crianças
              </li>
              <li>
                <em>
                  <b>Total de Adultos</b>
                </em>
                : Contagem de adultos
              </li>
              <li>
                <em>
                  <b>Total de Crianças</b>
                </em>
                : Contagem de crianças
              </li>
              <li>
                <em>
                  <b>Total de Inscritos Com Ônibus</b>
                </em>
                : Contagem de pessoas válidas que irão de ônibus
              </li>
            </ul>
          </div>
          <div className="packages-horizontal-line" />
        </>
      )}

      <SideButtons primaryPermission={dataPanelButtonPermissions} secondaryPermission={settingsButtonPermissions} />

      <Loading loading={spinnerLoading || loading} />

      {utilitiesLinksPermissions && (
        <Row>
          <ExternalLinkRow />
        </Row>
      )}
    </>
  );
};

AdminLoggedIn.propTypes = {
  availablePackages: PropTypes.shape({
    usedPackages: PropTypes.object,
    usedValidPackages: PropTypes.object,
    totalPackages: PropTypes.shape({
      schoolIndividual: PropTypes.number,
      schoolFamily: PropTypes.number,
      schoolCamping: PropTypes.number,
      seminary: PropTypes.number,
      other: PropTypes.number,
    }),
  }),
  loggedInUsername: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  user: PropTypes.string,
  totalValidWithBus: PropTypes.number,
  totalRegistrations: PropTypes.shape({
    totalRegistrations: PropTypes.number,
    totalChildren: PropTypes.number,
    totalFilledVacancies: PropTypes.number,
    totalValidRegistrations: PropTypes.number,
    totalAdultsNonPaid: PropTypes.number,
  }).isRequired,
  sendLoggedMessage: PropTypes.bool,
  setSendLoggedMessage: PropTypes.func,
  spinnerLoading: PropTypes.bool,
  totalBusVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalSeats: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  userRole: PropTypes.string,
};

export default AdminLoggedIn;
