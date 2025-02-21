import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import fetcher from '@/fetchers/fetcherWithCredentials';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import PackageCard from '@/components/Admin/PackageCard';
import ExternalLinkRow from '@/components/Admin/ExternalLinkRow';
import SessionCard from '@/components/Admin/SessionCard';
import SideButtons from '@/components/Admin/SideButtons';

const AdminLoggedIn = ({
  loggedInUsername,
  handleLogout,
  totalRegistrationsGlobal,
  userRole,
  sendLoggedMessage,
  setSendLoggedMessage,
  user,
  totalValidWithBus,
  availablePackages,
  totalSeats,
  totalBusVacancies,
  spinnerLoading,
}) => {
  const [filteredChildrenCount, setFilteredChildrenCount] = useState([]);
  const registeredButtonHomePermissions = permissions(userRole, 'registered-button-home');
  const rideButtonHomePermissions = permissions(userRole, 'ride-button-home');
  const discountButtonHomePermissions = permissions(userRole, 'discount-button-home');
  const roomsButtonHomePermissions = permissions(userRole, 'rooms-button-home');
  const feedbackButtonHomePermissions = permissions(userRole, 'feedback-button-home');
  const extraMealsButtonHomePermissions = permissions(userRole, 'extra-meals-button-home');
  const settingsButtonPermissions = permissions(userRole, 'settings-button-home');
  const packagesAndTotalCardsPermissions = permissions(userRole, 'packages-and-totals-cards-home');
  const dataPanelButtonPermissions = permissions(userRole, 'data-panel-button-home');
  const utilitiesLinksPermissions = permissions(userRole, 'utilities-links-home');
  const checkinPermissions = permissions(userRole, 'checkin');
  const splitedLoggedInUsername = loggedInUsername.split('@')[0];

  useEffect(() => {
    const fetchCampers = async () => {
      try {
        const response = await fetcher.get('camper', { params: { size: 100000 } });
        if (Array.isArray(response.data.content)) {
          const filteredCampers = response.data.content.filter(
            (camper) =>
              camper.formPayment?.formPayment === 'nonPaid' && camper.personalInformation?.gender === 'Crianca',
          );

          setFilteredChildrenCount(filteredCampers.length);
        } else {
          console.error('Erro: Dados não estão no formato esperado.');
        }
      } catch (error) {
        console.error('Erro ao buscar usuários pagos:', error);
      }
    };
    fetchCampers();
  }, []);

  const navigate = useNavigate();

  const handleTableClick = () => {
    navigate('/admin/acampantes');
  };

  const handleRideClick = () => {
    navigate('/admin/carona');
  };

  const handleDiscountClick = () => {
    navigate('/admin/descontos');
  };

  const handleRoomsClick = () => {
    navigate('/admin/quartos');
  };

  const handleCheckinClick = () => {
    navigate('/admin/checkin');
  };

  const handleFeedbackClick = () => {
    navigate('/admin/opiniao');
  };

  const handleExtraMealsClick = () => {
    navigate('/admin/alimentacao');
  };
  scrollUp();

  useEffect(() => {
    if (sendLoggedMessage) {
      registerLog('Usuário logou', user);

      setSendLoggedMessage(false);
    }
  }, [sendLoggedMessage, setSendLoggedMessage, user]);

  const totalRegistrations = totalRegistrationsGlobal.totalRegistrations;
  const totalValidRegistrations = totalRegistrationsGlobal.totalValidRegistrations;
  const totalChildren = totalRegistrationsGlobal.totalChildren;
  const totalAdultsNonPaid = totalRegistrationsGlobal.totalAdultsNonPaid;
  const totalAdultsPaid = totalValidRegistrations - totalAdultsNonPaid;

  const availablePackagesUsedValid = availablePackages.usedValidPackages;
  const availablePackagesTotal = availablePackages.totalPackages || {};

  const individualSchoolFilledVacanciesSum =
    availablePackagesUsedValid?.schoolIndividualWithBusWithFood +
    availablePackagesUsedValid?.schoolIndividualWithBusWithoutFood +
    availablePackagesUsedValid?.schoolIndividualWithoutBusWithFood +
    availablePackagesUsedValid?.schoolIndividualWithoutBusWithoutFood;

  const individualSchoolRemainingVacanciesSum =
    availablePackagesTotal?.schoolIndividual - individualSchoolFilledVacanciesSum;

  const familySchoolFilledVacanciesSum =
    availablePackagesUsedValid?.schoolFamilyWithBusWithFood +
    availablePackagesUsedValid?.schoolFamilyWithBusWithoutFood +
    availablePackagesUsedValid?.schoolFamilyWithoutBusWithFood +
    availablePackagesUsedValid?.schoolFamilyWithoutBusWithoutFood;

  const familySchoolRemainingVacanciesSum = availablePackagesTotal?.schoolFamily - familySchoolFilledVacanciesSum;

  const campingSchoolFilledVacanciesSum =
    availablePackagesUsedValid?.schoolCampingWithoutBusWithFood +
    availablePackagesUsedValid?.schoolCampingWithoutBusWithoutFood;

  const campingSchoolRemainingVacanciesSum = availablePackagesTotal?.schoolCamping - campingSchoolFilledVacanciesSum;

  const seminaryFilledVacanciesSum =
    availablePackagesUsedValid?.seminaryWithBusWithFood + availablePackagesUsedValid?.seminaryWithoutBusWithFood;

  const seminaryRemainingVacanciesSum = availablePackagesTotal?.seminary - seminaryFilledVacanciesSum;

  const otherFilledVacanciesSum =
    availablePackagesUsedValid?.otherWithBusWithFood +
    availablePackagesUsedValid?.otherWithoutBusWithFood +
    availablePackagesUsedValid?.otherWithoutBusWithoutFood;

  const otherRemainingVacanciesSum = availablePackagesTotal?.other - otherFilledVacanciesSum;

  const packageCardsData = [
    {
      title: 'Colégio Individual',
      remainingVacancies: individualSchoolRemainingVacanciesSum || '0',
      filledVacancies: individualSchoolFilledVacanciesSum || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Família',
      remainingVacancies: familySchoolRemainingVacanciesSum || '0',
      filledVacancies: familySchoolFilledVacanciesSum || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Camping',
      remainingVacancies: campingSchoolRemainingVacanciesSum || '0',
      filledVacancies: campingSchoolFilledVacanciesSum || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Seminário',
      remainingVacancies: seminaryRemainingVacanciesSum || '0',
      filledVacancies: seminaryFilledVacanciesSum || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Outra Acomodação',
      remainingVacancies: otherRemainingVacanciesSum || '0',
      filledVacancies: otherFilledVacanciesSum || '0',
      showRemainingVacancies: true,
    },
  ];

  const totalCardsData = [
    {
      title: 'Total de Crianças Pagantes',
      filledVacancies: totalChildren - filteredChildrenCount || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Crianças Não Pagantes',
      filledVacancies: filteredChildrenCount || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Crianças',
      filledVacancies: totalChildren || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos Pagantes',
      filledVacancies: totalAdultsPaid || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos Não Pagantes',
      filledVacancies: totalAdultsNonPaid || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos',
      remainingVacancies: totalSeats - totalValidRegistrations || '0',
      filledVacancies: totalValidRegistrations || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Total de Inscritos Geral',
      filledVacancies: totalRegistrations || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Inscritos com Ônibus',
      remainingVacancies: totalBusVacancies - totalValidWithBus || '0',
      filledVacancies: totalValidWithBus || '0',
      showRemainingVacancies: true,
    },
  ];

  return (
    <>
      <Row className="mb-3">
        <Col className="admin-custom-col">
          <Button
            variant="secondary"
            onClick={() => {
              navigate('/');
            }}
          >
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
          <Button variant="danger" onClick={handleLogout}>
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
          permission={extraMealsButtonHomePermissions}
          onClick={handleExtraMealsClick}
          cardType="extra-meals-card"
          title="Alimentação Extra"
          typeIcon="food"
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
  loggedInUsername: PropTypes.string.isRequired,
  handleLogout: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  sendLoggedMessage: PropTypes.bool,
  setSendLoggedMessage: PropTypes.func,
  user: PropTypes.string,
  totalValidWithBus: PropTypes.number,
  totalRegistrationsGlobal: PropTypes.shape({
    totalRegistrations: PropTypes.number,
    totalChildren: PropTypes.number,
    totalFilledVacancies: PropTypes.number,
    totalValidRegistrations: PropTypes.number,
    totalAdultsNonPaid: PropTypes.number,
  }).isRequired,
  availablePackages: PropTypes.shape({
    usedValidPackages: PropTypes.shape({
      schoolIndividualWithBusWithFood: PropTypes.number,
      schoolIndividualWithBusWithoutFood: PropTypes.number,
      schoolIndividualWithoutBusWithFood: PropTypes.number,
      schoolIndividualWithoutBusWithoutFood: PropTypes.number,
      schoolFamilyWithBusWithFood: PropTypes.number,
      schoolFamilyWithBusWithoutFood: PropTypes.number,
      schoolFamilyWithoutBusWithFood: PropTypes.number,
      schoolFamilyWithoutBusWithoutFood: PropTypes.number,
      schoolCampingWithoutBusWithFood: PropTypes.number,
      schoolCampingWithoutBusWithoutFood: PropTypes.number,
      seminaryWithBusWithFood: PropTypes.number,
      seminaryWithoutBusWithFood: PropTypes.number,
      otherWithBusWithFood: PropTypes.number,
      otherWithoutBusWithFood: PropTypes.number,
      otherWithoutBusWithoutFood: PropTypes.number,
    }).isRequired,
    totalPackages: PropTypes.number.isRequired,
  }).isRequired,
  totalSeats: PropTypes.number.isRequired,
  totalBusVacancies: PropTypes.number.isRequired,
  spinnerLoading: PropTypes.bool.isRequired,
};

export default AdminLoggedIn;
