import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, Badge, Button, Col, Form, Row, Table } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';

import {
  getPlatformMe,
  getPlatformStats,
  listPlatformOrganizations,
  createPlatformOrganization,
  updatePlatformOrganization,
  listPlatformFaqs,
  createPlatformFaq,
  updatePlatformFaq,
  deletePlatformFaq,
  getPlatformSettings,
  updatePlatformSettings,
  getPlatformBillingOverview,
  regularizePlatformOrganization,
  getPlatformLogs,
  sendPlatformBroadcast,
  getPlatformGrowth,
  getPlatformRevenue,
  getPlatformConfig,
  downloadPlatformExport,
} from '@/services/platform';
import { getSystemStage, updateSystemStage } from '@/services/systemStage';
import { getOrganizationCatalog } from '@/services/events';
import { setSelectedEvent } from '@/config/eventScope';
import {
  getPlatformPermissions,
  getPlatformRoles,
  createPlatformRole,
  updatePlatformRole,
  deletePlatformRole,
  getPlatformUsers,
  grantPlatformAccess,
  setPlatformUserRole,
  revokePlatformUser,
} from '@/services/platformAccess';
import { getApiErrorMessage } from '@/fetchers/helpers';
import StatCards from '@/components/Admin/StatCards';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const PLAN_OPTIONS = [
  { value: 'free', label: 'Grátis' },
  { value: 'basico', label: 'Básico' },
  { value: 'pro', label: 'Pro' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'canceled', label: 'Cancelado' },
];

const STATUS_BADGE = {
  active: { bg: 'success', label: 'Ativo' },
  trial: { bg: 'info', label: 'Trial' },
  suspended: { bg: 'warning', text: 'dark', label: 'Suspenso' },
  canceled: { bg: 'secondary', label: 'Cancelado' },
};

const TIER_OPTIONS = [
  { value: 'completo', label: 'Completo (todos os recursos)' },
  { value: 'essencial', label: 'Essencial (form + inscritos)' },
];

const BILLING_STATUS_OPTIONS = [
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Ativo (em dia)' },
  { value: 'past_due', label: 'Inadimplente' },
  { value: 'canceled', label: 'Cancelado' },
];

const BILLING_BADGE = {
  active: { bg: 'success', label: 'Em dia' },
  trial: { bg: 'info', label: 'Trial' },
  past_due: { bg: 'warning', text: 'dark', label: 'Inadimplente' },
  canceled: { bg: 'secondary', label: 'Cancelado' },
};

const SITUATION_BADGE = {
  healthy: { bg: 'success', label: 'Em dia' },
  trial: { bg: 'info', label: 'Trial' },
  warning: { bg: 'warning', text: 'dark', label: 'Vencendo' },
  form_blocked: { bg: 'danger', label: 'Form bloqueado' },
  admin_blocked: { bg: 'dark', label: 'Admin bloqueado' },
  canceled: { bg: 'secondary', label: 'Cancelado' },
};

const SITUATION_ORDER = ['healthy', 'trial', 'warning', 'form_blocked', 'admin_blocked', 'canceled'];

const SITUATION_COLOR = {
  healthy: '#1f8a4c',
  trial: '#2e6fb0',
  warning: '#d99a00',
  form_blocked: '#d1512b',
  admin_blocked: '#8a1c1c',
  canceled: '#6b7280',
};

const NAV = [
  { key: 'overview', label: 'Visão geral', icon: 'chart', perm: null },
  { key: 'clientes', label: 'Clientes', icon: 'couple', perm: 'CLIENTS_VIEW' },
  { key: 'cobranca', label: 'Cobrança', icon: 'cash', perm: 'CLIENTS_VIEW' },
  { key: 'precos', label: 'Preços', icon: 'profits', perm: 'PRICING_MANAGE' },
  { key: 'faq', label: 'FAQ da loja', icon: 'question', perm: 'FAQ_MANAGE' },
  { key: 'comunicados', label: 'Comunicados', icon: 'megaphone', perm: 'BROADCAST' },
  { key: 'usuarios', label: 'Usuários', icon: 'add-person', perm: 'USERS_MANAGE' },
  { key: 'permissoes', label: 'Papéis e permissões', icon: 'roles', perm: 'USERS_MANAGE' },
  { key: 'logs', label: 'Logs', icon: 'logs', perm: 'LOGS_VIEW' },
  { key: 'config', label: 'Configuração', icon: 'settings', perm: 'USERS_MANAGE' },
  { key: 'sistema', label: 'Sistema', icon: 'refresh', perm: 'SYSTEM_MANAGE' },
];

const SYSTEM_STAGES = [
  { value: 'on', label: 'No ar', desc: 'Tudo funcionando normalmente.', tone: 'good' },
  { value: 'maintenance', label: 'Manutenção', desc: 'Fecha o sistema para todos (menos você) com aviso de manutenção.', tone: 'warn' },
  { value: 'off', label: 'Fora do ar', desc: 'Fecha o sistema por completo para todos, menos você.', tone: 'danger' },
];


const formatDateBR = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

const formatBRL = (cents) =>
  ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const monthTick = (ym) => {
  if (!ym || typeof ym !== 'string') return ym;
  const [year, month] = ym.split('-');
  return `${MONTHS_PT[Number(month) - 1] || month}/${(year || '').slice(2)}`;
};

const formatDateTimeBR = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const EMPTY_ORG = {
  id: null,
  name: '',
  slug: '',
  contactEmail: '',
  plan: 'free',
  status: 'active',
  tier: 'completo',
  pagarmeRecipientId: '',
  platformFeePercent: '',
  freeEventFee: '',
  freeEventAnnual: '',
  billingStatus: 'active',
  dueDate: '',
  trialEndsAt: '',
};

const EMPTY_FAQ = {
  id: null,
  question: '',
  answer: '',
  order: 0,
};

const Platform = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [checking, setChecking] = useState(true);
  const [owner, setOwner] = useState(false);
  const [access, setAccess] = useState(false);
  const [perms, setPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(EMPTY_ORG);
  const [faqs, setFaqs] = useState([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqDraft, setFaqDraft] = useState(EMPTY_FAQ);
  const [savingFaq, setSavingFaq] = useState(false);
  const [pricing, setPricing] = useState({
    feePercent: '',
    freeEventFee: '',
    freeEventAnnual: '',
    essencialFeePercent: '',
    essencialFreeEventFee: '',
    essencialFreeEventAnnual: '',
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [sysStage, setSysStage] = useState('on');
  const [sysMessage, setSysMessage] = useState('');
  const [savingSys, setSavingSys] = useState(false);
  const [logs, setLogs] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [roles, setRoles] = useState([]);
  const [platformUsers, setPlatformUsers] = useState([]);
  const [permCatalog, setPermCatalog] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleDraft, setRoleDraft] = useState({ id: null, name: '', permissions: [] });
  const [savingRole, setSavingRole] = useState(false);
  const [grant, setGrant] = useState({ email: '', roleId: '' });
  const [savingGrant, setSavingGrant] = useState(false);
  const [impersonate, setImpersonate] = useState(null);
  const [impersonateEvents, setImpersonateEvents] = useState([]);
  const [impersonateLoading, setImpersonateLoading] = useState(false);
  const [broadcast, setBroadcast] = useState({ audience: 'all', subject: '', message: '' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [config, setConfig] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadData = async (ownerFlag = owner, permsList = perms) => {
    const has = (permission) => ownerFlag || permsList.includes(permission);
    setLoading(true);
    try {
      const [statsData, orgs, faqList, settingsData, overviewData, sysData, logsData, growthData, revenueData] =
        await Promise.all([
        has('CLIENTS_VIEW') ? getPlatformStats().catch(() => null) : Promise.resolve(null),
        has('CLIENTS_VIEW') ? listPlatformOrganizations().catch(() => []) : Promise.resolve([]),
        listPlatformFaqs().catch(() => []),
        getPlatformSettings().catch(() => null),
        has('CLIENTS_VIEW') ? getPlatformBillingOverview().catch(() => null) : Promise.resolve(null),
        getSystemStage().catch(() => null),
        has('LOGS_VIEW') ? getPlatformLogs().catch(() => []) : Promise.resolve([]),
        has('CLIENTS_VIEW') ? getPlatformGrowth().catch(() => []) : Promise.resolve([]),
        has('CLIENTS_VIEW') ? getPlatformRevenue().catch(() => null) : Promise.resolve(null),
      ]);
      setStats(statsData);
      setOverview(overviewData);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setGrowth(Array.isArray(growthData) ? growthData : []);
      setRevenue(revenueData);
      if (sysData) {
        setSysStage(sysData.stage || 'on');
        setSysMessage(sysData.message || '');
      }
      setOrganizations(orgs);
      setFaqs(faqList);
      if (settingsData) {
        setPricing({
          feePercent: settingsData.defaultFeePercent ?? '',
          freeEventFee: ((settingsData.freeEventFeeCents ?? 0) / 100).toString(),
          freeEventAnnual: ((settingsData.freeEventAnnualCents ?? 0) / 100).toString(),
          essencialFeePercent: settingsData.essencialFeePercent ?? '',
          essencialFreeEventFee: ((settingsData.essencialFreeEventFeeCents ?? 0) / 100).toString(),
          essencialFreeEventAnnual: ((settingsData.essencialFreeEventAnnualCents ?? 0) / 100).toString(),
        });
      }
      if (has('USERS_MANAGE')) {
        const [rolesData, usersData, permsData, configData] = await Promise.all([
          getPlatformRoles().catch(() => []),
          getPlatformUsers().catch(() => []),
          getPlatformPermissions().catch(() => []),
          getPlatformConfig().catch(() => null),
        ]);
        setRoles(rolesData);
        setPlatformUsers(usersData);
        setPermCatalog(permsData);
        setConfig(configData);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao carregar dados da plataforma.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegularize = async (id) => {
    try {
      await regularizePlatformOrganization(id);
      toast.success('Cobrança regularizada.');
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível regularizar.');
    }
  };

  const handleSaveSystemStage = async () => {
    setSavingSys(true);
    try {
      const data = await updateSystemStage({ stage: sysStage, message: sysMessage.trim() || null });
      setSysStage(data.stage || 'on');
      setSysMessage(data.message || '');
      toast.success('Estágio do sistema atualizado.');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível atualizar o estágio do sistema.');
    } finally {
      setSavingSys(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await downloadPlatformExport();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tenants.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível exportar.');
    } finally {
      setExporting(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcast.subject.trim() || !broadcast.message.trim()) {
      toast.error('Preencha o assunto e a mensagem.');
      return;
    }
    setSendingBroadcast(true);
    try {
      const data = await sendPlatformBroadcast(broadcast);
      toast.success(`Comunicado enviado para ${data.sent} igreja(s).`);
      setBroadcast((prev) => ({ ...prev, subject: '', message: '' }));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível enviar o comunicado.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const openImpersonate = async (org) => {
    setImpersonate(org);
    setImpersonateEvents([]);
    setImpersonateLoading(true);
    try {
      const { events } = await getOrganizationCatalog(org.slug);
      setImpersonateEvents(Array.isArray(events) ? events : []);
    } catch {
      setImpersonateEvents([]);
    } finally {
      setImpersonateLoading(false);
    }
  };

  const enterAdminAs = (slug) => {
    setSelectedEvent(slug);
    window.location.assign('/admin');
  };

  const openCreateRole = () => {
    setRoleDraft({ id: null, name: '', permissions: [] });
    setShowRoleModal(true);
  };

  const openEditRole = (role) => {
    setRoleDraft({ id: role.id, name: role.name || '', permissions: role.permissions || [] });
    setShowRoleModal(true);
  };

  const toggleRolePerm = (key) =>
    setRoleDraft((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));

  const handleSaveRole = async () => {
    if (!roleDraft.name.trim()) {
      toast.error('Informe o nome do papel.');
      return;
    }
    setSavingRole(true);
    try {
      const payload = { name: roleDraft.name.trim(), permissions: roleDraft.permissions };
      if (roleDraft.id) {
        await updatePlatformRole(roleDraft.id, payload);
        toast.success('Papel atualizado.');
      } else {
        await createPlatformRole(payload);
        toast.success('Papel criado.');
      }
      setShowRoleModal(false);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar o papel.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await deletePlatformRole(id);
      toast.success('Papel excluído.');
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível excluir o papel.');
    }
  };

  const handleGrantAccess = async () => {
    if (!grant.email.trim() || !grant.roleId) {
      toast.error('Informe o e-mail e o papel.');
      return;
    }
    setSavingGrant(true);
    try {
      await grantPlatformAccess({ email: grant.email.trim(), platformRoleId: Number(grant.roleId) });
      toast.success('Acesso concedido.');
      setGrant({ email: '', roleId: '' });
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível conceder o acesso.');
    } finally {
      setSavingGrant(false);
    }
  };

  const handleUserRoleChange = async (userId, roleId) => {
    try {
      await setPlatformUserRole(userId, roleId ? Number(roleId) : null);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível atualizar o papel.');
    }
  };

  const handleRevokeUser = async (userId) => {
    try {
      await revokePlatformUser(userId);
      toast.success('Acesso revogado.');
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível revogar o acesso.');
    }
  };

  const handleSavePricing = async () => {
    const percent = Number(pricing.feePercent);
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      toast.error('A taxa (%) deve estar entre 0 e 100.');
      return;
    }
    setSavingPricing(true);
    try {
      await updatePlatformSettings({
        defaultFeePercent: Math.round(percent),
        freeEventFeeCents: Math.round(Number(pricing.freeEventFee || 0) * 100),
        freeEventAnnualCents: Math.round(Number(pricing.freeEventAnnual || 0) * 100),
        essencialFeePercent: Math.round(Number(pricing.essencialFeePercent || 0)),
        essencialFreeEventFeeCents: Math.round(Number(pricing.essencialFreeEventFee || 0) * 100),
        essencialFreeEventAnnualCents: Math.round(Number(pricing.essencialFreeEventAnnual || 0) * 100),
      });
      toast.success('Preços da plataforma atualizados.');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar os preços.');
    } finally {
      setSavingPricing(false);
    }
  };

  const openCreateFaq = () => {
    setFaqDraft({ ...EMPTY_FAQ, order: faqs.length });
    setShowFaqModal(true);
  };

  const openEditFaq = (faq) => {
    setFaqDraft({
      id: faq.id,
      question: faq.question || '',
      answer: faq.answer || '',
      order: faq.order ?? 0,
    });
    setShowFaqModal(true);
  };

  const handleFaqChange = (field) => (value) => setFaqDraft((prev) => ({ ...prev, [field]: value }));

  const handleSaveFaq = async () => {
    if (!faqDraft.question.trim()) {
      toast.error('A pergunta é obrigatória.');
      return;
    }
    setSavingFaq(true);
    try {
      const payload = {
        question: faqDraft.question.trim(),
        answer: faqDraft.answer,
        order: Number(faqDraft.order) || 0,
      };
      if (faqDraft.id) {
        await updatePlatformFaq(faqDraft.id, payload);
        toast.success('Pergunta atualizada com sucesso.');
      } else {
        await createPlatformFaq(payload);
        toast.success('Pergunta criada com sucesso.');
      }
      setShowFaqModal(false);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar a pergunta.');
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await deletePlatformFaq(id);
      toast.success('Pergunta excluída com sucesso.');
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao excluir a pergunta.');
    }
  };

  useEffect(() => {
    getPlatformMe()
      .then((data) => {
        setOwner(Boolean(data?.owner));
        setAccess(Boolean(data?.access));
        setPerms(Array.isArray(data?.permissions) ? data.permissions : []);
        if (data?.access) loadData(Boolean(data?.owner), data?.permissions || []);
      })
      .catch(() => setAccess(false))
      .finally(() => setChecking(false));
  }, []);

  const can = (permission) => owner || perms.includes(permission);

  const openCreate = () => {
    setDraft(EMPTY_ORG);
    setShowModal(true);
  };

  const openEdit = (org) => {
    setDraft({
      id: org.id,
      name: org.name || '',
      slug: org.slug || '',
      contactEmail: org.contactEmail || '',
      plan: org.plan || 'free',
      status: org.status || 'active',
      tier: org.tier || 'completo',
      pagarmeRecipientId: org.pagarmeRecipientId || '',
      platformFeePercent: org.platformFeePercent ?? '',
      freeEventFee: org.freeEventFeeCents != null ? (org.freeEventFeeCents / 100).toString() : '',
      freeEventAnnual: org.freeEventAnnualCents != null ? (org.freeEventAnnualCents / 100).toString() : '',
      billingStatus: org.billingStatus || 'active',
      dueDate: org.dueDate || '',
      trialEndsAt: org.trialEndsAt || '',
    });
    setShowModal(true);
  };

  const handleChange = (field) => (value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error('O nome da organização é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      if (draft.id) {
        await updatePlatformOrganization(draft.id, {
          name: draft.name.trim(),
          contactEmail: draft.contactEmail.trim() || null,
          plan: draft.plan || null,
          status: draft.status || null,
          tier: draft.tier || null,
          pagarmeRecipientId: draft.pagarmeRecipientId.trim() || null,
          platformFeePercent:
            draft.platformFeePercent === '' || draft.platformFeePercent === null
              ? null
              : Number(draft.platformFeePercent),
          freeEventFeeCents:
            draft.freeEventFee === '' || draft.freeEventFee === null
              ? null
              : Math.round(Number(draft.freeEventFee) * 100),
          freeEventAnnualCents:
            draft.freeEventAnnual === '' || draft.freeEventAnnual === null
              ? null
              : Math.round(Number(draft.freeEventAnnual) * 100),
          billingStatus: draft.billingStatus || null,
          dueDate: draft.dueDate || null,
          trialEndsAt: draft.trialEndsAt || null,
        });
        toast.success('Organização atualizada com sucesso.');
      } else {
        await createPlatformOrganization({
          name: draft.name.trim(),
          slug: draft.slug.trim() || undefined,
          contactEmail: draft.contactEmail.trim() || undefined,
          plan: draft.plan || undefined,
          status: draft.status || undefined,
        });
        toast.success('Organização criada com sucesso.');
      }
      setShowModal(false);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar a organização.');
    } finally {
      setSaving(false);
    }
  };

  if (checking) return <Loading loading />;

  if (!access) {
    return (
      <div className="platform">
        <div className="platform__denied">
          <Icons typeIcon="info" iconSize={28} fill="#2E5AAC" />
          <p>Você não tem acesso a esta área.</p>
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Clientes (igrejas)', value: stats?.organizations ?? 0 },
    { label: 'Eventos', value: stats?.events ?? 0, tone: 'info' },
    { label: 'Inscrições', value: stats?.registrations ?? 0, tone: 'free' },
    { label: 'Usuários', value: stats?.users ?? 0, tone: 'accent' },
  ];

  const situationData = SITUATION_ORDER
    .map((key) => ({ key, name: SITUATION_BADGE[key]?.label || key, value: overview?.bySituation?.[key] || 0 }))
    .filter((item) => item.value > 0);

  const activeClients = organizations.filter((o) => o.billingStatus === 'active').length;
  const trialClients = organizations.filter((o) => o.billingStatus === 'trial').length;
  const pastDueClients = organizations.filter((o) => o.billingStatus === 'past_due').length;

  return (
    <div className="platform">
      <header className="platform__header">
        <div className="platform__header-inner">
          <div className="platform__brand">
            <span className="platform__brand-mark">
              <Icons typeIcon="settings" iconSize={24} fill="#ffffff" />
            </span>
            <div>
              <h1 className="platform__title">Painel da Plataforma</h1>
              <p className="platform__subtitle">Gestão de clientes, cobrança e preços</p>
            </div>
          </div>
          <div className="platform__header-actions">
            <Button variant="light" className="platform__btn-ghost" onClick={() => navigate('/admin/manual')}>
              Manual
            </Button>
          </div>
        </div>
      </header>

      <div className="platform__layout">
        <aside className="platform__nav">
          {NAV.filter((item) => !item.perm || can(item.perm)).map((item) => (
            <button
              key={item.key}
              type="button"
              className={`platform__nav-item ${section === item.key ? 'is-active' : ''}`}
              onClick={() => setSection(item.key)}
            >
              <Icons typeIcon={item.icon} iconSize={18} fill={section === item.key ? '#007185' : '#7f7878'} />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="platform__main">
          {section === 'overview' && (
            <div className="platform__overview">
              {stats && <StatCards items={statItems} />}

              <section className="platform__orgs">
                <div className="platform__section-title-row">
                  <span className="platform__section-icon platform__section-icon--teal">
                    <Icons typeIcon="cash" iconSize={20} fill="#007185" />
                  </span>
                  <h2 className="platform__orgs-title">Financeiro</h2>
                </div>
                <div className="platform__fin-tiles">
                  <div className="platform__fin-tile">
                    <span className="platform__fin-value">{activeClients}</span>
                    <span className="platform__fin-label">Clientes pagantes (ativos)</span>
                  </div>
                  <div className="platform__fin-tile">
                    <span className="platform__fin-value">{trialClients}</span>
                    <span className="platform__fin-label">Em teste (trial)</span>
                  </div>
                  <div className="platform__fin-tile">
                    <span className="platform__fin-value platform__fin-value--warn">{pastDueClients}</span>
                    <span className="platform__fin-label">Inadimplentes</span>
                  </div>
                  <div className="platform__fin-tile">
                    <span className="platform__fin-value" style={{ color: '#1f8a4c' }}>
                      {formatBRL(revenue?.totalCents || 0)}
                    </span>
                    <span className="platform__fin-label">Receita da plataforma (total)</span>
                  </div>
                  <div className="platform__fin-tile">
                    <span className="platform__fin-value">{formatBRL(revenue?.thisMonthCents || 0)}</span>
                    <span className="platform__fin-label">Receita este mês</span>
                  </div>
                </div>

                {(revenue?.count || 0) > 0 && (
                  <div className="platform__growth" style={{ marginTop: '1.1rem' }}>
                    <div className="platform__growth-chart">
                      <p className="platform__growth-title">Receita / mês</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={revenue.byMonth} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="#eef1f6" />
                          <XAxis dataKey="month" tickFormatter={monthTick} tick={{ fontSize: 12, fill: '#7f7878' }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(value) => [formatBRL(value), 'Receita']} labelFormatter={monthTick} />
                          <Bar dataKey="amountCents" fill="#1f8a4c" radius={[4, 4, 0, 0]} maxBarSize={34} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="platform__growth-chart">
                      <p className="platform__growth-title">Top clientes por receita</p>
                      <ul className="platform__chart-legend">
                        {revenue.byTenant.map((t) => (
                          <li key={t.organizationId}>
                            <span className="platform__chart-legend-label">{t.name}</span>
                            <b>{formatBRL(t.amountCents)}</b>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <p className="platform__fin-note">
                  <Icons typeIcon="simple-info" iconSize={15} fill="#7f7878" /> Receita = a <b>sua parte</b> (a taxa %
                  do split das inscrições pagas + as taxas de evento gratuito). O extrato/repasse detalhado fica no{' '}
                  <b>PagarMe</b>; começa a popular quando os pagamentos reais entrarem no ar.
                </p>
              </section>

              <section className="platform__orgs">
                <div className="platform__section-title-row">
                  <span className="platform__section-icon platform__section-icon--blue">
                    <Icons typeIcon="chart" iconSize={20} fill="#2E5AAC" />
                  </span>
                  <h2 className="platform__orgs-title">Clientes por situação de cobrança</h2>
                </div>
                {situationData.length > 0 ? (
                  <div className="platform__chart">
                    <div className="platform__chart-canvas">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={situationData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={90}
                            paddingAngle={2}
                            stroke="#fcfcfb"
                            strokeWidth={2}
                          >
                            {situationData.map((entry) => (
                              <Cell key={entry.key} fill={SITUATION_COLOR[entry.key] || '#8a94a3'} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} igreja(s)`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="platform__chart-legend">
                      {situationData.map((entry) => (
                        <li key={entry.key}>
                          <span className="platform__chart-dot" style={{ background: SITUATION_COLOR[entry.key] }} />
                          <span className="platform__chart-legend-label">{entry.name}</span>
                          <b>{entry.value}</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="platform__billing-empty">Sem dados de cobrança ainda.</p>
                )}
              </section>

              <section className="platform__orgs">
                <div className="platform__section-title-row">
                  <span className="platform__section-icon platform__section-icon--teal">
                    <Icons typeIcon="chart" iconSize={20} fill="#007185" />
                  </span>
                  <h2 className="platform__orgs-title">Crescimento (últimos 6 meses)</h2>
                </div>
                <div className="platform__growth">
                  <div className="platform__growth-chart">
                    <p className="platform__growth-title">Novos clientes / mês</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={growth} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#eef1f6" />
                        <XAxis dataKey="month" tickFormatter={monthTick} tick={{ fontSize: 12, fill: '#7f7878' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => [`${value} cliente(s)`, 'Novos']} labelFormatter={monthTick} />
                        <Bar dataKey="tenants" fill="#007185" radius={[4, 4, 0, 0]} maxBarSize={34} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="platform__growth-chart">
                    <p className="platform__growth-title">Inscrições / mês</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={growth} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#eef1f6" />
                        <XAxis dataKey="month" tickFormatter={monthTick} tick={{ fontSize: 12, fill: '#7f7878' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => [`${value} inscrição(ões)`, 'Inscrições']} labelFormatter={monthTick} />
                        <Bar dataKey="registrations" fill="#2E5AAC" radius={[4, 4, 0, 0]} maxBarSize={34} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="platform__fin-note">
                  <Icons typeIcon="simple-info" iconSize={15} fill="#7f7878" /> Métricas de contagem. A{' '}
                  <b>receita</b> (MRR, valores por tenant) entra quando o pagamento real estiver no ar.
                </p>
              </section>
            </div>
          )}

          {section === 'cobranca' && overview && (
          <section className="platform__billing">
            <div className="platform__billing-head">
              <div className="platform__section-title-row">
                <span className="platform__section-icon platform__section-icon--warn">
                  <Icons typeIcon="cash" iconSize={20} fill="#b9770a" />
                </span>
                <h2 className="platform__billing-title">Cobrança &amp; inadimplência</h2>
              </div>
              <p className="platform__billing-subtitle">
                Situação de cobrança das igrejas. {overview.trialsEndingSoon > 0
                  ? `${overview.trialsEndingSoon} trial(s) vencendo em até 7 dias.`
                  : 'Nenhum trial vencendo nos próximos 7 dias.'}
              </p>
            </div>

            <div className="platform__billing-tiles">
              {SITUATION_ORDER.filter((key) => (overview.bySituation?.[key] || 0) > 0).map((key) => {
                const badge = SITUATION_BADGE[key];
                return (
                  <div key={key} className="platform__billing-tile">
                    <span className="platform__billing-tile-value">{overview.bySituation[key]}</span>
                    <Badge bg={badge.bg} text={badge.text}>
                      {badge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {overview.attention?.length > 0 ? (
              <div className="platform__table-wrap">
                <Table hover responsive className="platform__table align-middle">
                  <thead>
                    <tr>
                      <th>Igreja</th>
                      <th>Situação</th>
                      <th>Vencimento / Trial</th>
                      <th className="text-center">Bloqueio em</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.attention.map((item) => {
                      const badge = SITUATION_BADGE[item.situation] || { bg: 'light', text: 'dark', label: item.situation };
                      const org = organizations.find((o) => o.id === item.id);
                      return (
                        <tr key={item.id}>
                          <td className="fw-semibold">{item.name}</td>
                          <td>
                            <Badge bg={badge.bg} text={badge.text}>
                              {badge.label}
                            </Badge>
                          </td>
                          <td>{formatDateBR(item.dueDate || item.trialEndsAt)}</td>
                          <td className="text-center">
                            {item.daysUntilNextBlock != null ? `${item.daysUntilNextBlock} dia(s)` : '—'}
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              {item.situation !== 'trial' && (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleRegularize(item.id)}
                                >
                                  Regularizar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline-teal-blue"
                                disabled={!org}
                                onClick={() => org && openEdit(org)}
                              >
                                Gerenciar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="platform__billing-empty">Nenhuma igreja precisa de atenção no momento.</p>
            )}
          </section>
          )}

          {section === 'precos' && (
          <section className="platform__pricing">
          <div className="platform__pricing-head">
            <div>
              <div className="platform__section-title-row">
                <span className="platform__section-icon platform__section-icon--teal">
                  <Icons typeIcon="profits" iconSize={20} fill="#007185" />
                </span>
                <h2 className="platform__pricing-title">Preços da plataforma</h2>
              </div>
              <p className="platform__pricing-subtitle">
                Valores <b>padrão (fallback)</b> aplicados a todas as igrejas. Cada cliente pode ter os seus próprios
                (taxa %, evento por evento e anual) na <b>edição da organização</b> — se lá estiver vazio, usa estes.
              </p>
            </div>
          </div>
          <Row className="g-3 align-items-start">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Taxa por inscrição paga (%):</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  value={pricing.feePercent}
                  onChange={(e) => setPricing((prev) => ({ ...prev, feePercent: e.target.value }))}
                />
                <Form.Text className="text-muted">Somada ao inscrito no checkout.</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Evento gratuito — por evento (R$):</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing.freeEventFee}
                  onChange={(e) => setPricing((prev) => ({ ...prev, freeEventFee: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Evento gratuito — anual ilimitado (R$):</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing.freeEventAnnual}
                  onChange={(e) => setPricing((prev) => ({ ...prev, freeEventAnnual: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>

          <p className="platform__pricing-tier-title">Plano Essencial (form + inscritos)</p>
          <Row className="g-3 align-items-start">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Taxa Essencial (%):</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  value={pricing.essencialFeePercent}
                  onChange={(e) => setPricing((prev) => ({ ...prev, essencialFeePercent: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Essencial — evento gratuito (R$):</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing.essencialFreeEventFee}
                  onChange={(e) => setPricing((prev) => ({ ...prev, essencialFreeEventFee: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Essencial — anual ilimitado (R$):</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing.essencialFreeEventAnnual}
                  onChange={(e) => setPricing((prev) => ({ ...prev, essencialFreeEventAnnual: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="platform__pricing-actions">
            <Button variant="teal-blue" onClick={handleSavePricing} disabled={savingPricing}>
              {savingPricing ? 'Salvando...' : 'Salvar preços'}
            </Button>
          </div>
        </section>
          )}

          {section === 'clientes' && (
          <section className="platform__orgs">
          <div className="platform__orgs-head">
            <div className="platform__section-title-row">
              <span className="platform__section-icon platform__section-icon--blue">
                <Icons typeIcon="couple" iconSize={20} fill="#2E5AAC" />
              </span>
              <h2 className="platform__orgs-title">Organizações (clientes)</h2>
            </div>
            <Button className="platform__btn-cta-solid d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
              Nova organização&nbsp;&nbsp;
              <Icons typeIcon="plus" iconSize={16} fill="#fff" />
            </Button>
          </div>
          {loading ? (
            <Loading loading />
          ) : organizations.length === 0 ? (
            <p className="platform__empty">Nenhuma organização cadastrada.</p>
          ) : (
            <div className="platform__table-wrap">
              <Table hover responsive className="platform__table align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Identificador</th>
                  <th>Contato</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Cobrança</th>
                  <th className="text-center">Nº de eventos</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => {
                  const badge = STATUS_BADGE[org.status] || { bg: 'secondary', label: org.status || '—' };
                  return (
                    <tr key={org.id}>
                      <td className="fw-semibold">{org.name}</td>
                      <td>
                        <code>{org.slug}</code>
                      </td>
                      <td>{org.contactEmail || '—'}</td>
                      <td className="text-capitalize">{org.plan || '—'}</td>
                      <td>
                        <Badge bg={badge.bg} text={badge.text}>
                          {badge.label}
                        </Badge>
                      </td>
                      <td>
                        {(() => {
                          const billing = BILLING_BADGE[org.billingStatus] || {
                            bg: 'light',
                            text: 'dark',
                            label: org.billingStatus || '—',
                          };
                          return (
                            <Badge bg={billing.bg} text={billing.text}>
                              {billing.label}
                            </Badge>
                          );
                        })()}
                      </td>
                      <td className="text-center">{org.eventCount ?? 0}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button size="sm" variant="outline-secondary" onClick={() => openImpersonate(org)}>
                            Entrar
                          </Button>
                          <Button size="sm" variant="outline-teal-blue" onClick={() => openEdit(org)}>
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </Table>
            </div>
          )}
        </section>
          )}

          {section === 'faq' && (
          <section className="platform__faqs">
          <div className="platform__faqs-header">
            <div>
              <div className="platform__section-title-row">
                <span className="platform__section-icon platform__section-icon--blue">
                  <Icons typeIcon="question" iconSize={20} fill="#2E5AAC" />
                </span>
                <h2 className="platform__faqs-title">Perguntas frequentes da loja</h2>
              </div>
              <p className="platform__faqs-subtitle">Exibidas na página pública de vendas.</p>
            </div>
            <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreateFaq}>
              Nova pergunta&nbsp;&nbsp;
              <Icons typeIcon="plus" iconSize={16} fill="#fff" />
            </Button>
          </div>

          {faqs.length === 0 ? (
            <p className="platform__empty">Nenhuma pergunta cadastrada.</p>
          ) : (
            <Accordion className="platform__faqs-list" alwaysOpen>
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={String(index)} key={faq.id}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>
                    <div className="platform__faq-answer" dangerouslySetInnerHTML={{ __html: faq.answer || '' }} />
                    <div className="platform__faq-actions">
                      <Button size="sm" variant="outline-teal-blue" onClick={() => openEditFaq(faq)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteFaq(faq.id)}>
                        Excluir
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </section>
          )}

          {section === 'logs' && (
          <section className="platform__orgs">
            <div className="platform__section-title-row">
              <span className="platform__section-icon platform__section-icon--blue">
                <Icons typeIcon="logs" iconSize={20} fill="#2E5AAC" />
              </span>
              <h2 className="platform__orgs-title">Logs da plataforma</h2>
            </div>
            <p className="platform__pricing-subtitle">
              Registro das ações administrativas no painel do dono (criar/editar igreja, regularizar, preços, estágio do
              sistema). Mostra os 200 mais recentes.
            </p>
            {logs.length === 0 ? (
              <p className="platform__empty">Nenhuma ação registrada ainda.</p>
            ) : (
              <div className="platform__table-wrap">
                <Table hover responsive className="platform__table align-middle">
                  <thead>
                    <tr>
                      <th>Data / hora</th>
                      <th>Quem</th>
                      <th>Ação</th>
                      <th>Detalhe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((entry) => (
                      <tr key={entry.id}>
                        <td className="text-nowrap">{formatDateTimeBR(entry.createdAt)}</td>
                        <td>{entry.actor || '—'}</td>
                        <td className="fw-semibold">{entry.action}</td>
                        <td>{entry.detail || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </section>
          )}

          {section === 'comunicados' && (
          <section className="platform__orgs">
            <div className="platform__section-title-row">
              <span className="platform__section-icon platform__section-icon--warn">
                <Icons typeIcon="megaphone" iconSize={20} fill="#b9770a" />
              </span>
              <h2 className="platform__orgs-title">Comunicados</h2>
            </div>
            <p className="platform__pricing-subtitle">
              Envie um e-mail para o contato das igrejas de uma vez. Escolha o público e escreva a mensagem.
            </p>
            <Row className="g-3">
              <Col xs={12} md={5}>
                <Form.Group>
                  <Form.Label><b>Público:</b></Form.Label>
                  <Form.Select
                    value={broadcast.audience}
                    onChange={(e) => setBroadcast((p) => ({ ...p, audience: e.target.value }))}
                  >
                    <option value="all">Todas as igrejas ({organizations.length})</option>
                    <option value="active">
                      Ativas ({organizations.filter((o) => o.billingStatus === 'active').length})
                    </option>
                    <option value="trial">
                      Em teste ({organizations.filter((o) => o.billingStatus === 'trial').length})
                    </option>
                    <option value="past_due">
                      Inadimplentes ({organizations.filter((o) => o.billingStatus === 'past_due').length})
                    </option>
                    <option value="canceled">
                      Canceladas ({organizations.filter((o) => o.billingStatus === 'canceled').length})
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label><b>Assunto:</b></Form.Label>
                  <Form.Control
                    value={broadcast.subject}
                    onChange={(e) => setBroadcast((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Ex.: Novidade na plataforma"
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label><b>Mensagem:</b></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={broadcast.message}
                    onChange={(e) => setBroadcast((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Escreva o comunicado. Quebras de linha são preservadas."
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="platform__pricing-actions">
              <Button variant="teal-blue" onClick={handleSendBroadcast} disabled={sendingBroadcast}>
                {sendingBroadcast ? 'Enviando...' : 'Enviar comunicado'}
              </Button>
            </div>
          </section>
          )}

          {section === 'usuarios' && (
          <section className="platform__orgs">
            <div className="platform__section-title-row">
              <span className="platform__section-icon platform__section-icon--blue">
                <Icons typeIcon="add-person" iconSize={20} fill="#2E5AAC" />
              </span>
              <h2 className="platform__orgs-title">Usuários da plataforma</h2>
            </div>
            <p className="platform__pricing-subtitle">
              Dê acesso ao painel do dono a outras pessoas, com um papel (conjunto de permissões). O usuário precisa já
              ter uma conta no sistema. Você (super-admin) tem acesso total sempre.
            </p>

            <Row className="g-2 align-items-end">
              <Col xs={12} md={5}>
                <Form.Group>
                  <Form.Label><b>E-mail do usuário:</b></Form.Label>
                  <Form.Control
                    type="email"
                    value={grant.email}
                    onChange={(e) => setGrant((p) => ({ ...p, email: e.target.value }))}
                    placeholder="pessoa@exemplo.com"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label><b>Papel:</b></Form.Label>
                  <Form.Select value={grant.roleId} onChange={(e) => setGrant((p) => ({ ...p, roleId: e.target.value }))}>
                    <option value="">Selecione um papel</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Button variant="teal-blue" className="w-100" onClick={handleGrantAccess} disabled={savingGrant}>
                  {savingGrant ? 'Concedendo...' : 'Conceder acesso'}
                </Button>
              </Col>
            </Row>

            {platformUsers.length === 0 ? (
              <p className="platform__empty">Nenhum usuário com acesso ainda (além do super-admin).</p>
            ) : (
              <div className="platform__table-wrap mt-3">
                <Table hover responsive className="platform__table align-middle">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Papel</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="fw-semibold">{u.email}{u.displayName ? ` (${u.displayName})` : ''}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={u.platformRoleId || ''}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-danger" onClick={() => handleRevokeUser(u.id)}>
                            Revogar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </section>
          )}

          {section === 'permissoes' && (
          <section className="platform__orgs">
            <div className="platform__orgs-head">
              <div className="platform__section-title-row">
                <span className="platform__section-icon platform__section-icon--blue">
                  <Icons typeIcon="roles" iconSize={20} fill="#2E5AAC" />
                </span>
                <h2 className="platform__orgs-title">Papéis e permissões</h2>
              </div>
              <Button className="platform__btn-cta-solid d-flex align-items-center" variant="teal-blue" onClick={openCreateRole}>
                Novo papel&nbsp;&nbsp;
                <Icons typeIcon="plus" iconSize={16} fill="#fff" />
              </Button>
            </div>
            <p className="platform__pricing-subtitle">
              Crie papéis com conjuntos de permissões e atribua aos usuários. O <b>super-admin</b> (você) tem tudo,
              independentemente de papel.
            </p>

            {roles.length === 0 ? (
              <p className="platform__empty">Nenhum papel criado. Clique em “Novo papel”.</p>
            ) : (
              <div className="platform__roles">
                {roles.map((role) => (
                  <div className="platform__role-card" key={role.id}>
                    <div className="platform__role-head">
                      <h4>{role.name}</h4>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-teal-blue" onClick={() => openEditRole(role)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteRole(role.id)}>Excluir</Button>
                      </div>
                    </div>
                    <div className="platform__role-perms">
                      {(role.permissions || []).length === 0 ? (
                        <span className="platform__role-empty">Sem permissões</span>
                      ) : (
                        (role.permissions || []).map((key) => (
                          <span className="platform__role-chip" key={key}>
                            {permCatalog.find((p) => p.key === key)?.label || key}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {section === 'config' && (
          <section className="platform__orgs">
            <div className="platform__section-title-row">
              <span className="platform__section-icon platform__section-icon--blue">
                <Icons typeIcon="settings" iconSize={20} fill="#2E5AAC" />
              </span>
              <h2 className="platform__orgs-title">Configuração & backup</h2>
            </div>
            <p className="platform__pricing-subtitle">
              Status da configuração da plataforma (somente leitura) e exportação dos dados dos clientes.
            </p>

            <div className="platform__fin-tiles">
              <div className="platform__fin-tile">
                <span className="platform__fin-value" style={{ fontSize: '1.1rem' }}>{config?.ownerCount ?? '—'}</span>
                <span className="platform__fin-label">Super-admins (allowlist)</span>
              </div>
              <div className="platform__fin-tile">
                <Badge bg={config?.webhookConfigured ? 'success' : 'secondary'}>
                  {config?.webhookConfigured ? 'Configurado' : 'Não configurado'}
                </Badge>
                <span className="platform__fin-label">Webhook de cobrança</span>
              </div>
              <div className="platform__fin-tile">
                <Badge bg={config?.marketplaceConfigured ? 'success' : 'secondary'}>
                  {config?.marketplaceConfigured ? 'Ativo' : 'Inativo'}
                </Badge>
                <span className="platform__fin-label">Marketplace PagarMe (split)</span>
              </div>
              <div className="platform__fin-tile">
                <span className="platform__fin-value" style={{ fontSize: '0.95rem', wordBreak: 'break-all' }}>
                  {config?.frontendUrl || '—'}
                </span>
                <span className="platform__fin-label">URL do frontend</span>
              </div>
            </div>
            <p className="platform__fin-note">
              <Icons typeIcon="simple-info" iconSize={15} fill="#7f7878" /> Chaves sensíveis (e-mails de owner, segredo
              do webhook, chave PagarMe) ficam <b>só nas variáveis de ambiente</b> por segurança — não são editáveis por
              aqui.
            </p>

            <div className="platform__pricing-tier-title">Backup / exportação</div>
            <p className="platform__pricing-subtitle">Baixe um CSV com todos os clientes (nome, plano, cobrança, eventos).</p>
            <Button variant="teal-blue" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exportando...' : 'Exportar clientes (CSV)'}
            </Button>
          </section>
          )}

          {section === 'sistema' && (
          <section className="platform__system">
            <div className="platform__section-title-row">
              <span className="platform__section-icon platform__section-icon--warn">
                <Icons typeIcon="refresh" iconSize={20} fill="#b9770a" />
              </span>
              <h2 className="platform__orgs-title">Estágio do sistema</h2>
            </div>
            <p className="platform__pricing-subtitle">
              Controle global da aplicação. Ao fechar, <b>todos os tenants e inscritos</b> veem a tela de manutenção —
              só <b>você (owner)</b> continua acessando o painel para reabrir.
            </p>

            <div className="platform__stage-options">
              {SYSTEM_STAGES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`platform__stage-option is-${option.tone} ${sysStage === option.value ? 'is-active' : ''}`}
                  onClick={() => setSysStage(option.value)}
                >
                  <span className="platform__stage-dot" />
                  <span className="platform__stage-name">{option.label}</span>
                  <span className="platform__stage-desc">{option.desc}</span>
                </button>
              ))}
            </div>

            <Form.Group className="mt-3">
              <Form.Label>
                <b>Mensagem exibida (opcional):</b>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={sysMessage}
                onChange={(e) => setSysMessage(e.target.value)}
                placeholder="Ex.: Voltamos às 14h. Estamos melhorando o sistema."
              />
            </Form.Group>

            <div className="platform__pricing-actions">
              <Button variant="teal-blue" onClick={handleSaveSystemStage} disabled={savingSys}>
                {savingSys ? 'Salvando...' : 'Aplicar estágio'}
              </Button>
            </div>
          </section>
          )}
        </main>
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="info"
        title={draft.id ? 'Editar organização' : 'Nova organização'}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="platform__form">
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Nome:</b>
                </Form.Label>
                <Form.Control
                  value={draft.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      name,
                      slug: prev.id ? prev.slug : slugify(name),
                    }));
                  }}
                  placeholder="Ex.: Igreja Batista Central"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Identificador (slug):</b>
                </Form.Label>
                {draft.id ? (
                  <Form.Control value={draft.slug} readOnly plaintext className="platform__form-readonly" />
                ) : (
                  <Form.Control
                    value={draft.slug}
                    onChange={(e) => handleChange('slug')(slugify(e.target.value))}
                    placeholder="igreja-batista-central"
                  />
                )}
                <Form.Text className="text-muted">Usado na URL: /e/{draft.slug || 'slug'}</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>E-mail de contato:</b>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={draft.contactEmail}
                  onChange={(e) => handleChange('contactEmail')(e.target.value)}
                  placeholder="contato@igreja.com"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Plano:</b>
                </Form.Label>
                <Form.Select value={draft.plan} onChange={(e) => handleChange('plan')(e.target.value)}>
                  {PLAN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Status:</b>
                </Form.Label>
                <Form.Select value={draft.status} onChange={(e) => handleChange('status')(e.target.value)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Nível de recursos:</b>
                </Form.Label>
                <Form.Select value={draft.tier} onChange={(e) => handleChange('tier')(e.target.value)}>
                  {TIER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">Essencial oculta logística (caronas, quartos, times, etc.).</Form.Text>
              </Form.Group>
            </Col>

            {draft.id && (
              <>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <b>Recebedor PagarMe (recipient_id):</b>
                    </Form.Label>
                    <Form.Control
                      value={draft.pagarmeRecipientId}
                      onChange={(e) => handleChange('pagarmeRecipientId')(e.target.value)}
                      placeholder="rp_xxxxxxxxxxxxxxxx"
                    />
                    <Form.Text className="text-muted">Conta da igreja no split. Preenchido no onboarding.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <b>Taxa da plataforma (%):</b>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      max={100}
                      value={draft.platformFeePercent}
                      onChange={(e) => handleChange('platformFeePercent')(e.target.value)}
                      placeholder="padrão da plataforma"
                    />
                    <Form.Text className="text-muted">% retido por inscrição paga. Vazio = usa o padrão.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <b>Evento gratuito — por evento (R$):</b>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      step="0.01"
                      value={draft.freeEventFee}
                      onChange={(e) => handleChange('freeEventFee')(e.target.value)}
                      placeholder="padrão da plataforma"
                    />
                    <Form.Text className="text-muted">Vazio = usa o padrão global.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <b>Evento gratuito — anual ilimitado (R$):</b>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      step="0.01"
                      value={draft.freeEventAnnual}
                      onChange={(e) => handleChange('freeEventAnnual')(e.target.value)}
                      placeholder="padrão da plataforma"
                    />
                    <Form.Text className="text-muted">Vazio = usa o padrão global.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>
                      <b>Cobrança:</b>
                    </Form.Label>
                    <Form.Select value={draft.billingStatus} onChange={(e) => handleChange('billingStatus')(e.target.value)}>
                      {BILLING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>
                      <b>Vencimento:</b>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={draft.dueDate}
                      onChange={(e) => handleChange('dueDate')(e.target.value)}
                    />
                    <Form.Text className="text-muted">Bloqueia form em +2d, admin em +7d.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>
                      <b>Fim do trial:</b>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={draft.trialEndsAt}
                      onChange={(e) => handleChange('trialEndsAt')(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </CustomModal>

      <CustomModal
        show={showFaqModal}
        onHide={() => setShowFaqModal(false)}
        variant="info"
        title={faqDraft.id ? 'Editar pergunta' : 'Nova pergunta'}
        icon={faqDraft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowFaqModal(false)} disabled={savingFaq}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSaveFaq} disabled={savingFaq}>
              {savingFaq ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="platform__form">
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <b>Pergunta:</b>
                </Form.Label>
                <Form.Control
                  value={faqDraft.question}
                  onChange={(e) => handleFaqChange('question')(e.target.value)}
                  placeholder="Ex.: Como funciona a cobrança?"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <b>Resposta:</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={faqDraft.answer}
                  onChange={(e) => handleFaqChange('answer')(e.target.value)}
                  placeholder="Resposta (aceita HTML simples)."
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Ordem:</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={faqDraft.order}
                  onChange={(e) => handleFaqChange('order')(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      <CustomModal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
        variant="info"
        title={roleDraft.id ? 'Editar papel' : 'Novo papel'}
        icon={roleDraft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowRoleModal(false)} disabled={savingRole}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSaveRole} disabled={savingRole}>
              {savingRole ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="platform__form">
          <Form.Group className="mb-3">
            <Form.Label><b>Nome do papel:</b></Form.Label>
            <Form.Control
              value={roleDraft.name}
              onChange={(e) => setRoleDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex.: Suporte, Financeiro"
            />
          </Form.Group>
          <Form.Label><b>Permissões:</b></Form.Label>
          <div className="platform__perm-list">
            {permCatalog.map((p) => (
              <label className="platform__perm-item" key={p.key}>
                <input
                  type="checkbox"
                  checked={roleDraft.permissions.includes(p.key)}
                  onChange={() => toggleRolePerm(p.key)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(impersonate)}
        onHide={() => setImpersonate(null)}
        variant="info"
        title={`Entrar no admin — ${impersonate?.name || ''}`}
        icon="person"
        footer={
          <Button variant="outline-secondary" onClick={() => setImpersonate(null)}>
            Fechar
          </Button>
        }
      >
        <p className="platform__pricing-subtitle">
          Escolha um evento desta igreja para abrir o painel administrativo dela (suporte). Você entra com acesso total.
        </p>
        {impersonateLoading ? (
          <Loading loading />
        ) : impersonateEvents.length === 0 ? (
          <p className="platform__empty">Esta igreja não tem eventos ativos.</p>
        ) : (
          <div className="platform__impersonate-list">
            {impersonateEvents.map((event) => (
              <button
                key={event.slug}
                type="button"
                className="platform__impersonate-item"
                onClick={() => enterAdminAs(event.slug)}
              >
                <span>{event.name}</span>
                <Icons typeIcon="arrow-right" iconSize={16} fill="#007185" />
              </button>
            ))}
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default Platform;
