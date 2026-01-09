import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import fetcher from '@/fetchers/fetcherWithCredentials';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';
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
  const [filteredCountNonPayingChildren, setFilteredCountNonPayingChildren] = useState([]);
  const registeredButtonHomePermissions = permissions(userRole, 'registered-button-home');
  const rideButtonHomePermissions = permissions(userRole, 'ride-button-home');
  const discountButtonHomePermissions = permissions(userRole, 'discount-button-home');
  const roomsButtonHomePermissions = permissions(userRole, 'rooms-button-home');
  const feedbackButtonHomePermissions = permissions(userRole, 'feedback-button-home');
  const settingsButtonPermissions = permissions(userRole, 'settings-button-home');
  const packagesAndTotalCardsPermissions = permissions(userRole, 'packages-and-totals-cards-home');
  const dataPanelButtonPermissions = permissions(userRole, 'data-panel-button-home');
  const utilitiesLinksPermissions = permissions(userRole, 'utilities-links-home');
  const checkinPermissions = permissions(userRole, 'checkin');
  const splitedLoggedInUsername = loggedInUsername.split('@')[0];

  const { formContext } = useContext(AuthContext);
  const navigate = useNavigate();

  scrollUp();

  useEffect(() => {
    const fetchCampers = async () => {
      try {
        const response = await fetcher.get('camper', { params: { size: 100000 } });
        if (Array.isArray(response.data.content)) {
          const filteredCampers = response.data.content.filter(
            (camper) =>
              camper.personalInformation?.gender === 'Crianca' &&
              (camper.totalPrice === '0' || camper.totalPrice === '' || camper.totalPrice === 0),
          );

          setFilteredCountNonPayingChildren(filteredCampers.length);
        } else {
          console.error('Erro: Dados não estão no formato esperado.');
        }
      } catch (error) {
        console.error('Erro ao buscar usuários pagos:', error);
      }
    };
    fetchCampers();
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
  const totalPackages = availablePackages?.totalPackages || {};

  const familyCollegeFilledVacancies = Number(usedPackages['host-college-family'] || 0);
  const collectiveFilledVacancies = Number(usedPackages['host-college-collective'] || 0);
  const campingFilledVacancies = Number(usedPackages['host-college-camping'] || 0);
  const seminaryFilledVacancies = Number(usedPackages['host-seminario'] || 0);
  const externalFilledVacancies = Number(usedPackages['host-external'] || 0);

  const withFoodFilledVacancies = Number(usedPackages['food-complete'] || 0);
  const noFoodFilledVacancies = Number(usedPackages['no-food'] || 0);
  const busYesFilledVacancies = Number(usedPackages['bus-yes'] || 0);

  const familyCollegeRemaining = (totalPackages?.schoolFamily || 0) - familyCollegeFilledVacancies;
  const collectiveRemaining = (totalPackages?.schoolIndividual || 0) - collectiveFilledVacancies;
  const campingRemaining = (totalPackages?.schoolCamping || 0) - campingFilledVacancies;
  const seminaryRemaining = (totalPackages?.seminary || 0) - seminaryFilledVacancies;
  const externalRemaining = (totalPackages?.other || 0) - externalFilledVacancies;

  const packageCardsData = [
    {
      title: 'Colégio Coletivo',
      remainingVacancies: Math.max(collectiveRemaining, 0),
      filledVacancies: collectiveFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Família',
      remainingVacancies: Math.max(familyCollegeRemaining, 0),
      filledVacancies: familyCollegeFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Camping',
      remainingVacancies: Math.max(campingRemaining, 0),
      filledVacancies: campingFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Seminário',
      remainingVacancies: Math.max(seminaryRemaining, 0),
      filledVacancies: seminaryFilledVacancies,
      showRemainingVacancies: true,
    },
    {
      title: 'Hospedagem Externa',
      remainingVacancies: Math.max(externalRemaining, 0),
      filledVacancies: externalFilledVacancies,
      showRemainingVacancies: true,
    },
  ];

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
      title: 'Total de Inscritos com Ônibus',
      remainingVacancies: Number(totalBusVacancies - busYesFilledVacancies) || 0,
      filledVacancies: Number(busYesFilledVacancies) || 0,
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
          {!spinnerLoading && (
            <>
              <Row>
                <h4 className="text-center fw-bold mb-4">PACOTES:</h4>
                {packageCardsData.map((card) => (
                  <PackageCard key={card.title} {...card} cardType="package-card" />
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

      <Loading loading={spinnerLoading} />

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
