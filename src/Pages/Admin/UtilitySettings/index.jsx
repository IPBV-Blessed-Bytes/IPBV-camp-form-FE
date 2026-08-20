import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { getSetting, updateSetting } from '@/services/settings';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Loading from '@/components/Global/Loading';
import './style.scss';

const CONTACT_KEY = 'contact_phone';
const SPREADSHEET_KEY = 'old_spreadsheet_url';

const AdminUtilitySettings = ({ loggedUsername }) => {
  const [contact, setContact] = useState('');
  const [spreadsheet, setSpreadsheet] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  scrollUp();

  const load = async () => {
    setLoading(true);
    try {
      const [contactValue, spreadsheetValue] = await Promise.all([
        getSetting(CONTACT_KEY),
        getSetting(SPREADSHEET_KEY),
      ]);
      setContact(contactValue);
      setSpreadsheet(spreadsheetValue);
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
    try {
      const [contactValue, spreadsheetValue] = await Promise.all([
        updateSetting(CONTACT_KEY, contact.trim()),
        updateSetting(SPREADSHEET_KEY, spreadsheet.trim()),
      ]);
      setContact(contactValue || '');
      setSpreadsheet(spreadsheetValue || '');
      toast.success('Informações utilitárias atualizadas.');
    } catch {
      toast.error('Erro ao salvar as informações utilitárias.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage utility-settings">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Informações Utilitárias"
        subtitle="Telefone de contato e link da planilha antiga."
        typeIcon="settings"
      />

      <div className="utility-settings__content">
        {loading ? (
          <Loading loading />
        ) : (
          <Form className="admin-panel">
            <Form.Group className="mb-3">
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

            <Form.Group className="mb-3">
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

            <Button variant="teal-blue" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
};

AdminUtilitySettings.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminUtilitySettings;
