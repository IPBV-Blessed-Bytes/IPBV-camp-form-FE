import { useEffect, useMemo, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { parse, isValid } from 'date-fns';

import { getEvent, updateEvent } from '@/services/events';
import { getBaseDate, createBaseDate, updateBaseDate } from '@/services/baseDate';
import { getMinorTemplateExists, uploadMinorTemplate, minorTemplateDownloadUrl } from '@/services/minorTemplate';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getEventSlug } from '@/config/eventScope';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import FormSection from '@/components/Admin/FormSection';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import SpinnerButton from '@/components/Global/SpinnerButton';
import './style.scss';

registerLocale('ptBR', ptBR);

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

const parseDate = (dateString) => {
  if (!dateString) return null;
  const parsed = parse(dateString, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
};

const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR');
};

const AdminUtilitySettings = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const slug = useMemo(() => getEventSlug(), []);
  const [event, setEvent] = useState(null);
  const [contact, setContact] = useState('');
  const [spreadsheet, setSpreadsheet] = useState('');
  const [pagarmeDash, setPagarmeDash] = useState('');
  const [baseDate, setBaseDate] = useState('');
  const [baseDateExists, setBaseDateExists] = useState(false);
  const [boletoMax, setBoletoMax] = useState('');
  const [boletoMinDays, setBoletoMinDays] = useState('');
  const [crewBus, setCrewBus] = useState('');
  const [eventMap, setEventMap] = useState('');
  const [social, setSocial] = useState({});
  const [whatsappGroup, setWhatsappGroup] = useState('');
  const [showLgpd, setShowLgpd] = useState(true);
  const [templateExists, setTemplateExists] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  scrollUp();

  const load = async () => {
    setLoading(true);
    try {
      const [eventData, baseDateData, templateExistsData] = await Promise.all([
        getEvent(slug),
        getBaseDate().catch(() => null),
        getMinorTemplateExists().catch(() => false),
      ]);
      setEvent(eventData);
      setContact(eventData?.contact || '');
      setSpreadsheet(eventData?.oldSpreadsheetUrl || '');
      setPagarmeDash(eventData?.pagarmeDashboardUrl || '');
      setBoletoMax(eventData?.boletoMaxInstallments ? String(eventData.boletoMaxInstallments) : '');
      setBoletoMinDays(eventData?.boletoMinDaysBeforeEvent ? String(eventData.boletoMinDaysBeforeEvent) : '');
      setCrewBus(eventData?.crewBusVacancies ? String(eventData.crewBusVacancies) : '');
      setEventMap(eventData?.mapQuery || '');
      setSocial(parseSocial(eventData?.socialLinks));
      setWhatsappGroup(eventData?.whatsappGroupLink || '');
      setShowLgpd(eventData?.showLgpdModal !== false);
      if (baseDateData && baseDateData.baseDate) {
        setBaseDate(baseDateData.baseDate);
        setBaseDateExists(true);
      }
      setTemplateExists(Boolean(templateExistsData));
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.utility.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    try {
      const cleanSocial = SOCIAL_NETWORKS.reduce((acc, network) => {
        const value = (social[network.key] || '').trim();
        if (value) acc[network.key] = value;
        return acc;
      }, {});

      await updateEvent(event.id, {
        ...event,
        contact: contact.trim(),
        oldSpreadsheetUrl: spreadsheet.trim(),
        pagarmeDashboardUrl: pagarmeDash.trim(),
        boletoMaxInstallments: boletoMax ? Number(boletoMax) : 1,
        boletoMinDaysBeforeEvent: boletoMinDays ? Number(boletoMinDays) : null,
        crewBusVacancies: crewBus ? Number(crewBus) : null,
        mapQuery: eventMap.trim(),
        socialLinks: JSON.stringify(cleanSocial),
        whatsappGroupLink: whatsappGroup.trim(),
        showLgpdModal: showLgpd,
      });

      if (baseDate) {
        if (baseDateExists) {
          await updateBaseDate(baseDate);
        } else {
          await createBaseDate(baseDate);
          setBaseDateExists(true);
        }
      }

      registerLog('Atualizou as informações utilitárias', loggedUsername);
      toast.success(t('admin.utility.saveSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.utility.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTemplate(true);
    try {
      await uploadMinorTemplate(file);
      setTemplateExists(true);
      registerLog('Atualizou o modelo da declaração de responsabilidade', loggedUsername);
      toast.success(t('admin.utility.templateUpdated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('admin.utility.templateUploadError'));
    } finally {
      setUploadingTemplate(false);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-subpage admin-subpage--settings utility-settings">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.utility.title')}
        subtitle={t('admin.utility.subtitle')}
        typeIcon="settings"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <Row className="g-4">
              <Col xs={12} lg={6}>
                <FormSection title={t('admin.utility.contactSectionTitle')}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('admin.utility.contactLabel')}</Form.Label>
                    <Form.Control value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t('admin.utility.contactPlaceholder')} />
                    <Form.Text className="text-muted">
                      {t('admin.utility.contactHelp')}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('admin.utility.spreadsheetLabel')}</Form.Label>
                    <Form.Control value={spreadsheet} onChange={(e) => setSpreadsheet(e.target.value)} placeholder={t('admin.utility.spreadsheetPlaceholder')} />
                    <Form.Text className="text-muted">{t('admin.utility.spreadsheetHelp')}</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label>{t('admin.utility.pagarmeLabel')}</Form.Label>
                    <Form.Control value={pagarmeDash} onChange={(e) => setPagarmeDash(e.target.value)} placeholder={t('admin.utility.pagarmePlaceholder')} />
                    <Form.Text className="text-muted">{t('admin.utility.pagarmeHelp')}</Form.Text>
                  </Form.Group>
                </FormSection>
              </Col>

              <Col xs={12} lg={6}>
                <FormSection title={t('admin.utility.eventSectionTitle')}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('admin.utility.eventDateLabel')}</Form.Label>
                    <div>
                      <DatePicker
                        selected={parseDate(baseDate)}
                        onChange={(date) => setBaseDate(formatDate(date))}
                        className="form-control mb-1"
                        placeholderText={t('admin.utility.datePlaceholder')}
                        dateFormat="dd/MM/yyyy"
                        locale="ptBR"
                        dropdownMode="select"
                        showMonthDropdown
                        showYearDropdown
                      />
                    </div>
                    <Form.Text className="text-muted">
                      {t('admin.utility.eventDateHelp')}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('admin.utility.boletoMaxLabel')}</Form.Label>
                    <Form.Control type="number" min="1" max="12" value={boletoMax} onChange={(e) => setBoletoMax(e.target.value)} placeholder={t('admin.utility.boletoMaxPlaceholder')} />
                    <Form.Text className="text-muted">{t('admin.utility.boletoMaxHelp')}</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('admin.utility.boletoMinLabel')}</Form.Label>
                    <Form.Control type="number" min="1" value={boletoMinDays} onChange={(e) => setBoletoMinDays(e.target.value)} placeholder={t('admin.utility.boletoMinPlaceholder')} />
                    <Form.Text className="text-muted">
                      {t('admin.utility.boletoMinHelp')}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label>{t('admin.utility.crewBusLabel')}</Form.Label>
                    <Form.Control type="number" min="0" value={crewBus} onChange={(e) => setCrewBus(e.target.value)} placeholder={t('admin.utility.crewBusPlaceholder')} />
                    <Form.Text className="text-muted">{t('admin.utility.crewBusHelp')}</Form.Text>
                  </Form.Group>
                </FormSection>
              </Col>

              <Col xs={12} lg={6}>
                <FormSection title={t('admin.utility.mapSectionTitle')}>
                  <Form.Group className="mb-0">
                    <Form.Label>{t('admin.utility.mapLabel')}</Form.Label>
                    <Form.Control value={eventMap} onChange={(e) => setEventMap(e.target.value)} placeholder={t('admin.utility.mapPlaceholder')} />
                    <Form.Text className="text-muted">{t('admin.utility.mapHelp')}</Form.Text>
                  </Form.Group>
                </FormSection>

                <FormSection title={t('admin.utility.whatsappSectionTitle')}>
                  <Form.Group className="mb-0">
                    <Form.Label>{t('admin.utility.whatsappLabel')}</Form.Label>
                    <Form.Control value={whatsappGroup} onChange={(e) => setWhatsappGroup(e.target.value)} placeholder={t('admin.utility.whatsappPlaceholder')} />
                    <Form.Text className="text-muted">{t('admin.utility.whatsappHelp')}</Form.Text>
                  </Form.Group>
                </FormSection>

                <FormSection title={t('admin.utility.lgpdSectionTitle')}>
                  <Form.Check
                    type="switch"
                    id="show-lgpd-modal"
                    label={t('admin.utility.lgpdSwitch')}
                    checked={showLgpd}
                    onChange={(e) => setShowLgpd(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    {t('admin.utility.lgpdHelp')}
                  </Form.Text>
                </FormSection>
              </Col>

              <Col xs={12} lg={6}>
                <FormSection title={t('admin.utility.socialSectionTitle')}>
                  {SOCIAL_NETWORKS.map((network) => (
                    <Form.Group className="mb-3" key={network.key}>
                      <Form.Label>{network.label}</Form.Label>
                      <Form.Control
                        value={social[network.key] || ''}
                        onChange={(e) => setSocial((prev) => ({ ...prev, [network.key]: e.target.value }))}
                        placeholder={t(`admin.utility.social.${network.key}.placeholder`)}
                      />
                    </Form.Group>
                  ))}
                  <Form.Text className="text-muted">{t('admin.utility.socialHelp')}</Form.Text>
                </FormSection>

                <FormSection title={t('admin.utility.templateSectionTitle')}>
                  <Form.Group className="mb-0">
                    <Form.Label>{t('admin.utility.templateLabel')}</Form.Label>
                    <div className="utility-template-actions">
                      <label className="utility-template-btn">
                        <Icons typeIcon="upload" iconSize={18} />
                        <span>{templateExists ? t('admin.utility.changeTemplate') : t('admin.utility.sendTemplate')}</span>
                        <input type="file" accept="application/pdf" disabled={uploadingTemplate} onChange={handleTemplateChange} hidden />
                      </label>
                      {templateExists && (
                        <a className="utility-template-btn utility-template-btn--ghost" href={minorTemplateDownloadUrl()} target="_blank" rel="noopener noreferrer">
                          <Icons typeIcon="download" iconSize={18} />
                          <span>{t('admin.utility.viewCurrent')}</span>
                        </a>
                      )}
                    </div>
                    <Form.Text className="text-muted">
                      {t('admin.utility.templateHelp')}
                    </Form.Text>
                  </Form.Group>
                </FormSection>
              </Col>
            </Row>

            <div className="utility-settings__actions">
              <SpinnerButton variant="teal-blue" className="fw-bold" onClick={handleSave} loading={saving}>
                {t('admin.utility.saveChanges')}
              </SpinnerButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

AdminUtilitySettings.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminUtilitySettings;
