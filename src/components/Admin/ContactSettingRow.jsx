import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getSetting, updateSetting } from '@/services/settings';

const CONTACT_KEY = 'contact_phone';

const ContactSettingRow = () => {
  const [contact, setContact] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSetting(CONTACT_KEY)
      .then(setContact)
      .catch(() => {});
  }, []);

  const startEdit = () => {
    setDraft(contact);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const value = await updateSetting(CONTACT_KEY, draft.trim());
      setContact(value || '');
      setEditing(false);
      toast.success('Telefone de contato atualizado.');
    } catch {
      toast.error('Erro ao salvar o telefone de contato.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Row className="mt-4 p-0">
      <Col xs={12} className="text-center ps-5-custom">
        <Card>
          <Card.Body>
            <Card.Title className="fw-bold text-teal-blue">Telefone de Contato</Card.Title>
            <Card.Text>
              Número usado em todos os lugares que divulgam o contato da organização (WhatsApp, FAQ, telas de espera).
            </Card.Text>

            {!editing ? (
              <>
                <p className="mb-2">
                  <strong>{contact || 'Nenhum número configurado'}</strong>
                </p>
                <Button size="sm" variant="teal-blue" onClick={startEdit}>
                  Editar telefone
                </Button>
              </>
            ) : (
              <div className="contact-setting-edit mx-auto" style={{ maxWidth: 320 }}>
                <Form.Control
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="(81) 99999-9999"
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

export default ContactSettingRow;
