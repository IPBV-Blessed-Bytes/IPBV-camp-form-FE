import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminPackageCard from '../AdminComponents/adminPackageCard';
import AdminExternalLinkRow from '../AdminComponents/adminExternalLinkRow';
import privateFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config/index';
import Loading from '@/components/Loading';
import Icons from '@/components/Icons';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';
import AdminSessionCard from '../AdminComponents/adminSessionCard';

const AdminLoggedIn = ({
  loggedInUsername,
  handleLogout,
  totalRegistrationsGlobal,
  userRole,
  sendLoggedMessage,
  setSendLoggedMessage,
  user,
  totalValidWithBus,
}) => {
  const [loading, setLoading] = useState(true);
  const [availablePackages, setAvailablePackages] = useState({});
  const [totalSeats, setTotalSeats] = useState();
  const [totalBusVacancies, setTotalBusVacancies] = useState();
  const [showSettingsButtons, setShowSettingsButtons] = useState(false);
  const settingsButtonRef = useRef(null);
  const registeredButtonHomePermissions = permissions(userRole, 'registered-button-home');
  const rideButtonHomePermissions = permissions(userRole, 'ride-button-home');
  const couponButtonHomePermissions = permissions(userRole, 'coupon-button-home');
  const aggregateButtonHomePermissions = permissions(userRole, 'aggregate-button-home');
  const feedbackButtonHomePermissions = permissions(userRole, 'feedback-button-home');
  const settingsButtonPermissions = permissions(userRole, 'settings-button-home');
  const packagesAndTotalCardsPermissions = permissions(userRole, 'packages-and-totals-cards-home');
  const utilitiesLinksPermissions = permissions(userRole, 'utilities-links-home');
  const checkinPermissions = permissions(userRole, 'checkin');
  const splitedLoggedInUsername = loggedInUsername.split('@')[0];

  const navigate = useNavigate();

  const handleTableClick = () => {
    navigate('/admin/tabela');
  };

  const handleRideClick = () => {
    navigate('/admin/carona');
  };

  const handleCouponsClick = () => {
    navigate('/admin/cupom');
  };

  const handleAggregateClick = () => {
    navigate('/admin/agregado');
  };

  const handleCheckinClick = () => {
    navigate('/admin/checkin');
  };

  const handleFeedbackClick = () => {
    navigate('/admin/opiniao');
  };

  useEffect(() => {
    if (sendLoggedMessage) {
      registerLog('Usuário logou', user);

      setSendLoggedMessage(false);
    }
  }, [sendLoggedMessage, setSendLoggedMessage, user]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await privateFetcher.get(`${BASE_URL}/package-count`);
        setAvailablePackages(response.data);
        setTotalSeats(response.data.totalSeats);
        setTotalBusVacancies(response.data.totalBusVacancies);
      } catch (error) {
        console.error('Erro ao buscar os pacotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsButtonRef.current && !settingsButtonRef.current.contains(event.target)) {
        setShowSettingsButtons(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsButtonRef]);

  const toggleSettingsButtons = () => {
    setShowSettingsButtons(!showSettingsButtons);
  };

  const totalRegistrations = totalRegistrationsGlobal.totalRegistrations;
  const totalValidRegistrations = totalRegistrationsGlobal.totalValidRegistrations;
  const totalChildren = totalRegistrationsGlobal.totalChildren;
  const totalAdultsNonPaid = totalRegistrationsGlobal.totalAdultsNonPaid;

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
    availablePackagesUsedValid?.seminaryIndividualWithBusWithFood +
    availablePackagesUsedValid?.seminaryIndividualWithoutBusWithFood;

  const seminaryRemainingVacanciesSum = availablePackagesTotal?.seminary - seminaryFilledVacanciesSum;

  const otherFilledVacanciesSum =
    availablePackagesUsedValid?.otherWithBusWithFood + availablePackagesUsedValid?.otherWithoutBusWithoutFood;

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
      title: 'Total de Inscritos Geral',
      filledVacancies: totalRegistrations || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos',
      remainingVacancies: totalSeats - totalValidRegistrations || '0',
      filledVacancies: totalValidRegistrations || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Total de Inscritos com Ônibus',
      remainingVacancies: totalBusVacancies - totalValidWithBus || '0',
      filledVacancies: totalValidWithBus || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Total de Crianças',
      filledVacancies: totalChildren || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Adultos Não Pagantes',
      filledVacancies: totalAdultsNonPaid || '0',
      showRemainingVacancies: false,
    },
  ];

  return (
    <>
      <Row className="mb-3">
        <Col className="admin-custom-col">
          <Button
            variant="danger"
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
            !
          </p>
          <Button variant="secondary" onClick={handleLogout}>
            <Icons typeIcon="logout" iconSize={20} fill="#fff" />
            &nbsp;Desconectar
          </Button>
        </Col>
      </Row>

      <Row className="mb-md-5 navigation-header">
        <AdminSessionCard
          permission={registeredButtonHomePermissions}
          onClick={handleTableClick}
          cardType="registered-card"
          title="Inscritos"
          typeIcon="person"
          iconSize={40}
        />

        <AdminSessionCard
          permission={rideButtonHomePermissions}
          onClick={handleRideClick}
          cardType="ride-card"
          title="Caronas"
          typeIcon="ride"
          iconSize={50}
        />

        <AdminSessionCard
          permission={couponButtonHomePermissions}
          onClick={handleCouponsClick}
          cardType="coupons-card"
          title="Cupons"
          typeIcon="coupon"
          iconSize={50}
        />

        <AdminSessionCard
          permission={aggregateButtonHomePermissions}
          onClick={handleAggregateClick}
          cardType="aggregate-card"
          title="Agregados"
          typeIcon="aggregate"
          iconSize={50}
        />

        <AdminSessionCard
          permission={feedbackButtonHomePermissions}
          onClick={handleFeedbackClick}
          cardType="feedback-card"
          title="Feedbacks"
          typeIcon="feedback"
          iconSize={50}
        />

        <AdminSessionCard
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
          {!loading && (
            <>
              <Row>
                <h4 className="text-center fw-bold mb-4">PACOTES:</h4>
                {packageCardsData.map((card) => (
                  <AdminPackageCard key={card.title} {...card} cardType="package-card" />
                ))}
              </Row>

              <Row className="mt-4">
                <h4 className="text-center fw-bold mb-4">TOTAL:</h4>
                {totalCardsData.map((card) => (
                  <AdminPackageCard key={card.title} {...card} cardType="total-card" />
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
        </>
      )}

      {settingsButtonPermissions && (
        <button ref={settingsButtonRef} className="settings-btn" onClick={toggleSettingsButtons}>
          <Icons typeIcon="settings" iconSize={45} fill={'#fff'} />
        </button>
      )}

      <div className={`settings-floating-buttons ${showSettingsButtons ? 'show' : ''}`}>
        <button className="settings-message-button" onClick={() => navigate('/admin/logs')}>
          Logs de Usuários&nbsp;
          <Icons className="settings-icons" typeIcon="logs" iconSize={25} fill={'#fff'} />
        </button>

        <button className="settings-message-button" onClick={() => navigate('/admin/vagas')}>
          Controle de Vagas&nbsp;
          <Icons className="settings-icons" typeIcon="camp" iconSize={25} fill={'#fff'} />
        </button>

        <button className="settings-message-button" onClick={() => navigate('/admin/usuarios')}>
          Controle de Usuários&nbsp;
          <Icons className="settings-icons" typeIcon="add-person" iconSize={25} fill={'#fff'} />
        </button>
      </div>

      <Loading loading={loading} />

      {utilitiesLinksPermissions && (
        <Row>
          <AdminExternalLinkRow />
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
};

export default AdminLoggedIn;
