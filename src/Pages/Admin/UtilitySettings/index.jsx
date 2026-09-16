import { useEffect, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { parse, isValid } from 'date-fns';

import { getSetting, updateSetting } from '@/services/settings';
import { uploadGuardianDocument } from '@/services/documents';
import { BASE_URL } from '@/config';
import { getBaseDate, createBaseDate, updateBaseDate } from '@/services/baseDate';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

registerLocale('ptBR', ptBR);

const CONTACT_KEY = 'contact_phone';
const SPREADSHEET_KEY = 'old_spreadsheet_url';
const BOLETO_MAX_KEY = 'boleto_max_installments';
const BOLETO_MIN_DAYS_KEY = 'boleto_min_days_before_event';
const CREW_BUS_KEY = 'crew_bus_vacancies';
const PAGARME_DASH_KEY = 'pagarme_dashboard_url';
const BACKUP_EMAIL_KEY = 'backup_email';
const EVENT_MAP_KEY = 'event_map';
const SOCIAL_LINKS_KEY = 'social_links';
const DECLARATION_TEMPLATE_KEY = 'guardian_declaration_template_id';

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
  const [contact, setContact] = useState('');
  const [spreadsheet, setSpreadsheet] = useState('');
  const [baseDate, setBaseDate] = useState('');
  const [baseDateExists, setBaseDateExists] = useState(false);
  const [boletoMax, setBoletoMax] = useState('');
  const [boletoMinDays, setBoletoMinDays] = useState('');
  const [crewBus, setCrewBus] = useState('');
  const [pagarmeDash, setPagarmeDash] = useState('');
  const [backupEmail, setBackupEmail] = useState('');
  const [eventMap, setEventMap] = useState('');
  const [social, setSocial] = useState({});
  const [templateId, setTemplateId] = useState('');
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  scrollUp();

  const load = async () => {
    setLoading(true);

    try {
      const [
        contactValue,
        spreadsheetValue,
        boletoMaxValue,
        boletoMinDaysValue,
        crewBusValue,
        pagarmeDashValue,
        backupEmailValue,
        eventMapValue,
        socialValue,
        templateValue,
        baseDateData,
      ] = await Promise.all([
        getSetting(CONTACT_KEY),
        getSetting(SPREADSHEET_KEY),
        getSetting(BOLETO_MAX_KEY),
        getSetting(BOLETO_MIN_DAYS_KEY),
        getSetting(CREW_BUS_KEY),
        getSetting(PAGARME_DASH_KEY),
        getSetting(BACKUP_EMAIL_KEY),
        getSetting(EVENT_MAP_KEY),
        getSetting(SOCIAL_LINKS_KEY),
        getSetting(DECLARATION_TEMPLATE_KEY),
        getBaseDate(),
      ]);
      setContact(contactValue);
      setSpreadsheet(spreadsheetValue);
      setBoletoMax(boletoMaxValue || '');
      setBoletoMinDays(boletoMinDaysValue || '');
      setCrewBus(crewBusValue || '');
      setPagarmeDash(pagarmeDashValue || '');
      setBackupEmail(backupEmailValue || '');
      setEventMap(eventMapValue || '');
      setSocial(parseSocial(socialValue));
      setTemplateId(templateValue || '');
      if (baseDateData && baseDateData.baseDate) {
        setBaseDate(baseDateData.baseDate);
        setBaseDateExists(true);
      }
    } catch {
      toast.error('Erro ao carregar as informações utilitárias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setLoading(true);

    try {
      const cleanSocial = SOCIAL_NETWORKS.reduce((acc, network) => {
        const value = (social[network.key] || '').trim();
        if (value) acc[network.key] = value;
        return acc;
      }, {});

      const [
        contactValue,
        spreadsheetValue,
        boletoMaxValue,
        boletoMinDaysValue,
        crewBusValue,
        pagarmeDashValue,
        backupEmailValue,
        eventMapValue,
        socialValue,
      ] = await Promise.all([
        updateSetting(CONTACT_KEY, contact.trim()),
        updateSetting(SPREADSHEET_KEY, spreadsheet.trim()),
        updateSetting(BOLETO_MAX_KEY, boletoMax.trim()),
        updateSetting(BOLETO_MIN_DAYS_KEY, boletoMinDays.trim()),
        updateSetting(CREW_BUS_KEY, crewBus.trim()),
        updateSetting(PAGARME_DASH_KEY, pagarmeDash.trim()),
        updateSetting(BACKUP_EMAIL_KEY, backupEmail.trim()),
        updateSetting(EVENT_MAP_KEY, eventMap.trim()),
        updateSetting(SOCIAL_LINKS_KEY, JSON.stringify(cleanSocial)),
      ]);
      setContact(contactValue || '');
      setSpreadsheet(spreadsheetValue || '');
      setBoletoMax(boletoMaxValue || '');
      setBoletoMinDays(boletoMinDaysValue || '');
      setCrewBus(crewBusValue || '');
      setPagarmeDash(pagarmeDashValue || '');
      setBackupEmail(backupEmailValue || '');
      setEventMap(eventMapValue || '');
      setSocial(parseSocial(socialValue));

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
    } catch {
      toast.error('Erro ao salvar as informações utilitárias.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleTemplateChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingTemplate(true);
    setLoading(true);
    try {
      const data = await uploadGuardianDocument(file);
      await updateSetting(DECLARATION_TEMPLATE_KEY, String(data.id));
      setTemplateId(String(data.id));
      registerLog('Atualizou o modelo da declaração de responsabilidade', loggedUsername);
      toast.success('Modelo da declaração atualizado.');
    } catch (error) {
      console.error('Erro ao enviar o modelo:', error);
      toast.error('Não foi possível enviar o modelo. Tente novamente.');
    } finally {
      setUploadingTemplate(false);
      event.target.value = '';
      setLoading(false);
    }
  };

  return (
    <div className="admin-subpage utility-settings">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Informações Utilitárias"
        subtitle="Telefone de contato, planilha antiga, data do evento e parcelamento do boleto."
        typeIcon="settings"
      />

      <div className="utility-settings__content">
        <Form>
          <Row className="g-3">
            <Col xs={12} lg={6}>
              <div className="utility-card h-100">
                <div className="utility-card__header">
                  <span className="utility-card__icon">
                    <Icons typeIcon="whatsapp" iconSize={20} fill="#007185" />
                  </span>
                  <span>Contato &amp; Divulgação</span>
                </div>
                <div className="utility-card__body">
                  <Form.Group className="mb-5">
                    <Form.Label>
                      <b>Telefone de Contato (WhatsApp):</b>
                    </Form.Label>
                    <Form.Control
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="(81) 99999-9999"
                    />
                    <Form.Text className="text-muted-italic">
                      Usado em todos os lugares que divulgam o contato da organização (WhatsApp, FAQ, telas de espera).
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label>
                      <b>Link da Planilha Antiga:</b>
                    </Form.Label>
                    <Form.Control
                      value={spreadsheet}
                      onChange={(e) => setSpreadsheet(e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                    <Form.Text className="text-muted-italic">
                      Botão &quot;Planilha Antiga&quot; na home do admin. Deixe em branco para ocultar.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label>
                      <b>Link do Painel PagarMe (pedidos):</b>
                    </Form.Label>
                    <Form.Control
                      value={pagarmeDash}
                      onChange={(e) => setPagarmeDash(e.target.value)}
                      placeholder="https://dash.pagar.me/merch_.../acc_.../orders/"
                    />
                    <Form.Text className="text-muted-italic">
                      Prefixo do link &quot;ver pedido&quot; no PagarMe (com o merchant/account da sua conta). O número
                      do pedido é adicionado ao final.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label>
                      <b>E-mail do Backup Diário:</b>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={backupEmail}
                      onChange={(e) => setBackupEmail(e.target.value)}
                      placeholder="secretaria@exemplo.com"
                    />
                    <Form.Text className="text-muted-italic">
                      Todo dia de madrugada o sistema envia a planilha (CSV) dos inscritos para este e-mail. Em branco =
                      envia para o e-mail remetente do sistema.
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={6}>
              <div className="utility-card h-100">
                <div className="utility-card__header">
                  <span className="utility-card__icon">
                    <Icons typeIcon="calendar-alt" iconSize={20} fill="#007185" />
                  </span>
                  <span>Evento &amp; Parcelamento do Boleto</span>
                </div>
                <div className="utility-card__body">
                  <Form.Group className="mb-5">
                    <Form.Label>
                      <b>Data do Evento:</b>
                    </Form.Label>
                    <div>
                      <DatePicker
                        selected={parseDate(baseDate)}
                        onChange={(date) => setBaseDate(formatDate(date))}
                        className="form-control form-control-lg mb-1"
                        placeholderText="dd/mm/aaaa"
                        dateFormat="dd/MM/yyyy"
                        locale="ptBR"
                        dropdownMode="select"
                        showMonthDropdown
                        showYearDropdown
                      />
                    </div>
                    <Form.Text className="text-muted-italic">
                      Data de início do evento. Referência para o cálculo de idades/pacotes e para quantas parcelas de
                      boleto o inscrito pode escolher (1 boleto por mês até o mês anterior ao evento).
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label>
                      <b>Máximo de Parcelas no Boleto:</b>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="12"
                      value={boletoMax}
                      onChange={(e) => setBoletoMax(e.target.value)}
                      placeholder="5"
                    />
                    <Form.Text className="text-muted-italic">
                      Teto de parcelas do boleto. O inscrito escolhe de 1 até este limite, respeitando os meses que
                      faltam para o evento.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label>
                      <b>Vencimento do Último Boleto (dias antes do evento):</b>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={boletoMinDays}
                      onChange={(e) => setBoletoMinDays(e.target.value)}
                      placeholder="10"
                    />
                    <Form.Text className="text-muted-italic">
                      Trava a data de vencimento do <b>último boleto</b> para no mínimo esta quantidade de dias corridos
                      antes do evento. Considerando que o boleto será pago <b>até o vencimento</b>, o dinheiro leva de{' '}
                      <b>2 a 5 dias úteis</b> para cair na conta (compensação + liquidação). Defina uma folga suficiente
                      para o valor cair antes do evento. Em branco usa o padrão (10 dias).
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label>
                      <b>Vagas do Ônibus da Equipe:</b>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={crewBus}
                      onChange={(e) => setCrewBus(e.target.value)}
                      placeholder="22"
                    />
                    <Form.Text className="text-muted-italic">
                      Total de vagas no ônibus reservado para a equipe/crew (usado no contador da home do admin).
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={6}>
              <div className="utility-card h-100">
                <div className="utility-card__header">
                  <span className="utility-card__icon">
                    <Icons typeIcon="location-pin" iconSize={20} fill="#007185" />
                  </span>
                  <span>Local do evento (mapa)</span>
                </div>
                <div className="utility-card__body">
                  <Form.Group className="mb-5">
                    <Form.Label>
                      <b>Endereço ou link do Google Maps:</b>
                    </Form.Label>
                    <Form.Control
                      value={eventMap}
                      onChange={(e) => setEventMap(e.target.value)}
                      placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF"
                    />
                    <Form.Text className="text-muted-italic">
                      Mostra um mapa do local na home do evento. Deixe em branco para ocultar.
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={6}>
              <div className="utility-card h-100">
                <div className="utility-card__header">
                  <span className="utility-card__icon">
                    <Icons typeIcon="world" iconSize={20} fill="#007185" />
                  </span>
                  <span>Redes sociais (rodapé)</span>
                </div>
                <div className="utility-card__body">
                  {SOCIAL_NETWORKS.map((network) => (
                    <Form.Group className="mb-3" key={network.key}>
                      <Form.Label>
                        <b>{network.label}:</b>
                      </Form.Label>
                      <Form.Control
                        value={social[network.key] || ''}
                        onChange={(e) => setSocial((prev) => ({ ...prev, [network.key]: e.target.value }))}
                        placeholder={network.placeholder}
                      />
                    </Form.Group>
                  ))}
                  <Form.Text className="text-muted-italic">
                    Cada ícone só aparece no rodapé quando o link é preenchido.
                  </Form.Text>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={6}>
              <div className="utility-card h-100">
                <div className="utility-card__header">
                  <span className="utility-card__icon">
                    <Icons typeIcon="notebook" iconSize={20} fill="#007185" />
                  </span>
                  <span>Modelo da Declaração (menor de idade)</span>
                </div>
                <div className="utility-card__body">
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <b>Declaração de responsabilidade (PDF):</b>
                    </Form.Label>
                    <div className="utility-template-actions">
                      <label className="utility-template-btn">
                        <Icons typeIcon="upload" iconSize={18} />
                        <span>{templateId ? 'Trocar Modelo' : 'Enviar Modelo'}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={uploadingTemplate}
                          onChange={handleTemplateChange}
                          hidden
                        />
                      </label>
                      {templateId && (
                        <a
                          className="utility-template-btn utility-template-btn--ghost"
                          href={`${BASE_URL}/documents/template`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icons typeIcon="download" iconSize={18} />
                          <span>Ver Atual</span>
                        </a>
                      )}
                    </div>
                    <Form.Text className="text-muted-italic">
                      É o PDF que o inscrito menor de idade baixa, imprime, assina e reenvia. Substitua aqui quando o
                      termo mudar.
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </Col>
          </Row>

          <Button variant="teal-blue" size="lg" className="mt-3" onClick={handleSave} disabled={saving}>
            Salvar alterações
          </Button>

          <Loading loading={loading} />
        </Form>
      </div>
    </div>
  );
};

AdminUtilitySettings.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminUtilitySettings;
