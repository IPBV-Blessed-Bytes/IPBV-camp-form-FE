import { useEffect, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { parse, isValid } from 'date-fns';

import { getSetting, updateSetting } from '@/services/settings';
import { getBaseDate, createBaseDate, updateBaseDate } from '@/services/baseDate';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

registerLocale('ptBR', ptBR);

const CONTACT_KEY = 'contact_phone';
const SPREADSHEET_KEY = 'old_spreadsheet_url';
const BOLETO_MAX_KEY = 'boleto_max_installments';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  scrollUp();

  const load = async () => {
    setLoading(true);

    try {
      const [contactValue, spreadsheetValue, boletoMaxValue, baseDateData] = await Promise.all([
        getSetting(CONTACT_KEY),
        getSetting(SPREADSHEET_KEY),
        getSetting(BOLETO_MAX_KEY),
        getBaseDate(),
      ]);
      setContact(contactValue);
      setSpreadsheet(spreadsheetValue);
      setBoletoMax(boletoMaxValue || '');
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
      const [contactValue, spreadsheetValue, boletoMaxValue] = await Promise.all([
        updateSetting(CONTACT_KEY, contact.trim()),
        updateSetting(SPREADSHEET_KEY, spreadsheet.trim()),
        updateSetting(BOLETO_MAX_KEY, boletoMax.trim()),
      ]);
      setContact(contactValue || '');
      setSpreadsheet(spreadsheetValue || '');
      setBoletoMax(boletoMaxValue || '');

      if (baseDate) {
        if (baseDateExists) {
          await updateBaseDate(baseDate);
        } else {
          await createBaseDate(baseDate);
          setBaseDateExists(true);
        }
      }

      toast.success('Informações utilitárias atualizadas.');
    } catch {
      toast.error('Erro ao salvar as informações utilitárias.');
    } finally {
      setSaving(false);
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

                  <Form.Group className="mb-0">
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

                  <Form.Group className="mb-0">
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
