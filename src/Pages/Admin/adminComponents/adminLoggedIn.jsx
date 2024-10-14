import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminPackageCard from './adminPackageCard';
import AdminExternalLinkRow from './adminExternalLinkRow';
import privateFetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config/index';
import Loading from '@/components/Loading';
import Icons from '@/components/Icons';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';

const AdminLoggedIn = ({
  loggedInUsername,
  handleLogout,
  totalRegistrationsGlobal,
  userRole,
  sendLoggedMessage,
  setSendLoggedMessage,
  user,
}) => {
  const [loading, setLoading] = useState(true);
  const [availablePackages, setAvailablePackages] = useState(true);
  const [showSettingsButtons, setShowSettingsButtons] = useState(false);
  const settingsButtonRef = useRef(null);
  const registeredButtonHomePermissions = permissions(userRole, 'registered-button-home');
  const rideButtonHomePermissions = permissions(userRole, 'ride-button-home');
  const couponButtonHomePermissions = permissions(userRole, 'coupon-button-home');
  const aggregateButtonHomePermissions = permissions(userRole, 'aggregate-button-home');
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
  const availablePackagesTotal = availablePackages.totalPackages || {};
  const availablePackagesUsed = availablePackages.usedPackages || {};
  const totalVacanciesWithBuses =
    availablePackagesUsed.colegioFamiliaComOnibusComAlimentacao +
      availablePackagesUsed.colegioFamiliaComOnibusSemAlimentacao +
      availablePackagesUsed.colegioIndividualComOnibusComAlimentacao +
      availablePackagesUsed.colegioIndividualComOnibusSemAlimentacao +
      availablePackagesUsed.outroComOnibusComAlimentacao +
      availablePackagesUsed.seminarioIndividualComOnibusComAlimentacao || {};

  const individualSchoolFilledVacanciesSum =
    availablePackagesUsed?.colegioIndividualComOnibusComAlimentacao +
    availablePackagesUsed?.colegioIndividualComOnibusSemAlimentacao +
    availablePackagesUsed?.colegioIndividualSemOnibusComAlimentacao +
    availablePackagesUsed?.colegioIndividualSemOnibusSemAlimentacao;

  const individualSchoolRemainingVacanciesSum =
    availablePackagesTotal?.colegioIndividual - individualSchoolFilledVacanciesSum;

  const familySchoolFilledVacanciesSum =
    availablePackagesUsed?.colegioFamiliaComOnibusComAlimentacao +
    availablePackagesUsed?.colegioFamiliaComOnibusSemAlimentacao +
    availablePackagesUsed?.colegioFamiliaSemOnibusComAlimentacao +
    availablePackagesUsed?.colegioFamiliaSemOnibusSemAlimentacao;

  const familySchoolRemainingVacanciesSum = availablePackagesTotal?.colegioFamilia - familySchoolFilledVacanciesSum;

  const campingSchoolFilledVacanciesSum =
    availablePackagesUsed?.colegioCampingSemOnibusComAlimentacao +
    availablePackagesUsed?.colegioCampingSemOnibusSemAlimentacao;

  const campingSchoolRemainingVacanciesSum = availablePackagesTotal?.colegioCamping - campingSchoolFilledVacanciesSum;

  const seminaryFilledVacanciesSum =
    availablePackagesUsed?.seminarioIndividualComOnibusComAlimentacao +
    availablePackagesUsed?.seminarioIndividualSemOnibusComAlimentacao;

  const seminaryRemainingVacanciesSum = availablePackagesTotal?.seminario - seminaryFilledVacanciesSum;

  const otherFilledVacanciesSum =
    availablePackagesUsed?.outroComOnibusComAlimentacao + availablePackagesUsed?.outroSemOnibusSemAlimentacao;

  const otherRemainingVacanciesSum = availablePackagesTotal?.outro - otherFilledVacanciesSum;

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
      remainingVacancies: 600 - totalValidRegistrations || '0',
      filledVacancies: totalValidRegistrations || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Total de Inscritos com Ônibus',
      remainingVacancies: 98 - totalVacanciesWithBuses || '0',
      filledVacancies: totalVacanciesWithBuses || '0',
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
        {registeredButtonHomePermissions && (
          <Col xs={12} md={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="h-100" onClick={handleTableClick}>
              <Card.Body className="navigation-header__registered-card">
                <Card.Title className="text-center mb-0">
                  <div className="navigation-header__registered-card__content-wrapper">
                    <em>
                      <b>Inscritos</b>
                    </em>
                    <Icons typeIcon="add-person" iconSize={50} fill={'#204691'} />
                  </div>
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        )}
        {rideButtonHomePermissions && (
          <Col xs={12} md={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="h-100" onClick={handleRideClick}>
              <Card.Body className="navigation-header__ride-card">
                <Card.Title className="text-center mb-0">
                  <div className="navigation-header__ride-card__content-wrapper">
                    <em>
                      <b>Caronas</b>
                    </em>
                    <Icons typeIcon="ride" iconSize={50} fill={'#204691'} />
                  </div>
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        )}
        {couponButtonHomePermissions && (
          <Col xs={12} md={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="h-100" onClick={handleCouponsClick}>
              <Card.Body className="navigation-header__coupons-card">
                <Card.Title className="text-center mb-0">
                  <div className="navigation-header__coupons-card__content-wrapper">
                    <em>
                      <b>Cupons</b>
                    </em>
                    <Icons typeIcon="coupon" iconSize={50} fill={'#204691'} />
                  </div>
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        )}
        {aggregateButtonHomePermissions && (
          <Col xs={12} md={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="h-100" onClick={handleAggregateClick}>
              <Card.Body className="navigation-header__aggregate-card">
                <Card.Title className="text-center mb-0">
                  <div className="navigation-header__aggregate-card__content-wrapper">
                    <em>
                      <b>Agregados</b>
                    </em>
                    <Icons typeIcon="aggregate" iconSize={50} fill={'#204691'} />
                  </div>
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {checkinPermissions && (
        <Row className="mb-5 navigation-header">
          <Col className="mb-3 mb-lg-0">
            <Card className="h-100" onClick={handleCheckinClick}>
              <Card.Body className="navigation-header__checkin-card">
                <Card.Title className="text-center mb-0">
                  <div className="navigation-header__checkin-card__content-wrapper">
                    <em>
                      <b>Check-in</b>
                    </em>
                    <Icons typeIcon="checkin" iconSize={50} fill={'#204691'} />
                  </div>
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

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
  totalRegistrationsGlobal: PropTypes.shape({
    totalRegistrations: PropTypes.number,
    totalChildren: PropTypes.number,
    totalFilledVacancies: PropTypes.number,
    totalValidRegistrations: PropTypes.number,
  }).isRequired,
};

export default AdminLoggedIn;
