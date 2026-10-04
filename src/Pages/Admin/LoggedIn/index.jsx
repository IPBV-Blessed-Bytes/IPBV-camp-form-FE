import { useEffect, useState, useContext, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { getRegistrationMetrics } from '@/services/stats';
import { getPlanTier } from '@/services/planTier';
import { getPlatformBillingStatus } from '@/services/platformBilling';
import { getRecipientOnboardingStatus } from '@/services/recipientOnboarding';
import PlatformBillingBanner from '@/components/Admin/PlatformBillingBanner';
import TenantTourModal from '@/components/Admin/TenantTourModal';
import { registerLog } from '@/services/logs';
import { permissionsSections } from '@/fetchers/permissions';
import scrollUp from '@/hooks/useScrollUp';
import { getEventSlug, setSelectedEvent } from '@/config/eventScope';
import { listMyEvents } from '@/services/events';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import StatCards from '@/components/Admin/StatCards';
import DashboardCharts from '@/components/Admin/DashboardCharts';
import ExternalLinkRow from '@/components/Admin/ExternalLinkRow';
import SessionCard from '@/components/Admin/SessionCard';
import SessionEditModal from '@/components/Admin/SessionEditModal';
import AdminTopbar from '@/components/Admin/AdminTopbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import { toast } from 'react-toastify';
import { useAdminSessions } from '@/hooks/useAdminSessions';
import { reorderAdminSessions } from '@/services/adminSessions';
import { resolveSession } from '@/config/adminSessions';

const ESSENCIAL_HIDDEN_PATHS = new Set([
  'carona',
  'onibus',
  'quartos',
  'times',
  'pulseiras',
  'checkin',
  'checkin-inscricoes',
]);

const BASIC_HIDDEN_PATHS = new Set([
  'carona',
  'onibus',
  'quartos',
  'times',
  'pulseiras',
  'produtos',
  'pedidos-loja',
  'lotes',
  'vagas',
  'recebimento',
  'financeiro',
  'doacoes',
]);

const AdminLoggedIn = ({
  loggedInUsername,
  logout,
  sendLoggedMessage,
  setSendLoggedMessage,
  spinnerLoading,
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
  } = permissionsSections(userRole);

  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState('completo');
  const [freeEventAccess, setFreeEventAccess] = useState('FULL');
  const [needsRecebimento, setNeedsRecebimento] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [view, setView] = useState('main');
  const [carouselDirection, setCarouselDirection] = useState('forward');
  const [settingsPage, setSettingsPage] = useState(0);

  const { configs: sessionConfigs, refetch: refetchSessions } = useAdminSessions();
  const canEditSessions = userRole === 'admin';
  const [dragKey, setDragKey] = useState(null);

  const orderNavSessions = (sessions) => {
    const index = {};
    sessions.forEach((s, i) => {
      index[s.path] = i;
    });
    return [...sessions].sort((a, b) => {
      const ao = sessionConfigs[a.path]?.sortOrder;
      const bo = sessionConfigs[b.path]?.sortOrder;
      const av = ao == null ? index[a.path] + 1000 : ao;
      const bv = bo == null ? index[b.path] + 1000 : bo;
      return av - bv;
    });
  };

  const handleReorderDrop = async (orderedSessions, targetPath) => {
    if (!dragKey || dragKey === targetPath) {
      setDragKey(null);
      return;
    }
    const keys = orderedSessions.map((s) => s.path);
    const from = keys.indexOf(dragKey);
    const to = keys.indexOf(targetPath);
    if (from === -1 || to === -1) {
      setDragKey(null);
      return;
    }
    keys.splice(to, 0, keys.splice(from, 1)[0]);
    setDragKey(null);
    try {
      await reorderAdminSessions(keys);
      await refetchSessions();
    } catch (error) {
      toast.error(t('admin.shell.reorderError'));
    }
  };

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
    getPlanTier()
      .then(setTier)
      .catch(() => setTier('completo'));
  }, []);

  useEffect(() => {
    getPlatformBillingStatus()
      .then((data) => setFreeEventAccess(data?.freeEventAccess || 'FULL'))
      .catch(() => setFreeEventAccess('FULL'));
  }, []);

  useEffect(() => {
    if (getEventSlug()) return;
    listMyEvents()
      .then((list) => setMyEvents(Array.isArray(list) ? list : []))
      .catch(() => setMyEvents([]));
  }, []);

  const tourKey = `tenant-tour-dismissed:${loggedInUsername || 'admin'}`;

  useEffect(() => {
    try {
      if (!localStorage.getItem(tourKey)) {
        setShowTour(true);
      }
    } catch {
      setShowTour(false);
    }
  }, [tourKey]);

  const handleCloseTour = (dontShowAgain) => {
    setShowTour(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem(tourKey, '1');
      } catch {
        /* ignore */
      }
    }
  };

  const chooseEvent = (slug) => {
    setSelectedEvent(slug);
    window.location.assign(routePrefix);
  };

  useEffect(() => {
    if (!settingsButtonPermissions) {
      setNeedsRecebimento(false);
      return;
    }
    getRecipientOnboardingStatus()
      .then((status) => setNeedsRecebimento(status.required && !status.onboarded))
      .catch(() => setNeedsRecebimento(false));
  }, [settingsButtonPermissions]);

  useEffect(() => {
    const fetchAdminHomeCounters = async () => {
      setLoading(true);

      try {
        const data = await getRegistrationMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Erro ao buscar métricas do admin:', error);
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

  const metricsCards = useMemo(() => {
    const m = metrics || {};
    const n = (v) => Number(v || 0);
    const revenue = (n(m.revenueCents) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const cards = [
      { label: t('admin.shell.metrics.total'), value: n(m.total) },
      { label: t('admin.shell.metrics.confirmed'), value: n(m.confirmed), tone: 'free' },
      { label: t('admin.shell.metrics.pending'), value: n(m.pending), tone: 'used' },
      { label: t('admin.shell.metrics.checkedIn'), value: n(m.checkedIn), tone: 'info' },
      { label: t('admin.shell.metrics.revenue'), value: revenue, tone: 'accent' },
    ];
    if (n(m.refunded) > 0) {
      cards.push({ label: t('admin.shell.metrics.refunded'), value: n(m.refunded), tone: 'danger' });
    }
    return cards;
  }, [metrics, t]);

  const navigationSessions = [
    {
      permission: registeredButtonHomePermissions,
      path: 'inscricoes',
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
      permission: registeredButtonHomePermissions,
      path: 'boletos',
      cardType: 'boletos-card',
      title: 'Boletos',
      typeIcon: 'barcode',
      iconSize: 40,
    },
    {
      permission: registeredButtonHomePermissions,
      path: 'doacoes',
      cardType: 'donations-card',
      title: 'Doações',
      typeIcon: 'couple',
      iconSize: 40,
    },
    {
      permission: registeredButtonHomePermissions,
      path: 'reembolsos',
      cardType: 'registered-card',
      title: 'Reembolsos',
      typeIcon: 'money',
      iconSize: 40,
    },
    {
      permission: registeredButtonHomePermissions,
      path: 'financeiro',
      cardType: 'registered-card',
      title: 'Financeiro',
      typeIcon: 'money',
      iconSize: 42,
    },
    {
      permission: registeredButtonHomePermissions,
      path: 'lixeira',
      cardType: 'registered-card',
      title: 'Lixeira',
      typeIcon: 'delete',
      iconSize: 40,
    },
  ];

  const settingsSessions = [
    { path: 'estagio', title: 'Estágio do Formulário', typeIcon: 'form-context', iconSize: 42, accent: '#204691' },
    { path: 'campos-admin', title: 'Campos Administrativos', typeIcon: 'form-context', iconSize: 40, accent: '#5c6bc0' },
    { path: 'recebimento', title: 'Recebimento', typeIcon: 'money', iconSize: 42, accent: '#057c05' },
    { path: 'eventos', title: 'Eventos', typeIcon: 'calendar', iconSize: 40, accent: '#2E5AAC' },
    { path: 'info', title: 'Informações Iniciais Form', typeIcon: 'info', iconSize: 44, accent: '#3498db' },
    { path: 'institucional', title: 'Área Institucional', typeIcon: 'megaphone', iconSize: 40, accent: '#cc6d00' },
    { path: 'formulario', title: 'Campos do Formulário', typeIcon: 'form', iconSize: 42, accent: '#204691' },
    { path: 'faq', title: 'Perguntas Frequentes', typeIcon: 'question', iconSize: 42, accent: '#8e44ad' },
    { path: 'pacote', title: 'Pacote', typeIcon: 'cart', iconSize: 42, accent: '#b9770a' },
    { path: 'logs', title: 'Logs de Usuários', typeIcon: 'logs', iconSize: 44, accent: '#555050' },
    { path: 'lotes', title: 'Lotes', typeIcon: 'calendar', iconSize: 40, accent: '#0066cc' },
    { path: 'utilitarias', title: 'Informações Utilitárias', typeIcon: 'settings', iconSize: 42, accent: '#607d8b' },
    { path: 'papeis', title: 'Papéis e Permissões', typeIcon: 'feedback', iconSize: 44, accent: '#b5468a' },
    { path: 'produtos', title: 'Produtos', typeIcon: 'cart', iconSize: 44, accent: '#FF7F50' },
    { path: 'pedidos-loja', title: 'Pedidos da Loja', typeIcon: 'cart', iconSize: 44, accent: '#b9770a' },
    { path: 'pulseiras', title: 'Pulseiras', typeIcon: 'wristband', iconSize: 44, accent: '#e0a800' },
    { path: 'solicitacoes', title: 'Solicitações de Alteração', typeIcon: 'refresh', iconSize: 40, accent: '#0c9183' },
    { path: 'usuarios', title: 'Usuários', typeIcon: 'add-person', iconSize: 44, accent: '#6f42c1' },
    { path: 'vagas', title: 'Vagas', typeIcon: 'camp', iconSize: 44, accent: '#49bd72' },
    { path: 'backup', title: 'Backup', typeIcon: 'excel', iconSize: 40, accent: '#4caf50' },
  ];

  const SETTINGS_PAGE_SIZE = 12;
  const isSessionAllowed = (path) => tier !== 'essencial' || !ESSENCIAL_HIDDEN_PATHS.has(path);

  const isLocked = (path) => freeEventAccess === 'BASIC' && BASIC_HIDDEN_PATHS.has(path);

  const handleLockedClick = () => {
    toast.info(t('admin.billing.lockedToast'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const settingsPages = [];
  const visibleSettingsSessions = orderNavSessions(
    settingsSessions.filter((session) => isSessionAllowed(session.path)),
  );
  for (let i = 0; i < visibleSettingsSessions.length; i += SETTINGS_PAGE_SIZE) {
    settingsPages.push(visibleSettingsSessions.slice(i, i + SETTINGS_PAGE_SIZE));
  }
  const currentSettingsPage = Math.min(settingsPage, settingsPages.length - 1);

  return (
    <div className="admin-home">
      <AdminTopbar username={topbarName} logout={logout} />
      <TenantTourModal show={showTour} onClose={handleCloseTour} />

      {!getEventSlug() ? (
        <div className="admin-home__content">
          <div className="admin-home__events">
            <div className="admin-home__events-head">
              <h4>{t('admin.shell.myEventsTitle')}</h4>
              <p>{t('admin.shell.myEventsSubtitle')}</p>
            </div>
            <Row className="gx-3 gy-3">
              {myEvents.map((event) => (
                <Col key={event.slug} xs={12} sm={6} lg={4}>
                  <button
                    type="button"
                    className="admin-home__event-card"
                    style={{ '--card-accent': event.color || '#007185' }}
                    onClick={() => chooseEvent(event.slug)}
                  >
                    <span className="admin-home__event-initial">{(event.name || '?').charAt(0).toUpperCase()}</span>
                    {event.year && <span className="admin-home__event-year">{event.year}</span>}
                    <span className="admin-home__event-name">{event.name}</span>
                    <span className="admin-home__event-cta">{t('admin.shell.eventAdminCta')}</span>
                  </button>
                </Col>
              ))}
              <Col xs={12} sm={6} lg={4}>
                <button
                  type="button"
                  className="admin-home__event-card admin-home__event-card--new"
                  onClick={() => navigate(`${routePrefix}/eventos`)}
                >
                  <span className="admin-home__event-plus">+</span>
                  <span className="admin-home__event-name">{t('admin.shell.createEvent')}</span>
                </button>
              </Col>
            </Row>
            {myEvents.length === 0 && (
              <p className="admin-home__events-empty">
                <Trans i18nKey="admin.shell.noEvents" components={{ b: <b /> }} />
              </p>
            )}
          </div>
        </div>
      ) : (
      <div className="admin-home__content">
        <PlatformBillingBanner canManage={settingsButtonPermissions} />
        {needsRecebimento && (
          <div className="admin-home__recebimento-alert" role="alert">
            <Icons typeIcon="money" iconSize={30} fill="#8a5300" />
            <div className="admin-home__recebimento-alert-text">
              <strong>{t('admin.shell.recebimentoAlertTitle')}</strong>
              <span>{t('admin.shell.recebimentoAlertText')}</span>
            </div>
            <button
              type="button"
              className="admin-home__recebimento-alert-btn"
              onClick={() => navigate(`${routePrefix}/recebimento`)}
            >
              {t('admin.shell.recebimentoAlertBtn')}
            </button>
          </div>
        )}
        <div className="session-carousel">
          {view === 'main' && canEditSessions && (
            <p className="session-carousel__hint">
              <Icons typeIcon="edit" iconSize={14} fill="none" /> {t('admin.shell.reorderHint')}
            </p>
          )}
          {view === 'settings' && (
            <div className="settings-toolbar">
              <button type="button" className="settings-toolbar__back" onClick={openMainView}>
                <Icons typeIcon="arrow-left" iconSize={18} fill="#495057" />
                {t('admin.shell.mainButtons')}
              </button>
              {settingsPages.length > 1 && (
                <div className="settings-toolbar__pager">
                  <button
                    type="button"
                    className="settings-toolbar__page-btn"
                    disabled={currentSettingsPage === 0}
                    onClick={() => goToSettingsPage(currentSettingsPage - 1, 'back')}
                  >
                    {t('admin.shell.prev')}
                  </button>
                  <span className="settings-toolbar__page-info">
                    {t('admin.shell.pageInfo', { current: currentSettingsPage + 1, total: settingsPages.length })}
                  </span>
                  <button
                    type="button"
                    className="settings-toolbar__page-btn"
                    disabled={currentSettingsPage === settingsPages.length - 1}
                    onClick={() => goToSettingsPage(currentSettingsPage + 1, 'forward')}
                  >
                    {t('admin.shell.next')}
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
                {orderNavSessions(
                  navigationSessions.filter((session) => isSessionAllowed(session.path)),
                ).map((session, _i, ordered) => {
                  const resolved = resolveSession(session.path, sessionConfigs[session.path], {
                    title: t(`admin.shell.sessions.${session.path}`),
                    icon: session.typeIcon,
                  });
                  return (
                    <SessionCard
                      key={session.path}
                      permission={session.permission}
                      cardType={session.cardType}
                      iconSize={session.iconSize}
                      title={resolved.title}
                      typeIcon={resolved.icon}
                      accentColor={resolved.color}
                      locked={isLocked(session.path)}
                      lockHint={t('admin.card.lockHint')}
                      lockCta={t('admin.card.unlock')}
                      canEdit={canEditSessions && !isLocked(session.path)}
                      onEdit={() => setEditingSession(session.path)}
                      onClick={() =>
                        isLocked(session.path) ? handleLockedClick() : navigate(`${routePrefix}/${session.path}`)
                      }
                      draggable={canEditSessions && !isLocked(session.path)}
                      dragging={dragKey === session.path}
                      onDragStart={() => setDragKey(session.path)}
                      onDragOver={(e) => canEditSessions && e.preventDefault()}
                      onDrop={() => handleReorderDrop(ordered, session.path)}
                      onDragEnd={() => setDragKey(null)}
                    />
                  );
                })}
                <SessionCard
                  permission={settingsButtonPermissions}
                  title={t('admin.shell.settings')}
                  typeIcon="settings"
                  iconSize={42}
                  accentColor="#37474f"
                  onClick={openSettingsView}
                />
              </>
            ) : (
              settingsPages[currentSettingsPage].map((session) => {
                const resolved = resolveSession(session.path, sessionConfigs[session.path], {
                  title: t(`admin.shell.sessions.${session.path}`),
                  icon: session.typeIcon,
                });
                return (
                  <SessionCard
                    key={session.path}
                    permission={settingsButtonPermissions}
                    title={resolved.title}
                    typeIcon={resolved.icon}
                    iconSize={session.iconSize}
                    accentColor={resolved.color || session.accent}
                    locked={isLocked(session.path)}
                    lockHint={t('admin.card.lockHint')}
                    lockCta={t('admin.card.unlock')}
                    canEdit={canEditSessions && !isLocked(session.path)}
                    onEdit={() => setEditingSession(session.path)}
                    onClick={() =>
                      isLocked(session.path) ? handleLockedClick() : navigate(`${routePrefix}/${session.path}`)
                    }
                    draggable={canEditSessions && !isLocked(session.path)}
                    dragging={dragKey === session.path}
                    onDragStart={() => setDragKey(session.path)}
                    onDragOver={(e) => canEditSessions && e.preventDefault()}
                    onDrop={() => handleReorderDrop(visibleSettingsSessions, session.path)}
                    onDragEnd={() => setDragKey(null)}
                  />
                );
              })
            )}
          </Row>
        </div>

        {editingSession && (
          <SessionEditModal
            show={Boolean(editingSession)}
            onHide={() => setEditingSession(null)}
            sessionKey={editingSession}
            sessionTitle={
              [...navigationSessions, ...settingsSessions].some((s) => s.path === editingSession)
                ? t(`admin.shell.sessions.${editingSession}`)
                : undefined
            }
            defaultIcon={
              [...navigationSessions, ...settingsSessions].find((s) => s.path === editingSession)?.typeIcon
            }
            config={sessionConfigs[editingSession]}
            onSaved={refetchSessions}
          />
        )}

        {packagesAndTotalCardsPermissions && !spinnerLoading && !loading && (
          <>
            <SectionHeader title={t('admin.shell.overview')} count={metricsCards.length} />
            <StatCards items={metricsCards} />
            <DashboardCharts metrics={metrics} />
          </>
        )}

        <Loading loading={spinnerLoading || loading} />

        {utilitiesLinksPermissions && (
          <Row>
            <ExternalLinkRow />
          </Row>
        )}
      </div>
      )}
    </div>
  );
};

AdminLoggedIn.propTypes = {
  loggedInUsername: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  user: PropTypes.string,
  sendLoggedMessage: PropTypes.bool,
  setSendLoggedMessage: PropTypes.func,
  spinnerLoading: PropTypes.bool,
  userRole: PropTypes.string,
};

export default AdminLoggedIn;
