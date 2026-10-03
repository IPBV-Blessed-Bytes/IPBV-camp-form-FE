import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import EventIcons, { EVENT_ICONS } from '@/components/Global/EventIcons';

const ICON_KEYS = new Set(EVENT_ICONS.map((icon) => icon.key));

const STAGE_BADGE = (event) => {
  if (!event.active) return { bg: 'secondary', text: undefined, labelKey: 'inactive' };
  if (event.registrationsOpen === false) return { bg: 'warning', text: 'dark', labelKey: 'waiting' };
  return { bg: 'success', text: undefined, labelKey: 'open' };
};

import { listAllEvents, createEvent, updateEvent, deleteEvent, uploadEventImage, deleteEventImage, eventImageUrl } from '@/services/events';
import { setSelectedEvent } from '@/config/eventScope';
import { getApiErrorMessage } from '@/fetchers/helpers';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import './style.scss';
import Icons from '@/components/Global/Icons';
import SpinnerButton from '@/components/Global/SpinnerButton';

const EMPTY_EVENT = {
  id: null,
  name: '',
  slug: '',
  color: '#007185',
  secondaryColor: '#ffc107',
  contact: '',
  year: '',
  active: true,
  registrationsOpen: true,
  paymentEnabled: true,
  feeMode: 'passed',
  agePricingEnabled: false,
  registrationFeeEnabled: false,
  boletoEnabled: false,
  boletoMaxInstallments: 5,
  boletoMinDaysBeforeEvent: '',
  iconKey: '',
  contactMessage: '',
  shareMessage: '',
  storeDeliveryNote: '',
  oldSpreadsheetUrl: '',
  faviconUrl: '',
  mapQuery: '',
  social: {},
  groupDiscountThreshold: '',
  groupDiscountPercent: '',
  pagarmeDashboardUrl: '',
  crewBusVacancies: '',
  whatsappGroupLink: '',
  showLgpdModal: true,
};

const SOCIAL_NETWORKS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'email', label: 'E-mail' },
];

const parseSocial = (value) => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const buildSocial = (social) => {
  const clean = SOCIAL_NETWORKS.reduce((acc, network) => {
    const value = (social?.[network.key] || '').trim();
    if (value) acc[network.key] = value;
    return acc;
  }, {});
  return Object.keys(clean).length ? JSON.stringify(clean) : null;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const AdminEvents = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(EMPTY_EVENT);
  const [search, setSearch] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [hasImage, setHasImage] = useState(false);
  const imageInputRef = useRef(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { events: list, organizationSlug } = await listAllEvents();
      setEvents(list);
      setOrgSlug(organizationSlug);
    } catch {
      toast.error(t('admin.events.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_EVENT);
    setShowFormModal(true);
  };

  const publicUrl = orgSlug ? `${window.location.origin}/o/${orgSlug}` : '';

  const openPublicPage = () => {
    if (orgSlug) navigate(`/o/${orgSlug}`);
  };

  const copyPublicLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success(t('admin.events.publicLinkCopied'));
    } catch {
      toast.error(t('admin.events.publicLinkCopyError'));
    }
  };

  const openEdit = (event) => {
    setDraft({
      id: event.id,
      name: event.name || '',
      slug: event.slug || '',
      color: event.color || '#007185',
      secondaryColor: event.secondaryColor || '#ffc107',
      contact: event.contact || '',
      year: event.year || '',
      active: event.active ?? true,
      registrationsOpen: event.registrationsOpen !== false,
      paymentEnabled: event.paymentEnabled ?? true,
      feeMode: event.feeMode || 'passed',
      agePricingEnabled: event.agePricingEnabled ?? false,
      registrationFeeEnabled: event.registrationFeeEnabled ?? false,
      boletoEnabled: event.boletoEnabled ?? false,
      boletoMaxInstallments: event.boletoMaxInstallments ?? 5,
      boletoMinDaysBeforeEvent: event.boletoMinDaysBeforeEvent ?? '',
      iconKey: event.iconKey || '',
      contactMessage: event.contactMessage || '',
      shareMessage: event.shareMessage || '',
      storeDeliveryNote: event.storeDeliveryNote || '',
      oldSpreadsheetUrl: event.oldSpreadsheetUrl || '',
      faviconUrl: event.faviconUrl || '',
      mapQuery: event.mapQuery || '',
      social: parseSocial(event.socialLinks),
      groupDiscountThreshold:
        event.groupDiscountThresholdCents != null ? (event.groupDiscountThresholdCents / 100).toString() : '',
      groupDiscountPercent: event.groupDiscountPercent != null ? event.groupDiscountPercent.toString() : '',
      pagarmeDashboardUrl: event.pagarmeDashboardUrl ?? '',
      crewBusVacancies: event.crewBusVacancies ?? '',
      whatsappGroupLink: event.whatsappGroupLink ?? '',
      showLgpdModal: event.showLgpdModal !== false,
    });
    setHasImage(false);
    setImageVersion(Date.now());
    setShowFormModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !draft.id) return;
    setImageBusy(true);
    try {
      await uploadEventImage(draft.id, file);
      setImageVersion(Date.now());
      setHasImage(true);
      toast.success(t('admin.events.imageUpdated'));
    } catch {
      toast.error(t('admin.events.imageUploadError'));
    } finally {
      setImageBusy(false);
    }
  };

  const handleImageRemove = async () => {
    if (!draft.id) return;
    setImageBusy(true);
    try {
      await deleteEventImage(draft.id);
      setHasImage(false);
      setImageVersion(Date.now());
      toast.success(t('admin.events.imageRemoved'));
    } catch {
      toast.error(t('admin.events.imageRemoveError'));
    } finally {
      setImageBusy(false);
    }
  };

  const handleChange = (field) => (value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const openFormBuilder = (event) => {
    setSelectedEvent(event.slug, event.name);
    navigate('/admin/formulario');
  };

  const openSubmissions = (event) => {
    setSelectedEvent(event.slug, event.name);
    navigate('/admin/inscricoes');
  };

  const openInfoHome = (event) => {
    setSelectedEvent(event.slug, event.name);
    navigate('/admin/info');
  };

  const openInstitutional = (event) => {
    setSelectedEvent(event.slug, event.name);
    navigate('/admin/institucional');
  };

  const openFaq = (event) => {
    setSelectedEvent(event.slug, event.name);
    navigate('/admin/faq');
  };

  const openPackage = (event) => {
    setSelectedEvent(event.slug, event.name);
    navigate('/admin/pacote');
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.slug.trim()) {
      toast.error(t('admin.events.nameSlugRequired'));
      return;
    }

    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      color: draft.color || null,
      secondaryColor: draft.secondaryColor || null,
      contact: draft.contact.trim() || null,
      year: draft.year ? Number(draft.year) : null,
      active: draft.active,
      registrationsOpen: draft.registrationsOpen,
      paymentEnabled: draft.paymentEnabled,
      feeMode: draft.paymentEnabled ? draft.feeMode : 'passed',
      agePricingEnabled: draft.paymentEnabled ? draft.agePricingEnabled : false,
      registrationFeeEnabled: draft.paymentEnabled ? draft.registrationFeeEnabled : false,
      boletoEnabled: draft.paymentEnabled ? draft.boletoEnabled : false,
      boletoMaxInstallments: Number(draft.boletoMaxInstallments) || 1,
      boletoMinDaysBeforeEvent: draft.boletoMinDaysBeforeEvent ? Number(draft.boletoMinDaysBeforeEvent) : null,
      iconKey: draft.iconKey || null,
      contactMessage: draft.contactMessage.trim() || null,
      shareMessage: draft.shareMessage.trim() || null,
      storeDeliveryNote: draft.storeDeliveryNote.trim() || null,
      oldSpreadsheetUrl: draft.oldSpreadsheetUrl.trim() || null,
      faviconUrl: draft.faviconUrl.trim() || null,
      mapQuery: draft.mapQuery.trim() || null,
      socialLinks: buildSocial(draft.social),
      groupDiscountThresholdCents:
        draft.groupDiscountThreshold === '' || draft.groupDiscountThreshold == null
          ? null
          : Math.round(Number(draft.groupDiscountThreshold) * 100),
      groupDiscountPercent:
        draft.groupDiscountPercent === '' || draft.groupDiscountPercent == null
          ? null
          : Math.round(Number(draft.groupDiscountPercent)),
      pagarmeDashboardUrl: draft.pagarmeDashboardUrl?.trim() || null,
      crewBusVacancies:
        draft.crewBusVacancies === '' || draft.crewBusVacancies == null ? null : Number(draft.crewBusVacancies),
      whatsappGroupLink: draft.whatsappGroupLink?.trim() || null,
      showLgpdModal: draft.showLgpdModal !== false,
    };

    try {
      if (draft.id) {
        await updateEvent(draft.id, payload);
        toast.success(t('admin.events.eventUpdated'));
      } else {
        await createEvent(payload);
        toast.success(t('admin.events.eventCreated'));
      }
      setShowFormModal(false);
      await loadEvents();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.events.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteEvent(selected.id);
      toast.success(t('admin.events.eventDeleted'));
      setShowDeleteModal(false);
      setSelected(null);
      await loadEvents();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.events.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const openCount = events.filter((event) => event.active && event.registrationsOpen !== false).length;
  const waitingCount = events.filter((event) => event.active && event.registrationsOpen === false).length;
  const inactiveCount = events.filter((event) => !event.active).length;
  const statItems = [
    { label: t('admin.events.statEvents'), value: events.length },
    { label: t('admin.events.statOpen'), value: openCount, tone: 'free' },
    { label: t('admin.events.statWaiting'), value: waitingCount, tone: 'info' },
    { label: t('admin.events.statInactive'), value: inactiveCount, tone: 'used' },
  ];

  const term = search.trim().toLowerCase();
  const filteredEvents = term
    ? events.filter((event) => `${event.name || ''} ${event.slug || ''}`.toLowerCase().includes(term))
    : events;

  return (
    <div className="admin-subpage admin-events">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.events.title')}
        subtitle={t('admin.events.subtitle')}
        typeIcon="calendar"
      />

      <div className="admin-events__content">
        {!loading && events.length > 0 && <StatCards items={statItems} />}

        <div className="admin-events__toolbar">
          {events.length > 0 && (
            <SearchBox value={search} onChange={setSearch} placeholder={t('admin.events.searchPlaceholder')} />
          )}
          <div className="admin-events__toolbar-actions">
            {orgSlug && (
              <div className="admin-events__public-actions">
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="outline-teal-blue"
                  onClick={openPublicPage}
                >
                  <Icons typeIcon="world" iconSize={16} fill="currentColor" />
                  {t('admin.events.viewPublic')}
                </Button>
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="outline-teal-blue"
                  onClick={copyPublicLink}
                >
                  <Icons typeIcon="share" iconSize={16} fill="currentColor" />
                  {t('admin.events.copyLink')}
                </Button>
              </div>
            )}
            <Button className="d-flex align-items-center gap-2" variant="teal-blue" onClick={openCreate}>
              {t('admin.events.newEvent')}
              <Icons typeIcon="plus" iconSize={16} fill="#fff" />
            </Button>
          </div>
        </div>

        {loading ? (
          <Loading loading />
        ) : events.length === 0 ? (
          <p className="admin-events__empty">{t('admin.events.emptyNone')}</p>
        ) : filteredEvents.length === 0 ? (
          <p className="admin-events__empty">{t('admin.events.emptyFiltered')}</p>
        ) : (
          <div className="event-admin-grid">
            {filteredEvents.map((event) => {
              const badge = STAGE_BADGE(event);
              return (
                <div key={event.id} className="event-admin-card" style={{ '--card-accent': event.color || '#007185' }}>
                  <div className="event-admin-card__head">
                    <span className="event-admin-card__icon">
                      {ICON_KEYS.has(event.iconKey) ? (
                        <EventIcons typeIcon={event.iconKey} iconSize={26} />
                      ) : (
                        <span className="event-admin-card__initial">{(event.name || '?').charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                    <div className="event-admin-card__heading">
                      <div className="event-admin-card__name-row">
                        <h3 className="event-admin-card__name">{event.name}</h3>
                        {event.year && <span className="event-admin-card__year">{event.year}</span>}
                      </div>
                      <code className="event-admin-card__slug">/e/{event.slug}</code>
                    </div>
                  </div>

                  <div className="event-admin-card__meta">
                    <Badge bg={badge.bg} text={badge.text}>
                      {t(`admin.events.badge.${badge.labelKey}`)}
                    </Badge>
                    {event.paymentEnabled && (
                      <Badge bg="light" text="dark" className="event-admin-card__tag">
                        {t('admin.events.paymentTag')}
                      </Badge>
                    )}
                  </div>

                  <div className="event-admin-card__config">
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      className="d-flex align-items-center justify-content-center gap-1"
                      onClick={() => openFormBuilder(event)}
                    >
                      <Icons typeIcon="form" iconSize={17} fill="currentColor" />
                      {t('admin.events.cardFields')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      className="d-flex align-items-center justify-content-center gap-1"
                      onClick={() => openSubmissions(event)}
                    >
                      <Icons typeIcon="person" iconSize={17} fill="currentColor" />
                      {t('admin.events.cardSubmissions')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      className="d-flex align-items-center justify-content-center gap-1"
                      onClick={() => openInfoHome(event)}
                    >
                      <Icons typeIcon="info" iconSize={17} fill="currentColor" />
                      {t('admin.events.cardInfoHome')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      className="d-flex align-items-center justify-content-center gap-1"
                      onClick={() => openInstitutional(event)}
                    >
                      <Icons typeIcon="tent" iconSize={17} fill="currentColor" />
                      {t('admin.events.cardInstitutional')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      className="d-flex align-items-center justify-content-center gap-1"
                      onClick={() => openFaq(event)}
                    >
                      <Icons typeIcon="question" iconSize={17} fill="currentColor" />
                      {t('admin.events.cardFaq')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      className="d-flex align-items-center justify-content-center gap-1"
                      disabled={!event.paymentEnabled}
                      title={event.paymentEnabled ? '' : t('admin.events.packageDisabledTitle')}
                      onClick={() => openPackage(event)}
                    >
                      <Icons typeIcon="cart" iconSize={17} fill="currentColor" />
                      {t('admin.events.cardPackage')}
                    </Button>
                  </div>

                  <div className="event-admin-card__footer">
                    <Button
                      size="sm"
                      variant="teal-blue"
                      className="d-flex align-items-center justify-content-center gap-1"
                      onClick={() => openEdit(event)}
                    >
                      <Icons typeIcon="edit" iconSize={17} fill="none" className="icon-stroke" />
                      {t('admin.events.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="d-flex align-items-center justify-content-center gap-1"
                      onClick={() => {
                        setSelected(event);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Icons typeIcon="delete" iconSize={17} fill="currentColor" />
                      {t('admin.events.delete')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CustomModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        variant="info"
        size="lg"
        title={draft.id ? t('admin.events.editTitle') : t('admin.events.newTitle')}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowFormModal(false)} disabled={saving}>
              {t('admin.events.cancel')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleSave} loading={saving}>{t('admin.events.save')}</SpinnerButton>
          </>
        }
      >
        <Form className="admin-events__form">
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.nameLabel')}</b>
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
                  placeholder={t('admin.events.namePlaceholder')}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.slugLabel')}</b>
                </Form.Label>
                <Form.Control
                  value={draft.slug}
                  onChange={(e) => handleChange('slug')(slugify(e.target.value))}
                  placeholder={t('admin.events.slugPlaceholder')}
                />
                <Form.Text className="text-muted-italic">{t('admin.events.slugHelp', { slug: draft.slug || 'slug' })}</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.colorLabel')}</b>
                </Form.Label>
                <div className="admin-events__color-row">
                  <Form.Control
                    type="color"
                    value={draft.color || '#007185'}
                    onChange={(e) => handleChange('color')(e.target.value)}
                    title={t('admin.events.colorTitle')}
                  />
                  <Form.Control
                    value={draft.color || ''}
                    onChange={(e) => handleChange('color')(e.target.value)}
                    placeholder="#007185"
                  />
                </div>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.secondaryColorLabel')}</b>
                </Form.Label>
                <div className="admin-events__color-row">
                  <Form.Control
                    type="color"
                    value={draft.secondaryColor || '#ffc107'}
                    onChange={(e) => handleChange('secondaryColor')(e.target.value)}
                    title={t('admin.events.secondaryColorTitle')}
                  />
                  <Form.Control
                    value={draft.secondaryColor || ''}
                    onChange={(e) => handleChange('secondaryColor')(e.target.value)}
                    placeholder="#ffc107"
                  />
                </div>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.contactLabel')}</b>
                </Form.Label>
                <Form.Control
                  value={draft.contact}
                  onChange={(e) => handleChange('contact')(e.target.value)}
                  placeholder={t('admin.events.contactPlaceholder')}
                />
                <Form.Text className="text-muted-italic">
                  {t('admin.events.contactHelp')}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.yearLabel')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={draft.year}
                  onChange={(e) => handleChange('year')(e.target.value)}
                  placeholder={t('admin.events.yearPlaceholder')}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.iconLabel')}</b>
                </Form.Label>
                <div className="event-icon-field">
                  <Form.Select value={draft.iconKey} onChange={(e) => handleChange('iconKey')(e.target.value)}>
                    <option value="" disabled selected>
                      {t('admin.events.noIcon')}
                    </option>
                    {EVENT_ICONS.map((icon) => (
                      <option key={icon.key} value={icon.key}>
                        {icon.label}
                      </option>
                    ))}
                  </Form.Select>
                  <div
                    className="event-icon-field__preview"
                    style={{ color: draft.color || '#007185' }}
                    aria-label={t('admin.events.iconPreviewAria')}
                  >
                    {draft.iconKey ? (
                      <EventIcons typeIcon={draft.iconKey} iconSize={40} />
                    ) : (
                      <span className="event-icon-field__placeholder">{t('admin.events.noIconPlaceholder')}</span>
                    )}
                  </div>
                </div>
                <Form.Text className="text-muted-italic">
                  {t('admin.events.iconHelp')}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.imageLabel')}</b>
                </Form.Label>
                {draft.id ? (
                  <div className="event-image-field">
                    <img
                      className="event-image-field__preview"
                      src={`${eventImageUrl(draft.id)}?v=${imageVersion}`}
                      alt={t('admin.events.imageAlt')}
                      style={hasImage ? undefined : { display: 'none' }}
                      onLoad={() => setHasImage(true)}
                      onError={() => setHasImage(false)}
                    />
                    <div className="event-image-field__actions">
                      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      <Button
                        variant="outline-teal-blue"
                        size="sm"
                        disabled={imageBusy}
                        onClick={() => imageInputRef.current?.click()}
                      >
                        {imageBusy ? t('admin.events.sending') : hasImage ? t('admin.events.changeImage') : t('admin.events.sendImage')}
                      </Button>
                      {hasImage && (
                        <Button variant="outline-danger" size="sm" disabled={imageBusy} onClick={handleImageRemove}>
                          {t('admin.events.remove')}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Form.Text className="text-muted-italic d-block">
                    {t('admin.events.imageSaveFirst')}
                  </Form.Text>
                )}
                <Form.Text className="text-muted-italic">
                  {t('admin.events.imageHelp')}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.stageLabel')}</b>
                </Form.Label>
                <Form.Select
                  value={draft.active ? (draft.registrationsOpen ? 'open' : 'waiting') : 'inactive'}
                  onChange={(e) => {
                    const stage = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      active: stage !== 'inactive',
                      registrationsOpen: stage === 'open',
                    }));
                  }}
                >
                  <option value="open" selected disabled>
                    {t('admin.events.stageOpen')}
                  </option>
                  <option value="waiting">{t('admin.events.stageWaiting')}</option>
                  <option value="inactive">{t('admin.events.stageInactive')}</option>
                </Form.Select>
                <Form.Text className="text-muted-italic">
                  {t('admin.events.stageHelp')}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.contactMsgLabel')}</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={draft.contactMessage}
                  onChange={(e) => handleChange('contactMessage')(e.target.value)}
                  placeholder={t('admin.events.contactMsgPlaceholder')}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.shareMsgLabel')}</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={draft.shareMessage}
                  onChange={(e) => handleChange('shareMessage')(e.target.value)}
                  placeholder={t('admin.events.shareMsgPlaceholder')}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.deliveryNoteLabel')}</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={draft.storeDeliveryNote}
                  onChange={(e) => handleChange('storeDeliveryNote')(e.target.value)}
                  placeholder={t('admin.events.deliveryNotePlaceholder')}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.spreadsheetLabel')}</b>
                </Form.Label>
                <Form.Control
                  value={draft.oldSpreadsheetUrl}
                  onChange={(e) => handleChange('oldSpreadsheetUrl')(e.target.value)}
                  placeholder={t('admin.events.spreadsheetPlaceholder')}
                />
                <Form.Text className="text-muted-italic">
                  {t('admin.events.spreadsheetHelp')}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.faviconLabel')}</b>
                </Form.Label>
                <Form.Control
                  value={draft.faviconUrl}
                  onChange={(e) => handleChange('faviconUrl')(e.target.value)}
                  placeholder={t('admin.events.faviconPlaceholder')}
                />
                <Form.Text className="text-muted-italic">
                  {t('admin.events.faviconHelp')}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.mapLabel')}</b>
                </Form.Label>
                <Form.Control
                  value={draft.mapQuery}
                  onChange={(e) => handleChange('mapQuery')(e.target.value)}
                  placeholder={t('admin.events.mapPlaceholder')}
                />
                <Form.Text className="text-muted-italic">
                  {t('admin.events.mapHelp')}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <h6 className="fw-bold mb-2">{t('admin.events.groupDiscountTitle')}</h6>
          <Form.Text className="text-muted-italic d-block mb-3">
            {t('admin.events.groupDiscountHelp')}
          </Form.Text>
          <Row className="g-3 mb-2">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.groupMinLabel')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.groupDiscountThreshold}
                  onChange={(e) => handleChange('groupDiscountThreshold')(e.target.value)}
                  placeholder={t('admin.events.groupMinPlaceholder')}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>{t('admin.events.groupPercentLabel')}</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  value={draft.groupDiscountPercent}
                  onChange={(e) => handleChange('groupDiscountPercent')(e.target.value)}
                  placeholder={t('admin.events.groupPercentPlaceholder')}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <h6 className="fw-bold mb-2">{t('admin.events.socialTitle')}</h6>
          <Form.Text className="text-muted-italic d-block mb-3">
            {t('admin.events.socialHelp')}
          </Form.Text>
          <Row className="g-3">
            {SOCIAL_NETWORKS.map((network) => (
              <Col xs={12} md={6} key={network.key}>
                <Form.Group>
                  <Form.Label>
                    <b>{network.label}:</b>
                  </Form.Label>
                  <Form.Control
                    value={draft.social?.[network.key] || ''}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, social: { ...prev.social, [network.key]: e.target.value } }))
                    }
                    placeholder={t(`admin.events.social.${network.key}.placeholder`)}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>

          <hr className="my-4" />

          <Form.Check
            type="switch"
            id="event-payment-switch"
            className="mt-2"
            label={t('admin.events.paymentSwitch')}
            checked={draft.paymentEnabled}
            onChange={(e) => handleChange('paymentEnabled')(e.target.checked)}
          />
          <Form.Text className="text-muted-italic">
            {t('admin.events.paymentHelp')}
          </Form.Text>

          {draft.paymentEnabled && (
            <>
              <Form.Group className="mt-3">
                <Form.Label className="fw-bold mb-1 d-block">{t('admin.events.feeModeLabel')}</Form.Label>
                <Form.Select value={draft.feeMode} onChange={(e) => handleChange('feeMode')(e.target.value)}>
                  <option value="passed">{t('admin.events.feePassed')}</option>
                  <option value="absorbed">{t('admin.events.feeAbsorbed')}</option>
                </Form.Select>
                <Form.Text className="text-muted-italic">
                  {t('admin.events.feeHelp')}
                </Form.Text>
              </Form.Group>

              <Form.Check
                type="switch"
                id="event-age-pricing-switch"
                className="mt-2"
                label={t('admin.events.agePricingSwitch')}
                checked={draft.agePricingEnabled}
                onChange={(e) => handleChange('agePricingEnabled')(e.target.checked)}
              />
              <Form.Text className="text-muted-italic">
                {t('admin.events.agePricingHelp')}
              </Form.Text>

              <Form.Check
                type="switch"
                id="event-registration-fee-switch"
                className="mt-2"
                label={t('admin.events.regFeeSwitch')}
                checked={draft.registrationFeeEnabled}
                onChange={(e) => handleChange('registrationFeeEnabled')(e.target.checked)}
              />
              <Form.Text className="text-muted-italic">
                {t('admin.events.regFeeHelp')}
              </Form.Text>

              <Form.Check
                type="switch"
                id="event-boleto-switch"
                className="mt-3"
                label={t('admin.events.boletoSwitch')}
                checked={draft.boletoEnabled}
                onChange={(e) => handleChange('boletoEnabled')(e.target.checked)}
              />
              <Form.Text className="text-muted-italic">
                {t('admin.events.boletoHelp')}
              </Form.Text>
              {draft.boletoEnabled && (
                <>
                  <Form.Group className="mt-2" controlId="event-boleto-max">
                    <Form.Label className="mb-1">{t('admin.events.boletoMaxLabel')}</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={12}
                      value={draft.boletoMaxInstallments}
                      onChange={(e) => handleChange('boletoMaxInstallments')(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mt-2" controlId="event-boleto-min-days">
                    <Form.Label className="mb-1">{t('admin.events.boletoMinLabel')}</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      placeholder={t('admin.events.boletoMinPlaceholder')}
                      value={draft.boletoMinDaysBeforeEvent}
                      onChange={(e) => handleChange('boletoMinDaysBeforeEvent')(e.target.value)}
                    />
                    <Form.Text muted>
                      {t('admin.events.boletoMinHelp')}
                    </Form.Text>
                  </Form.Group>
                </>
              )}
            </>
          )}
        </Form>
      </CustomModal>

      <CustomModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        variant="cancel"
        title={t('admin.events.deleteTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} disabled={saving}>
              {t('admin.events.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={handleDelete} loading={saving}>{t('admin.events.delete')}</SpinnerButton>
          </>
        }
      >
        <p>
          <Trans
            i18nKey="admin.events.deleteConfirm"
            components={{ b: <b /> }}
            values={{ name: selected?.name }}
          />
        </p>
      </CustomModal>
    </div>
  );
};

AdminEvents.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminEvents;
