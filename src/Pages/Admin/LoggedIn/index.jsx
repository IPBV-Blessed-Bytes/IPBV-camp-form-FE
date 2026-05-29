import { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { getNonPayingChildren, getCrewBus } from '@/services/stats';
import { registerLog } from '@/services/logs';
import { permissionsSections } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import Loading from '@/components/Global/Loading';
import PackageCard from '@/components/Admin/PackageCard';
import ExternalLinkRow from '@/components/Admin/ExternalLinkRow';
import SessionCard from '@/components/Admin/SessionCard';
import SideButtons from '@/components/Admin/SideButtons';
import AdminTopbar from '@/components/Admin/AdminTopbar';
import SectionHeader from '@/components/Admin/SectionHeader';

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
        const [nonPayingChildren, crewBus] = await Promise.all([
          getNonPayingChildren(),
          getCrewBus(),
        ]);

        setFilteredCountNonPayingChildren(nonPayingChildren?.quantity || 0);
        setCrewBusUsers(crewBus?.quantity || 0);
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
    <div className="admin-home">
      <AdminTopbar username={splitedLoggedInUsername} logout={logout} />

      <div className="admin-home__content">
        <Row className="navigation-header gx-3">
          {navigationSessions.map((session) => (
            <SessionCard key={session.path} {...session} onClick={() => navigate(`${routePrefix}/${session.path}`)} />
          ))}
        </Row>

        {packagesAndTotalCardsPermissions && (
          <>
            {!spinnerLoading && !loading && (
              <>
                <SectionHeader title="Pacotes válidos" count={validPackageCardsData.length} />
                <Row className="gx-3">
                  {validPackageCardsData.map((card) => (
                    <PackageCard key={card.title} {...card} cardType="valid-package-card" />
                  ))}
                </Row>

                <SectionHeader title="Pacotes (todos)" count={allPackageCardsData.length} />
                <Row className="gx-3">
                  {allPackageCardsData.map((card) => (
                    <PackageCard key={card.title} {...card} cardType="all-package-card" />
                  ))}
                </Row>

                <SectionHeader title="Totais gerais" count={totalCardsData.length} />
                <Row className="gx-3">
                  {totalCardsData.map((card) => (
                    <PackageCard key={card.title} {...card} cardType="total-card" />
                  ))}
                </Row>
              </>
            )}

            <div className="admin-notes">
              <h5 className="admin-notes__title">Notas</h5>
              <ul className="admin-notes__list">
                <li><strong>Total de Inscritos Geral:</strong> contagem de adultos e crianças</li>
                <li><strong>Total de Adultos:</strong> contagem de adultos</li>
                <li><strong>Total de Crianças:</strong> contagem de crianças</li>
                <li><strong>Total de Inscritos Com Ônibus:</strong> contagem de pessoas válidas que irão de ônibus</li>
              </ul>
            </div>
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
