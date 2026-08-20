import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import '../Style/ExternalLinkRow.scss';
import { getSetting, updateSetting } from '@/services/settings';

const PAGARME = 'https://id.pagar.me/signin';
const SPREADSHEET_KEY = 'old_spreadsheet_url';

const toAbsoluteUrl = (url) => {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  return /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const ExternalLinkRow = ({ canEdit }) => {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSetting(SPREADSHEET_KEY)
      .then(setSpreadsheetUrl)
      .catch(() => {});
  }, []);

  const startEdit = () => {
    setDraft(spreadsheetUrl);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const value = await updateSetting(SPREADSHEET_KEY, draft.trim());
      setSpreadsheetUrl(value || '');
      setEditing(false);
      toast.success('Link da planilha atualizado.');
    } catch {
      toast.error('Erro ao salvar o link.');
    } finally {
      setSaving(false);
    }
  };

  const spreadsheetHref = toAbsoluteUrl(spreadsheetUrl);

  return (
    <Row className="mt-4 p-0">
      <Col xs={12} className="text-center ps-5-custom">
        <Card>
          <Card.Body>
            <Card.Title className="fw-bold text-teal-blue">Utilitários</Card.Title>
            <Card.Text>Clique no botão abaixo para acessar a planilha das inscrições do ano anterior e Pagar.me</Card.Text>
            <div className="btn-wrapper">
              <Button className='pagarme-btn' variant="outline-teal-blue" href={PAGARME} target="_blank" rel="noopener noreferrer">
                <strong>PAGAR.ME</strong>
              </Button>
              {spreadsheetHref && (
                <Button variant="teal-blue" href={spreadsheetHref} target="_blank" rel="noopener noreferrer">
                  <strong>PLANILHA ANTIGA</strong>
                </Button>
              )}
            </div>

            {canEdit && !editing && (
              <div className="mt-3">
                <Button size="sm" variant="link" onClick={startEdit}>
                  Editar link da planilha
                </Button>
              </div>
            )}

            {canEdit && editing && (
              <div className="mt-3 external-link-edit">
                <Form.Control
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
                <div className="mt-2 d-flex gap-2 justify-content-center">
                  <Button size="sm" variant="outline-secondary" onClick={() => setEditing(false)} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button size="sm" variant="teal-blue" onClick={save} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

ExternalLinkRow.propTypes = {
  canEdit: PropTypes.bool,
};

export default ExternalLinkRow;
