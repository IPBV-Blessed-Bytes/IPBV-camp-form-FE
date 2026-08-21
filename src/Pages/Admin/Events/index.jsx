import { useEffect, useState } from 'react';
import { Badge, Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import EventIcons, { EVENT_ICONS } from '@/components/Global/EventIcons';

const ICON_KEYS = new Set(EVENT_ICONS.map((icon) => icon.key));

const STAGE_BADGE = (event) => {
  if (!event.active) return { bg: 'secondary', text: undefined, label: 'Inativo' };
  if (event.registrationsOpen === false) return { bg: 'warning', text: 'dark', label: 'Aguardando evento' };
  return { bg: 'success', text: undefined, label: 'Inscrições Abertas' };
};

import { listAllEvents, createEvent, updateEvent, deleteEvent } from '@/services/events';
import { setSelectedEvent } from '@/config/eventScope';
import { getApiErrorMessage } from '@/fetchers/helpers';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import './style.scss';
import Icons from '@/components/Global/Icons';

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
  contactMessage: '',
  shareMessage: '',
  oldSpreadsheetUrl: '',
  faviconUrl: '',
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
  const [search, setSearch] = useState('');

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
      contactMessage: event.contactMessage || '',
      shareMessage: event.shareMessage || '',
      oldSpreadsheetUrl: event.oldSpreadsheetUrl || '',
      faviconUrl: event.faviconUrl || '',
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

  const openFaq = (event) => {
    setSelectedEvent(event.slug);
    navigate('/admin/faq');
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
      contactMessage: draft.contactMessage.trim() || null,
      shareMessage: draft.shareMessage.trim() || null,
      oldSpreadsheetUrl: draft.oldSpreadsheetUrl.trim() || null,
      faviconUrl: draft.faviconUrl.trim() || null,
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

  const openCount = events.filter((event) => event.active && event.registrationsOpen !== false).length;
  const waitingCount = events.filter((event) => event.active && event.registrationsOpen === false).length;
  const inactiveCount = events.filter((event) => !event.active).length;
  const statItems = [
    { label: 'Eventos', value: events.length },
    { label: 'Inscrições abertas', value: openCount, tone: 'free' },
    { label: 'Aguardando', value: waitingCount, tone: 'info' },
    { label: 'Inativos', value: inactiveCount, tone: 'used' },
  ];

  const term = search.trim().toLowerCase();
  const filteredEvents = term
    ? events.filter((event) => `${event.name || ''} ${event.slug || ''}`.toLowerCase().includes(term))
    : events;

  return (
    <div className="admin-subpage admin-events">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Eventos"
        subtitle="Crie e configure os eventos disponíveis para inscrição."
        typeIcon="calendar"
      />

      <div className="admin-events__content">
        {!loading && events.length > 0 && <StatCards items={statItems} />}

        <div className="admin-events__toolbar">
          {events.length > 0 && (
            <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome ou slug..." />
          )}
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
            Novo Evento&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : events.length === 0 ? (
          <p className="admin-events__empty">Nenhum evento cadastrado.</p>
        ) : filteredEvents.length === 0 ? (
          <p className="admin-events__empty">Nenhum evento encontrado.</p>
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
                      {badge.label}
                    </Badge>
                    {event.paymentEnabled && (
                      <Badge bg="light" text="dark" className="event-admin-card__tag">
                        Pagamento
                      </Badge>
                    )}
                  </div>

                  <div className="event-admin-card__config">
                    <Button size="sm" variant="outline-teal-blue" onClick={() => openFormBuilder(event)}>
                      Campos
                    </Button>
                    <Button size="sm" variant="outline-teal-blue" onClick={() => openSubmissions(event)}>
                      Inscrições
                    </Button>
                    <Button size="sm" variant="outline-teal-blue" onClick={() => openInfoHome(event)}>
                      Info Home
                    </Button>
                    <Button size="sm" variant="outline-teal-blue" onClick={() => openFaq(event)}>
                      FAQ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-teal-blue"
                      disabled={!event.paymentEnabled}
                      title={event.paymentEnabled ? '' : 'Habilite o pagamento para configurar o pacote'}
                      onClick={() => openPackage(event)}
                    >
                      Pacote
                    </Button>
                  </div>

                  <div className="event-admin-card__footer">
                    <Button size="sm" variant="teal-blue" onClick={() => openEdit(event)}>
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
        title={draft.id ? 'Editar Evento' : 'Novo Evento'}
        icon={draft.id ? 'edit-modal' : 'plus'}
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
                  placeholder="Ex.: Acampamento IPBV"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Identificador (slug):</b>
                </Form.Label>
                <Form.Control
                  value={draft.slug}
                  onChange={(e) => handleChange('slug')(slugify(e.target.value))}
                  placeholder="acampamento-ipbv"
                />
                <Form.Text className="text-muted-italic">Usado na URL: /e/{draft.slug || 'slug'}</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Cor Principal:</b>
                </Form.Label>
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
                <Form.Label>
                  <b>Cor Secundária (botões):</b>
                </Form.Label>
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
                <Form.Label>
                  <b>Telefone de Contato (WhatsApp):</b>
                </Form.Label>
                <Form.Control
                  value={draft.contact}
                  onChange={(e) => handleChange('contact')(e.target.value)}
                  placeholder="(81) 99999-9999"
                />
                <Form.Text className="text-muted-italic">
                  Usado em todos os lugares que divulgam o contato do responsável pelo evento.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Ano:</b>
                </Form.Label>
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
                <Form.Label>
                  <b>Ícone do Card:</b>
                </Form.Label>
                <div className="event-icon-field">
                  <Form.Select value={draft.iconKey} onChange={(e) => handleChange('iconKey')(e.target.value)}>
                    <option value="" disabled selected>
                      Sem Ícone
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
                    aria-label="Pré-visualização do ícone"
                  >
                    {draft.iconKey ? (
                      <EventIcons typeIcon={draft.iconKey} iconSize={40} />
                    ) : (
                      <span className="event-icon-field__placeholder">sem ícone</span>
                    )}
                  </div>
                </div>
                <Form.Text className="text-muted-italic">
                  Escolha um ícone para aparecer no card do evento na página inicial. Ele assume a cor principal.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Estágio do Evento:</b>
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
                    Inscrições Abertas
                  </option>
                  <option value="waiting">Aguardando evento (só login/pós-venda)</option>
                  <option value="inactive">Inativo (oculto no catálogo)</option>
                </Form.Select>
                <Form.Text className="text-muted-italic">
                  &quot;Aguardando evento&quot;: o card ainda aparece, mas o usuário só entra na conta, não se inscreve
                  mais.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Mensagem &quot;Fale Conosco&quot; (WhatsApp):</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={draft.contactMessage}
                  onChange={(e) => handleChange('contactMessage')(e.target.value)}
                  placeholder="Mensagem pré-preenchida ao abrir a conversa (opcional)"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Mensagem &quot;Compartilhar&quot; (WhatsApp):</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={draft.shareMessage}
                  onChange={(e) => handleChange('shareMessage')(e.target.value)}
                  placeholder="Texto enviado ao compartilhar o evento (opcional)"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Link da Planilha Antiga:</b>
                </Form.Label>
                <Form.Control
                  value={draft.oldSpreadsheetUrl}
                  onChange={(e) => handleChange('oldSpreadsheetUrl')(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
                <Form.Text className="text-muted-italic">
                  Botão &quot;Planilha Antiga&quot; na home do admin. Deixe em branco para ocultar.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Favicon (URL):</b>
                </Form.Label>
                <Form.Control
                  value={draft.faviconUrl}
                  onChange={(e) => handleChange('faviconUrl')(e.target.value)}
                  placeholder="https://.../favicon.png"
                />
                <Form.Text className="text-muted-italic">
                  Ícone da aba do navegador nas páginas do evento. Deixe em branco para usar o padrão.
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
          <Form.Text className="text-muted-italic">
            Se desativado, o formulário é enviado sem carrinho nem cobrança.
          </Form.Text>

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
              <Form.Text className="text-muted-italic">
                Adiciona um campo de nascimento e faixas de desconto por idade.
              </Form.Text>

              <Form.Check
                type="switch"
                id="event-registration-fee-switch"
                className="mt-2"
                label="Taxa de inscrição (somada a cada acampante)"
                checked={draft.registrationFeeEnabled}
                onChange={(e) => handleChange('registrationFeeEnabled')(e.target.checked)}
              />
              <Form.Text className="text-muted-italic">
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
          excluídos, desative-o.
        </p>
      </CustomModal>
    </div>
  );
};

AdminEvents.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminEvents;
