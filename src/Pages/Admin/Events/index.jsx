import { useEffect, useState } from 'react';
import { Badge, Button, Col, Form, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import EventIcons, { EVENT_ICONS } from '@/components/Global/EventIcons';

import { listAllEvents, createEvent, updateEvent, deleteEvent } from '@/services/events';
import { setSelectedEvent } from '@/config/eventScope';
import { getApiErrorMessage } from '@/fetchers/helpers';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import './style.scss';

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
  agePricingEnabled: false,
  registrationFeeEnabled: false,
  iconKey: '',
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const AdminEvents = ({ loggedUsername }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(EMPTY_EVENT);

  const loadEvents = async () => {
    setLoading(true);
    try {
      setEvents(await listAllEvents());
    } catch {
      toast.error('Erro ao carregar eventos.');
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
      agePricingEnabled: event.agePricingEnabled ?? false,
      registrationFeeEnabled: event.registrationFeeEnabled ?? false,
      iconKey: event.iconKey || '',
    });
    setShowFormModal(true);
  };

  const handleChange = (field) => (value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const openFormBuilder = (event) => {
    setSelectedEvent(event.slug);
    navigate('/admin/formulario');
  };

  const openSubmissions = (event) => {
    setSelectedEvent(event.slug);
    navigate('/admin/inscricoes');
  };

  const openInfoHome = (event) => {
    setSelectedEvent(event.slug);
    navigate('/admin/info');
  };

  const openPackage = (event) => {
    setSelectedEvent(event.slug);
    navigate('/admin/pacote');
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.slug.trim()) {
      toast.error('Nome e identificador (slug) são obrigatórios.');
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
      agePricingEnabled: draft.paymentEnabled ? draft.agePricingEnabled : false,
      registrationFeeEnabled: draft.paymentEnabled ? draft.registrationFeeEnabled : false,
      iconKey: draft.iconKey || null,
    };

    try {
      if (draft.id) {
        await updateEvent(draft.id, payload);
        toast.success('Evento atualizado com sucesso.');
      } else {
        await createEvent(payload);
        toast.success('Evento criado com sucesso.');
      }
      setShowFormModal(false);
      await loadEvents();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar o evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteEvent(selected.id);
      toast.success('Evento excluído com sucesso.');
      setShowDeleteModal(false);
      setSelected(null);
      await loadEvents();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao excluir o evento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage admin-events">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Gestão de Eventos"
        subtitle="Crie e configure os eventos disponíveis para inscrição."
        typeIcon="calendar"
      />

      <div className="admin-events__content">
        <div className="admin-events__toolbar">
          <Button variant="teal-blue" onClick={openCreate}>
            + Novo evento
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : events.length === 0 ? (
          <p className="admin-events__empty">Nenhum evento cadastrado.</p>
        ) : (
          <Table hover responsive className="admin-events__table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Cor</th>
                <th>Ano</th>
                <th>Status</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>
                    <code>{event.slug}</code>
                  </td>
                  <td>
                    <span className="admin-events__swatch" style={{ backgroundColor: event.color || '#007185' }} />
                    {event.color || '—'}
                  </td>
                  <td>{event.year || '—'}</td>
                  <td>
                    {!event.active ? (
                      <Badge bg="secondary">Inativo</Badge>
                    ) : event.registrationsOpen === false ? (
                      <Badge bg="warning" text="dark">
                        Aguardando evento
                      </Badge>
                    ) : (
                      <Badge bg="success">Inscrições abertas</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="teal-blue" className="me-2" onClick={() => openFormBuilder(event)}>
                      Campos
                    </Button>
                    <Button size="sm" variant="outline-teal-blue" className="me-2" onClick={() => openSubmissions(event)}>
                      Inscrições
                    </Button>
                    <Button size="sm" variant="outline-teal-blue" className="me-2" onClick={() => openInfoHome(event)}>
                      Info Home
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      className="me-2"
                      disabled={!event.paymentEnabled}
                      title={event.paymentEnabled ? '' : 'Habilite o pagamento para configurar o pacote'}
                      onClick={() => openPackage(event)}
                    >
                      Pacote
                    </Button>
                    <Button size="sm" variant="outline-teal-blue" className="me-2" onClick={() => openEdit(event)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        setSelected(event);
                        setShowDeleteModal(true);
                      }}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <CustomModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        variant="info"
        size="lg"
        title={draft.id ? 'Editar evento' : 'Novo evento'}
        icon="calendar"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowFormModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="admin-events__form">
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Nome</Form.Label>
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
                  placeholder="Ex.: Acampamento IPBV"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Identificador (slug)</Form.Label>
                <Form.Control
                  value={draft.slug}
                  onChange={(e) => handleChange('slug')(slugify(e.target.value))}
                  placeholder="acampamento-ipbv"
                />
                <Form.Text className="text-muted">Usado na URL: /e/{draft.slug || 'slug'}</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Cor principal</Form.Label>
                <div className="admin-events__color-row">
                  <Form.Control
                    type="color"
                    value={draft.color || '#007185'}
                    onChange={(e) => handleChange('color')(e.target.value)}
                    title="Cor do evento"
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
                <Form.Label>Cor secundária (botões)</Form.Label>
                <div className="admin-events__color-row">
                  <Form.Control
                    type="color"
                    value={draft.secondaryColor || '#ffc107'}
                    onChange={(e) => handleChange('secondaryColor')(e.target.value)}
                    title="Cor secundária do evento"
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
                <Form.Label>Contato (WhatsApp)</Form.Label>
                <Form.Control
                  value={draft.contact}
                  onChange={(e) => handleChange('contact')(e.target.value)}
                  placeholder="(81) 99999-7767"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Ano</Form.Label>
                <Form.Control
                  type="number"
                  value={draft.year}
                  onChange={(e) => handleChange('year')(e.target.value)}
                  placeholder="2027"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Ícone do card</Form.Label>
                <div className="event-icon-field">
                  <Form.Select value={draft.iconKey} onChange={(e) => handleChange('iconKey')(e.target.value)}>
                    <option value="">Sem ícone</option>
                    {EVENT_ICONS.map((icon) => (
                      <option key={icon.key} value={icon.key}>
                        {icon.label}
                      </option>
                    ))}
                  </Form.Select>
                  <div
                    className="event-icon-field__preview"
                    style={{ color: draft.color || '#007185' }}
                    aria-label="Pré-visualização do ícone"
                  >
                    {draft.iconKey ? (
                      <EventIcons typeIcon={draft.iconKey} iconSize={40} />
                    ) : (
                      <span className="event-icon-field__placeholder">sem ícone</span>
                    )}
                  </div>
                </div>
                <Form.Text className="text-muted">
                  Escolha um ícone para aparecer no card do evento na página inicial. Ele assume a cor principal.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Estágio do evento</Form.Label>
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
                  <option value="open">Inscrições abertas</option>
                  <option value="waiting">Aguardando evento (só login/pós-venda)</option>
                  <option value="inactive">Inativo (oculto no catálogo)</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  &quot;Aguardando evento&quot;: o card ainda aparece, mas o usuário só entra na conta — não se inscreve mais.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <Form.Check
            type="switch"
            id="event-payment-switch"
            className="mt-2"
            label="Habilitar pagamento (carrinho + PagarMe)"
            checked={draft.paymentEnabled}
            onChange={(e) => handleChange('paymentEnabled')(e.target.checked)}
          />
          <Form.Text className="text-muted">Se desativado, o formulário é enviado sem carrinho nem cobrança.</Form.Text>

          {draft.paymentEnabled && (
            <>
              <Form.Check
                type="switch"
                id="event-age-pricing-switch"
                className="mt-2"
                label="Preço por idade (faixas configuráveis no Pacote)"
                checked={draft.agePricingEnabled}
                onChange={(e) => handleChange('agePricingEnabled')(e.target.checked)}
              />
              <Form.Text className="text-muted">Adiciona um campo de nascimento e faixas de desconto por idade.</Form.Text>

              <Form.Check
                type="switch"
                id="event-registration-fee-switch"
                className="mt-2"
                label="Taxa de inscrição (somada a cada acampante)"
                checked={draft.registrationFeeEnabled}
                onChange={(e) => handleChange('registrationFeeEnabled')(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Usa a taxa de inscrição do lote ativo, somando-a ao pacote de cada acampante.
              </Form.Text>
            </>
          )}
        </Form>
      </CustomModal>

      <CustomModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        variant="cancel"
        title="Excluir evento"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir <b>{selected?.name}</b>? Eventos com inscrições vinculadas não podem ser
          excluídos — desative-o.
        </p>
      </CustomModal>
    </div>
  );
};

AdminEvents.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminEvents;
