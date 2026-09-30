import { useEffect, useMemo, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
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
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/suaigreja' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/suaigreja' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@suaigreja' },
  { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/suaigreja' },
  { key: 'email', label: 'E-mail', placeholder: 'contato@suaigreja.com' },
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
      toast.error(getApiErrorMessage(error) || 'Erro ao carregar as informações utilitárias.');
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
      toast.success('Informações utilitárias atualizadas.');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar as informações utilitárias.');
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
      toast.success('Modelo da declaração atualizado.');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível enviar o modelo.');
    } finally {
      setUploadingTemplate(false);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-subpage admin-subpage--settings utility-settings">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Informações Utilitárias"
        subtitle="Contato, data do evento, parcelamento do boleto, mapa, redes sociais e mais."
        typeIcon="settings"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <Row className="g-4">
              <Col xs={12} lg={6}>
                <FormSection title="Contato & Divulgação">
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone de Contato (WhatsApp)</Form.Label>
                    <Form.Control value={contact} onChange={(e) => setContact(e.target.value)} placeholder="(81) 99999-9999" />
                    <Form.Text className="text-muted">
                      Usado onde o contato da organização é divulgado (WhatsApp, FAQ, telas de espera).
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Link da Planilha Antiga</Form.Label>
                    <Form.Control value={spreadsheet} onChange={(e) => setSpreadsheet(e.target.value)} placeholder="https://drive.google.com/..." />
                    <Form.Text className="text-muted">Botão &quot;Planilha Antiga&quot; na home do admin. Em branco = oculto.</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label>Link do Painel PagarMe (pedidos)</Form.Label>
                    <Form.Control value={pagarmeDash} onChange={(e) => setPagarmeDash(e.target.value)} placeholder="https://dash.pagar.me/.../orders/" />
                    <Form.Text className="text-muted">Prefixo do link &quot;ver pedido&quot;; o número do pedido é anexado ao final.</Form.Text>
                  </Form.Group>
                </FormSection>
              </Col>

              <Col xs={12} lg={6}>
                <FormSection title="Evento & Parcelamento do Boleto">
                  <Form.Group className="mb-3">
                    <Form.Label>Data do Evento</Form.Label>
                    <div>
                      <DatePicker
                        selected={parseDate(baseDate)}
                        onChange={(date) => setBaseDate(formatDate(date))}
                        className="form-control mb-1"
                        placeholderText="dd/mm/aaaa"
                        dateFormat="dd/MM/yyyy"
                        locale="ptBR"
                        dropdownMode="select"
                        showMonthDropdown
                        showYearDropdown
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Início do evento. Referência para cálculo de idades/pacotes e para as parcelas do boleto.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Máximo de Parcelas no Boleto</Form.Label>
                    <Form.Control type="number" min="1" max="12" value={boletoMax} onChange={(e) => setBoletoMax(e.target.value)} placeholder="5" />
                    <Form.Text className="text-muted">Teto de parcelas do boleto, respeitando os meses até o evento.</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Vencimento do Último Boleto (dias antes do evento)</Form.Label>
                    <Form.Control type="number" min="1" value={boletoMinDays} onChange={(e) => setBoletoMinDays(e.target.value)} placeholder="10" />
                    <Form.Text className="text-muted">
                      Trava o vencimento do último boleto para no mínimo esta folga (dias) antes do evento. Em branco usa o padrão.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label>Vagas do Ônibus da Equipe</Form.Label>
                    <Form.Control type="number" min="0" value={crewBus} onChange={(e) => setCrewBus(e.target.value)} placeholder="22" />
                    <Form.Text className="text-muted">Total de vagas no ônibus reservado para a equipe/crew.</Form.Text>
                  </Form.Group>
                </FormSection>
              </Col>

              <Col xs={12} lg={6}>
                <FormSection title="Local do evento (mapa)">
                  <Form.Group className="mb-0">
                    <Form.Label>Endereço ou link do Google Maps</Form.Label>
                    <Form.Control value={eventMap} onChange={(e) => setEventMap(e.target.value)} placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF" />
                    <Form.Text className="text-muted">Mostra um mapa do local na home do evento. Em branco = oculto.</Form.Text>
                  </Form.Group>
                </FormSection>

                <FormSection title="Grupo do WhatsApp">
                  <Form.Group className="mb-0">
                    <Form.Label>Link do grupo</Form.Label>
                    <Form.Control value={whatsappGroup} onChange={(e) => setWhatsappGroup(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
                    <Form.Text className="text-muted">O botão e o QR code só aparecem quando este link está preenchido.</Form.Text>
                  </Form.Group>
                </FormSection>

                <FormSection title="Modal de LGPD">
                  <Form.Check
                    type="switch"
                    id="show-lgpd-modal"
                    label="Exibir o modal de LGPD ao abrir o formulário"
                    checked={showLgpd}
                    onChange={(e) => setShowLgpd(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    Quando desligado, o aviso de conformidade com a LGPD não aparece na abertura do formulário.
                  </Form.Text>
                </FormSection>
              </Col>

              <Col xs={12} lg={6}>
                <FormSection title="Redes sociais (rodapé)">
                  {SOCIAL_NETWORKS.map((network) => (
                    <Form.Group className="mb-3" key={network.key}>
                      <Form.Label>{network.label}</Form.Label>
                      <Form.Control
                        value={social[network.key] || ''}
                        onChange={(e) => setSocial((prev) => ({ ...prev, [network.key]: e.target.value }))}
                        placeholder={network.placeholder}
                      />
                    </Form.Group>
                  ))}
                  <Form.Text className="text-muted">Cada ícone só aparece no rodapé quando o link é preenchido.</Form.Text>
                </FormSection>

                <FormSection title="Modelo da Declaração (menor de idade)">
                  <Form.Group className="mb-0">
                    <Form.Label>Declaração de responsabilidade (PDF)</Form.Label>
                    <div className="utility-template-actions">
                      <label className="utility-template-btn">
                        <Icons typeIcon="upload" iconSize={18} />
                        <span>{templateExists ? 'Trocar Modelo' : 'Enviar Modelo'}</span>
                        <input type="file" accept="application/pdf" disabled={uploadingTemplate} onChange={handleTemplateChange} hidden />
                      </label>
                      {templateExists && (
                        <a className="utility-template-btn utility-template-btn--ghost" href={minorTemplateDownloadUrl()} target="_blank" rel="noopener noreferrer">
                          <Icons typeIcon="download" iconSize={18} />
                          <span>Ver Atual</span>
                        </a>
                      )}
                    </div>
                    <Form.Text className="text-muted">
                      PDF que o inscrito menor de idade baixa, assina e reenvia. Substitua aqui quando o termo mudar.
                    </Form.Text>
                  </Form.Group>
                </FormSection>
              </Col>
            </Row>

            <div className="utility-settings__actions">
              <SpinnerButton variant="teal-blue" className="fw-bold" onClick={handleSave} loading={saving}>
                Salvar alterações
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
