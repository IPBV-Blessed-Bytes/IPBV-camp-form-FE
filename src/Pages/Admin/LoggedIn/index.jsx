import { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { getNonPayingChildren, getCrewBus } from '@/services/stats';
import { registerLog } from '@/services/logs';
import { getSetting } from '@/services/settings';
import { permissionsSections } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import PackageCard from '@/components/Admin/PackageCard';
import ExternalLinkRow from '@/components/Admin/ExternalLinkRow';
import SessionCard from '@/components/Admin/SessionCard';
import AdminTopbar from '@/components/Admin/AdminTopbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import AdminCharts from '@/components/Admin/AdminCharts';

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
    utilitiesLinksPermissions,
    checkinPermissions,
    vacanciesProgressionPermissions,
    checkinBalancePermissions,
    filledVacanciesChartPermissions,
    allInfoChartPermissions,
  } = permissionsSections(userRole);

  const hasChartsPermission =
    vacanciesProgressionPermissions ||
    checkinBalancePermissions ||
    filledVacanciesChartPermissions ||
    allInfoChartPermissions;

  const [filteredCountNonPayingChildren, setFilteredCountNonPayingChildren] = useState(0);
  const [crewBusUsers, setCrewBusUsers] = useState(0);
  const [crewBusVacancies, setCrewBusVacancies] = useState(22);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('main');
  const [carouselDirection, setCarouselDirection] = useState('forward');
  const [settingsPage, setSettingsPage] = useState(0);

  const { formStage, displayName } = useContext(AuthContext);
  const topbarName = displayName || loggedInUsername;
  const navigate = useNavigate();
  const routePrefix = formStage === 'maintenance' ? '/dev' : '/admin';

  const openSettingsView = () => {
    setCarouselDirection('forward');
    setSettingsPage(0);
    setView('settings');
  };

  const openMainView = () => {
    setCarouselDirection('back');
    setView('main');
  };

  const goToSettingsPage = (nextPage, direction) => {
    setCarouselDirection(direction);
    setSettingsPage(nextPage);
  };

  scrollUp();

  useEffect(() => {
    const fetchAdminHomeCounters = async () => {
      setLoading(true);

      try {
        const [nonPayingChildren, crewBus, crewBusSetting] = await Promise.all([
          getNonPayingChildren(),
          getCrewBus(),
          getSetting('crew_bus_vacancies').catch(() => ''),
        ]);

        setFilteredCountNonPayingChildren(nonPayingChildren?.quantity || 0);
        setCrewBusUsers(crewBus?.quantity || 0);
        setCrewBusVacancies(Number(crewBusSetting) || 22);
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
    const { usedPackages = {}, usedValidPackages = {}, totalPackages = {} } = availablePackages || {};

    const calculatePackages = (dataSource) =>
      PACKAGE_MAPPING.map(({ key, totalKey, title }) => {
        const confirmed = Number(dataSource[key] || 0);
        const total = totalPackages[totalKey] || 0;
        return {
          title,
          filledVacancies: confirmed,
          remainingVacancies: Math.max(total - confirmed, 0),
          showRemainingVacancies: true,
        };
      });

    const busYesConfirmed = Number(usedValidPackages['bus-yes'] || 0);

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
          filledVacancies: busYesConfirmed,
          remainingVacancies: Math.max(totalBusVacancies - busYesConfirmed, 0),
          showRemainingVacancies: true,
        },
        {
          title: 'Ônibus Equipe',
          filledVacancies: Number(crewBusUsers),
          remainingVacancies: Math.max(crewBusVacancies - crewBusUsers, 0),
          showRemainingVacancies: true,
        },
      ],
    };
  }, [
    availablePackages,
    totalRegistrations,
    filteredCountNonPayingChildren,
    crewBusUsers,
    crewBusVacancies,
    totalSeats,
    totalBusVacancies,
  ]);

  const navigationSessions = [
    {
      permission: registeredButtonHomePermissions,
      path: 'acampantes',
      cardType: 'registered-card',
      title: 'Inscrições',
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
      permission: registeredButtonHomePermissions,
      path: 'onibus',
      cardType: 'bus-card',
      title: 'Ônibus',
      typeIcon: 'bus',
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
    {
      permission: settingsButtonPermissions,
      path: 'boletos',
      cardType: 'boletos-card',
      title: 'Boletos',
      typeIcon: 'barcode',
      iconSize: 45,
    },
    {
      permission: settingsButtonPermissions,
      path: 'doacoes',
      cardType: 'donations-card',
      title: 'Doações',
      typeIcon: 'couple',
      iconSize: 45,
    },
  ];

  const settingsSessions = [
    { path: 'institucional', title: 'Área Institucional', typeIcon: 'megaphone', iconSize: 42, accent: '#007185' },
    { path: 'estagio', title: 'Estágio do Formulário', typeIcon: 'form-context', iconSize: 42, accent: '#204691' },
    { path: 'logs', title: 'Logs de Usuários', typeIcon: 'logs', iconSize: 44, accent: '#555050' },
    { path: 'info', title: 'Informações Iniciais Form', typeIcon: 'info', iconSize: 44, accent: '#3498db' },
    { path: 'utilitarios', title: 'Informações Utilitárias', typeIcon: 'settings', iconSize: 40, accent: '#cc6d00' },
    { path: 'lotes', title: 'Lotes', typeIcon: 'calendar', iconSize: 40, accent: '#0066cc' },
    { path: 'vagas', title: 'Vagas', typeIcon: 'camp', iconSize: 44, accent: '#49bd72' },
    { path: 'produtos', title: 'Produtos', typeIcon: 'cart', iconSize: 44, accent: '#FF7F50' },
    { path: 'pulseiras', title: 'Pulseiras', typeIcon: 'wristband', iconSize: 44, accent: '#e0a800' },
    { path: 'papeis', title: 'Papéis e Permissões', typeIcon: 'feedback', iconSize: 44, accent: '#b5468a' },
    { path: 'usuarios', title: 'Usuários', typeIcon: 'add-person', iconSize: 44, accent: '#6f42c1' },
    { path: 'reembolsos', title: 'Reembolsos', typeIcon: 'cash', iconSize: 40, accent: '#1a8a45' },
    { path: 'solicitacoes', title: 'Solicitações de Alteração', typeIcon: 'refresh', iconSize: 40, accent: '#0c9183' },
    { path: 'lixeira', title: 'Lixeira', typeIcon: 'delete', iconSize: 40, accent: '#dc3545' },
    { path: 'backup', title: 'Backup', typeIcon: 'excel', iconSize: 40, accent: '#4caf50' },
    { path: 'taxas', title: 'Taxas de Pagamento', typeIcon: 'money', iconSize: 40, accent: '#d39e00' },
    { path: 'faq', title: 'Perguntas Frequentes', typeIcon: 'question', iconSize: 44, accent: '#2E5AAC' },
  ];

  const SETTINGS_PAGE_SIZE = 12;
  const settingsPages = [];
  for (let i = 0; i < settingsSessions.length; i += SETTINGS_PAGE_SIZE) {
    settingsPages.push(settingsSessions.slice(i, i + SETTINGS_PAGE_SIZE));
  }
  const currentSettingsPage = Math.min(settingsPage, settingsPages.length - 1);

  return (
    <div className="admin-home">
      <AdminTopbar username={topbarName} logout={logout} />

      <div className="admin-home__content">
        <div className="session-carousel">
          {view === 'settings' && (
            <div className="settings-toolbar">
              <button type="button" className="settings-toolbar__back" onClick={openMainView}>
                <Icons typeIcon="arrow-left" iconSize={18} fill="#495057" />
                Sessões principais
              </button>
              {settingsPages.length > 1 && (
                <div className="settings-toolbar__pager">
                  <button
                    type="button"
                    className="settings-toolbar__page-btn"
                    disabled={currentSettingsPage === 0}
                    onClick={() => goToSettingsPage(currentSettingsPage - 1, 'back')}
                  >
                    ← Anterior
                  </button>
                  <span className="settings-toolbar__page-info">
                    Página {currentSettingsPage + 1} de {settingsPages.length}
                  </span>
                  <button
                    type="button"
                    className="settings-toolbar__page-btn"
                    disabled={currentSettingsPage === settingsPages.length - 1}
                    onClick={() => goToSettingsPage(currentSettingsPage + 1, 'forward')}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </div>
          )}
          <Row
            key={view === 'settings' ? `settings-${currentSettingsPage}` : 'main'}
            className={`navigation-header gx-3 session-pane session-pane--${carouselDirection}`}
          >
            {view === 'main' ? (
              <>
                {navigationSessions.map((session) => (
                  <SessionCard
                    key={session.path}
                    {...session}
                    onClick={() => navigate(`${routePrefix}/${session.path}`)}
                  />
                ))}
                <SessionCard
                  permission={settingsButtonPermissions}
                  title="Configurações"
                  typeIcon="settings"
                  iconSize={42}
                  accent="#37474f"
                  onClick={openSettingsView}
                />
              </>
            ) : (
              settingsPages[currentSettingsPage].map((session) => (
                <SessionCard
                  key={session.path}
                  permission={settingsButtonPermissions}
                  {...session}
                  onClick={() => navigate(`${routePrefix}/${session.path}`)}
                />
              ))
            )}
          </Row>
        </div>

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
                <li>
                  <strong>Total de Inscritos Geral:</strong> contagem de adultos e crianças
                </li>
                <li>
                  <strong>Total de Adultos:</strong> contagem de adultos
                </li>
                <li>
                  <strong>Total de Crianças:</strong> contagem de crianças
                </li>
                <li>
                  <strong>Total de Inscritos Com Ônibus:</strong> contagem de pessoas válidas que irão de ônibus
                </li>
              </ul>
            </div>
          </>
        )}

        {hasChartsPermission && !spinnerLoading && !loading && (
          <>
            <SectionHeader title="Visão geral" />
            <AdminCharts availablePackages={availablePackages} userRole={userRole} />
          </>
        )}

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
