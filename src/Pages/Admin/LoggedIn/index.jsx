import { useEffect, useState, useContext, useMemo } from 'react';
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

const PACKAGE_MAPPING = [
  { key: 'host-college-collective', totalKey: 'schoolIndividual', title: 'Colégio Coletivo' },
  { key: 'host-college-family', totalKey: 'schoolFamily', title: 'Colégio Família' },
  { key: 'host-college-camping', totalKey: 'schoolCamping', title: 'Colégio Camping' },
  { key: 'host-seminario', totalKey: 'seminary', title: 'Seminário' },
  { key: 'host-external', totalKey: 'other', title: 'Hospedagem Externa' },
];

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

  const [filteredCountNonPayingChildren, setFilteredCountNonPayingChildren] = useState(0);
  const [crewBusUsers, setCrewBusUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const splitedLoggedInUsername = loggedInUsername.split('@')[0];

  const { formContext } = useContext(AuthContext);
  const navigate = useNavigate();
  const routePrefix = formContext === 'maintenance' ? '/dev' : '/admin';

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

  const { validPackageCardsData, allPackageCardsData, totalCardsData } = useMemo(() => {
    const {
      totalRegistrations: totalGlobal,
      totalValidRegistrations,
      totalChildren,
      totalAdultsNonPaid,
    } = totalRegistrations;
    const {
      usedPackages = {},
      usedValidPackages = {},
      pendingPackages = {},
      totalPackages = {},
    } = availablePackages || {};

    const calculatePackages = (dataSource) =>
      PACKAGE_MAPPING.map(({ key, totalKey, title }) => {
        const filled = Number(dataSource[key] || 0) + Number(pendingPackages[key] || 0);
        const total = totalPackages[totalKey] || 0;
        return {
          title,
          filledVacancies: filled,
          remainingVacancies: Math.max(total - filled, 0),
          showRemainingVacancies: true,
        };
      });

    const busYesFilled = Number(usedValidPackages['bus-yes'] || 0) + Number(pendingPackages['bus-yes'] || 0);

    return {
      validPackageCardsData: calculatePackages(usedValidPackages),
      allPackageCardsData: calculatePackages(usedPackages),
      totalCardsData: [
        {
          title: 'Total de Crianças Pagantes',
          filledVacancies: Math.max(totalChildren - filteredCountNonPayingChildren, 0),
        },
        {
          title: 'Total de Crianças Não Pagantes',
          filledVacancies: Number(filteredCountNonPayingChildren),
        },
        {
          title: 'Total de Crianças',
          filledVacancies: Number(totalChildren),
        },
        {
          title: 'Total de Adultos Pagantes',
          filledVacancies: totalValidRegistrations - totalAdultsNonPaid,
        },
        {
          title: 'Total de Adultos Não Pagantes',
          filledVacancies: Number(totalAdultsNonPaid),
        },
        {
          title: 'Total de Adultos',
          filledVacancies: Number(totalValidRegistrations),
          remainingVacancies: Math.max(totalSeats - totalValidRegistrations, 0),
          showRemainingVacancies: true,
        },
        {
          title: 'Total de Inscritos Geral',
          filledVacancies: Number(totalGlobal),
        },
        {
          title: 'Ônibus Geral',
          filledVacancies: busYesFilled,
          remainingVacancies: Math.max(totalBusVacancies - busYesFilled, 0),
          showRemainingVacancies: true,
        },
        {
          title: 'Ônibus Equipe',
          filledVacancies: Number(crewBusUsers),
          remainingVacancies: Math.max(22 - crewBusUsers, 0),
          showRemainingVacancies: true,
        },
        {
          title: 'Total com Alimentação',
          filledVacancies: Number(usedPackages['food-complete'] || 0),
        },
        {
          title: 'Total sem Alimentação',
          filledVacancies: Number(usedPackages['no-food'] || 0),
        },
      ],
    };
  }, [
    availablePackages,
    totalRegistrations,
    filteredCountNonPayingChildren,
    crewBusUsers,
    totalSeats,
    totalBusVacancies,
  ]);

  const navigationSessions = [
    {
      permission: registeredButtonHomePermissions,
      path: 'acampantes',
      cardType: 'registered-card',
      title: 'Inscritos',
      typeIcon: 'person',
      iconSize: 40,
    },
    {
      permission: rideButtonHomePermissions,
      path: 'carona',
      cardType: 'ride-card',
      title: 'Caronas',
      typeIcon: 'ride',
      iconSize: 50,
    },
    {
      permission: discountButtonHomePermissions,
      path: 'descontos',
      cardType: 'discount-card',
      title: 'Descontos',
      typeIcon: 'discount',
      iconSize: 50,
    },
    {
      permission: roomsButtonHomePermissions,
      path: 'quartos',
      cardType: 'rooms-card',
      title: 'Quartos',
      typeIcon: 'rooms',
      iconSize: 50,
    },
    {
      permission: teamsButtonHomePermissions,
      path: 'times',
      cardType: 'teams-card',
      title: 'Times',
      typeIcon: 'team',
      iconSize: 50,
    },
    {
      permission: feedbackButtonHomePermissions,
      path: 'opiniao',
      cardType: 'feedback-card',
      title: 'Feedbacks',
      typeIcon: 'feedback',
      iconSize: 50,
    },
    {
      permission: checkinPermissions,
      path: 'checkin',
      cardType: 'checkin-card',
      title: 'Check-in',
      typeIcon: 'checkin',
      iconSize: 50,
    },
  ];

  return (
    <div className="p-4">
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
        {navigationSessions.map((session) => (
          <SessionCard key={session.path} {...session} onClick={() => navigate(`${routePrefix}/${session.path}`)} />
        ))}
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
    </div>
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
