import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, Badge, Button, Col, Form, Row, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import {
  getPlatformMe,
  getPlatformStats,
  listPlatformOrganizations,
  createPlatformOrganization,
  updatePlatformOrganization,
  listPlatformFaqs,
  createPlatformFaq,
  updatePlatformFaq,
  deletePlatformFaq,
} from '@/services/platform';
import { getApiErrorMessage } from '@/fetchers/helpers';
import StatCards from '@/components/Admin/StatCards';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const PLAN_OPTIONS = [
  { value: 'free', label: 'Grátis' },
  { value: 'basico', label: 'Básico' },
  { value: 'pro', label: 'Pro' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'canceled', label: 'Cancelado' },
];

const STATUS_BADGE = {
  active: { bg: 'success', label: 'Ativo' },
  trial: { bg: 'info', label: 'Trial' },
  suspended: { bg: 'warning', text: 'dark', label: 'Suspenso' },
  canceled: { bg: 'secondary', label: 'Cancelado' },
};

const BILLING_STATUS_OPTIONS = [
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Ativo (em dia)' },
  { value: 'past_due', label: 'Inadimplente' },
  { value: 'canceled', label: 'Cancelado' },
];

const BILLING_BADGE = {
  active: { bg: 'success', label: 'Em dia' },
  trial: { bg: 'info', label: 'Trial' },
  past_due: { bg: 'warning', text: 'dark', label: 'Inadimplente' },
  canceled: { bg: 'secondary', label: 'Cancelado' },
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const EMPTY_ORG = {
  id: null,
  name: '',
  slug: '',
  contactEmail: '',
  plan: 'free',
  status: 'active',
  pagarmeRecipientId: '',
  platformFeePercent: '',
  billingStatus: 'active',
  dueDate: '',
  trialEndsAt: '',
};

const EMPTY_FAQ = {
  id: null,
  question: '',
  answer: '',
  order: 0,
};

const Platform = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(EMPTY_ORG);
  const [faqs, setFaqs] = useState([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqDraft, setFaqDraft] = useState(EMPTY_FAQ);
  const [savingFaq, setSavingFaq] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, orgs, faqList] = await Promise.all([
        getPlatformStats(),
        listPlatformOrganizations(),
        listPlatformFaqs(),
      ]);
      setStats(statsData);
      setOrganizations(orgs);
      setFaqs(faqList);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao carregar dados da plataforma.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateFaq = () => {
    setFaqDraft({ ...EMPTY_FAQ, order: faqs.length });
    setShowFaqModal(true);
  };

  const openEditFaq = (faq) => {
    setFaqDraft({
      id: faq.id,
      question: faq.question || '',
      answer: faq.answer || '',
      order: faq.order ?? 0,
    });
    setShowFaqModal(true);
  };

  const handleFaqChange = (field) => (value) => setFaqDraft((prev) => ({ ...prev, [field]: value }));

  const handleSaveFaq = async () => {
    if (!faqDraft.question.trim()) {
      toast.error('A pergunta é obrigatória.');
      return;
    }
    setSavingFaq(true);
    try {
      const payload = {
        question: faqDraft.question.trim(),
        answer: faqDraft.answer,
        order: Number(faqDraft.order) || 0,
      };
      if (faqDraft.id) {
        await updatePlatformFaq(faqDraft.id, payload);
        toast.success('Pergunta atualizada com sucesso.');
      } else {
        await createPlatformFaq(payload);
        toast.success('Pergunta criada com sucesso.');
      }
      setShowFaqModal(false);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar a pergunta.');
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await deletePlatformFaq(id);
      toast.success('Pergunta excluída com sucesso.');
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao excluir a pergunta.');
    }
  };

  useEffect(() => {
    getPlatformMe()
      .then((data) => {
        setOwner(Boolean(data?.owner));
        if (data?.owner) loadData();
      })
      .catch(() => setOwner(false))
      .finally(() => setChecking(false));
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_ORG);
    setShowModal(true);
  };

  const openEdit = (org) => {
    setDraft({
      id: org.id,
      name: org.name || '',
      slug: org.slug || '',
      contactEmail: org.contactEmail || '',
      plan: org.plan || 'free',
      status: org.status || 'active',
      pagarmeRecipientId: org.pagarmeRecipientId || '',
      platformFeePercent: org.platformFeePercent ?? '',
      billingStatus: org.billingStatus || 'active',
      dueDate: org.dueDate || '',
      trialEndsAt: org.trialEndsAt || '',
    });
    setShowModal(true);
  };

  const handleChange = (field) => (value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error('O nome da organização é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      if (draft.id) {
        await updatePlatformOrganization(draft.id, {
          name: draft.name.trim(),
          contactEmail: draft.contactEmail.trim() || null,
          plan: draft.plan || null,
          status: draft.status || null,
          pagarmeRecipientId: draft.pagarmeRecipientId.trim() || null,
          platformFeePercent:
            draft.platformFeePercent === '' || draft.platformFeePercent === null
              ? null
              : Number(draft.platformFeePercent),
          billingStatus: draft.billingStatus || null,
          dueDate: draft.dueDate || null,
          trialEndsAt: draft.trialEndsAt || null,
        });
        toast.success('Organização atualizada com sucesso.');
      } else {
        await createPlatformOrganization({
          name: draft.name.trim(),
          slug: draft.slug.trim() || undefined,
          contactEmail: draft.contactEmail.trim() || undefined,
          plan: draft.plan || undefined,
          status: draft.status || undefined,
        });
        toast.success('Organização criada com sucesso.');
      }
      setShowModal(false);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao salvar a organização.');
    } finally {
      setSaving(false);
    }
  };

  if (checking) return <Loading loading />;

  if (!owner) {
    return (
      <div className="platform">
        <div className="platform__denied">
          <Icons typeIcon="info" iconSize={28} fill="#2E5AAC" />
          <p>Você não tem acesso a esta área.</p>
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Organizações', value: stats?.organizations ?? 0 },
    { label: 'Eventos', value: stats?.events ?? 0, tone: 'info' },
    { label: 'Inscrições', value: stats?.registrations ?? 0, tone: 'free' },
    { label: 'Usuários', value: stats?.users ?? 0, tone: 'accent' },
  ];

  return (
    <div className="platform">
      <header className="platform__header">
        <div>
          <h1 className="platform__title">Painel da Plataforma</h1>
          <p className="platform__subtitle">Gestão de clientes (tenants)</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-teal-blue" onClick={() => navigate('/admin/manual')}>
            Manual
          </Button>
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
            Nova organização&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
        </div>
      </header>

      <div className="platform__content">
        {stats && <StatCards items={statItems} />}

        {loading ? (
          <Loading loading />
        ) : organizations.length === 0 ? (
          <p className="platform__empty">Nenhuma organização cadastrada.</p>
        ) : (
          <div className="platform__table-wrap">
            <Table hover responsive className="platform__table align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Identificador</th>
                  <th>Contato</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Cobrança</th>
                  <th className="text-center">Nº de eventos</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => {
                  const badge = STATUS_BADGE[org.status] || { bg: 'secondary', label: org.status || '—' };
                  return (
                    <tr key={org.id}>
                      <td className="fw-semibold">{org.name}</td>
                      <td>
                        <code>{org.slug}</code>
                      </td>
                      <td>{org.contactEmail || '—'}</td>
                      <td className="text-capitalize">{org.plan || '—'}</td>
                      <td>
                        <Badge bg={badge.bg} text={badge.text}>
                          {badge.label}
                        </Badge>
                      </td>
                      <td>
                        {(() => {
                          const billing = BILLING_BADGE[org.billingStatus] || {
                            bg: 'light',
                            text: 'dark',
                            label: org.billingStatus || '—',
                          };
                          return (
                            <Badge bg={billing.bg} text={billing.text}>
                              {billing.label}
                            </Badge>
                          );
                        })()}
                      </td>
                      <td className="text-center">{org.eventCount ?? 0}</td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-teal-blue" onClick={() => openEdit(org)}>
                          Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        <section className="platform__faqs">
          <div className="platform__faqs-header">
            <div>
              <h2 className="platform__faqs-title">Perguntas frequentes da loja</h2>
              <p className="platform__faqs-subtitle">Exibidas na página pública de vendas.</p>
            </div>
            <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreateFaq}>
              Nova pergunta&nbsp;&nbsp;
              <Icons typeIcon="plus" iconSize={16} fill="#fff" />
            </Button>
          </div>

          {faqs.length === 0 ? (
            <p className="platform__empty">Nenhuma pergunta cadastrada.</p>
          ) : (
            <Accordion className="platform__faqs-list" alwaysOpen>
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={String(index)} key={faq.id}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>
                    <div className="platform__faq-answer" dangerouslySetInnerHTML={{ __html: faq.answer || '' }} />
                    <div className="platform__faq-actions">
                      <Button size="sm" variant="outline-teal-blue" onClick={() => openEditFaq(faq)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteFaq(faq.id)}>
                        Excluir
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </section>
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="info"
        title={draft.id ? 'Editar organização' : 'Nova organização'}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="platform__form">
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
                  placeholder="Ex.: Igreja Batista Central"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Identificador (slug):</b>
                </Form.Label>
                {draft.id ? (
                  <Form.Control value={draft.slug} readOnly plaintext className="platform__form-readonly" />
                ) : (
                  <Form.Control
                    value={draft.slug}
                    onChange={(e) => handleChange('slug')(slugify(e.target.value))}
                    placeholder="igreja-batista-central"
                  />
                )}
                <Form.Text className="text-muted">Usado na URL: /e/{draft.slug || 'slug'}</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>E-mail de contato:</b>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={draft.contactEmail}
                  onChange={(e) => handleChange('contactEmail')(e.target.value)}
                  placeholder="contato@igreja.com"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Plano:</b>
                </Form.Label>
                <Form.Select value={draft.plan} onChange={(e) => handleChange('plan')(e.target.value)}>
                  {PLAN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <b>Status:</b>
                </Form.Label>
                <Form.Select value={draft.status} onChange={(e) => handleChange('status')(e.target.value)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {draft.id && (
              <>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <b>Recebedor PagarMe (recipient_id):</b>
                    </Form.Label>
                    <Form.Control
                      value={draft.pagarmeRecipientId}
                      onChange={(e) => handleChange('pagarmeRecipientId')(e.target.value)}
                      placeholder="rp_xxxxxxxxxxxxxxxx"
                    />
                    <Form.Text className="text-muted">Conta da igreja no split. Preenchido no onboarding.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <b>Taxa da plataforma (%):</b>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      max={100}
                      value={draft.platformFeePercent}
                      onChange={(e) => handleChange('platformFeePercent')(e.target.value)}
                      placeholder="padrão da plataforma"
                    />
                    <Form.Text className="text-muted">% retido por inscrição paga. Vazio = usa o padrão.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>
                      <b>Cobrança:</b>
                    </Form.Label>
                    <Form.Select value={draft.billingStatus} onChange={(e) => handleChange('billingStatus')(e.target.value)}>
                      {BILLING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>
                      <b>Vencimento:</b>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={draft.dueDate}
                      onChange={(e) => handleChange('dueDate')(e.target.value)}
                    />
                    <Form.Text className="text-muted">Bloqueia form em +2d, admin em +7d.</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>
                      <b>Fim do trial:</b>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={draft.trialEndsAt}
                      onChange={(e) => handleChange('trialEndsAt')(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </CustomModal>

      <CustomModal
        show={showFaqModal}
        onHide={() => setShowFaqModal(false)}
        variant="info"
        title={faqDraft.id ? 'Editar pergunta' : 'Nova pergunta'}
        icon={faqDraft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowFaqModal(false)} disabled={savingFaq}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSaveFaq} disabled={savingFaq}>
              {savingFaq ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form className="platform__form">
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <b>Pergunta:</b>
                </Form.Label>
                <Form.Control
                  value={faqDraft.question}
                  onChange={(e) => handleFaqChange('question')(e.target.value)}
                  placeholder="Ex.: Como funciona a cobrança?"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <b>Resposta:</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={faqDraft.answer}
                  onChange={(e) => handleFaqChange('answer')(e.target.value)}
                  placeholder="Resposta (aceita HTML simples)."
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>
                  <b>Ordem:</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={faqDraft.order}
                  onChange={(e) => handleFaqChange('order')(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </div>
  );
};

export default Platform;
