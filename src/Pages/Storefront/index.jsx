import { useEffect, useState } from 'react';
import { Accordion, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

import { platformSignup, listPlatformFaqs, getPlatformSettings } from '@/services/platform';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const formatBRL = (cents) =>
  ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const FEATURES = [
  {
    icon: 'form-context',
    title: 'Formulário do seu jeito',
    text: 'Monte campos, seções e pacotes sem programar. Cada evento com a cara da sua igreja.',
  },
  {
    icon: 'credit-card',
    title: 'Pagamento online',
    text: 'PIX, cartão e boleto. O valor cai direto na conta da igreja, com repasse automático.',
  },
  {
    icon: 'chart',
    title: 'Gestão completa',
    text: 'Inscritos, vagas, quartos, ônibus e relatórios reunidos em um painel só.',
  },
  {
    icon: 'checkin',
    title: 'Check-in por QR',
    text: 'Confirme a presença na entrada do evento pelo celular, sem papel e sem fila.',
  },
];

const HERO_CHIPS = ['PIX, cartão e boleto', 'Sem mensalidade', 'Pronto em minutos'];

const Storefront = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [churchName, setChurchName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    listPlatformFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]));
    getPlatformSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!churchName.trim()) {
      toast.error('Informe o nome da igreja ou organização.');
      return;
    }
    if (!adminName.trim()) {
      toast.error('Informe seu nome.');
      return;
    }
    if (!adminEmail.trim()) {
      toast.error('Informe seu e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
      toast.error('Informe um e-mail válido.');
      return;
    }
    if (!slug.trim()) {
      toast.error('Informe um identificador (slug) para o seu sistema.');
      return;
    }
    if (adminPassword.length < 6) {
      toast.error('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const data = await platformSignup({
        churchName: churchName.trim(),
        slug: slug.trim() || undefined,
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
        plan: 'free',
      });
      setResult({ ...data, churchName: churchName.trim() });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível criar o sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const feePercent = settings ? `${settings.defaultFeePercent}%` : '—';
  const freeEventFee = settings ? formatBRL(settings.freeEventFeeCents) : '—';
  const freeEventAnnual = settings ? formatBRL(settings.freeEventAnnualCents) : '—';

  if (result) {
    return (
      <div className="storefront">
        <header className="storefront__nav">
          <Container className="storefront__nav-inner">
            <span className="storefront__brand">
              <span className="storefront__brand-mark">
                <Icons typeIcon="tent" iconSize={20} fill="#ffffff" />
              </span>
              Plataforma de Inscrições
            </span>
          </Container>
        </header>
        <Container className="storefront__success-wrap">
          <div className="storefront__success">
            <span className="storefront__success-badge">
              <Icons typeIcon="checked" iconSize={40} fill="#057c05" />
            </span>
            <h2>Pronto! O sistema da {result.churchName} foi criado.</h2>
            <p>
              Entre com o e-mail <strong>{adminEmail.trim()}</strong> e a senha que você acabou de definir para
              administrar o seu sistema.
            </p>
            <div className="storefront__success-links">
              <Button variant="teal-blue" size="lg" className="fw-bold" onClick={() => navigate('/admin')}>
                Acessar o painel administrativo
              </Button>
              {result.eventPath && (
                <a className="btn btn-outline-teal-blue btn-lg" href={result.eventPath}>
                  Ver a página pública ({result.eventPath})
                </a>
              )}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="storefront">
      <header className="storefront__nav">
        <Container className="storefront__nav-inner">
          <span className="storefront__brand">
            <span className="storefront__brand-mark">
              <Icons typeIcon="tent" iconSize={20} fill="#ffffff" />
            </span>
            Plataforma de Inscrições
          </span>
          <nav className="storefront__nav-links">
            <a href="#planos">Preços</a>
            <button type="button" className="storefront__nav-login" onClick={() => navigate('/admin')}>
              Entrar
            </button>
          </nav>
        </Container>
      </header>

      <section className="storefront__hero">
        <Container className="storefront__hero-inner">
          <span className="storefront__eyebrow">Feito para igrejas e ministérios</span>
          <h1 className="storefront__hero-title">Crie o sistema de inscrições da sua igreja em minutos</h1>
          <p className="storefront__hero-subtitle">
            Formulário personalizado, pagamentos online e gestão completa de acampamentos, retiros e eventos — tudo em
            um só lugar.
          </p>
          <div className="storefront__hero-actions">
            <a href="#criar" className="storefront__hero-cta">
              Começar agora
              <Icons typeIcon="arrow-right" iconSize={18} fill="#ffffff" />
            </a>
            <a href="#planos" className="storefront__hero-link">
              Ver preços
            </a>
          </div>
          <ul className="storefront__hero-chips">
            {HERO_CHIPS.map((chip) => (
              <li key={chip}>
                <Icons typeIcon="checked" iconSize={16} fill="#ffffff" />
                {chip}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="storefront__body">
        <section className="storefront__features">
          {FEATURES.map((feature) => (
            <div className="storefront__feature" key={feature.title}>
              <span className="storefront__feature-icon">
                <Icons typeIcon={feature.icon} iconSize={26} fill="#007185" />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </section>

        <section className="storefront__plans" id="planos">
          <div className="storefront__section-head">
            <h2 className="storefront__section-title">Preços simples, sem mensalidade</h2>
            <p className="storefront__plans-lede">
              Criar a conta é grátis. Você só paga quando cria um evento — e no evento pago, só sobre o que vende.
            </p>
          </div>
          <Row className="g-4">
            <Col xs={12} md={4}>
              <div className="storefront__plan storefront__plan--feature">
                <span className="storefront__plan-tag">Recomendado</span>
                <span className="storefront__plan-name">Evento pago</span>
                <span className="storefront__plan-price">
                  {feePercent}
                  <small> por inscrição</small>
                </span>
                <span className="storefront__plan-blurb">
                  Taxa de serviço somada ao inscrito. O dinheiro cai na conta da sua igreja.
                </span>
                <ul className="storefront__plan-list">
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> PIX, cartão e boleto
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Repasse automático pra igreja
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Sem custo fixo mensal
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="storefront__plan">
                <span className="storefront__plan-name">Evento gratuito</span>
                <span className="storefront__plan-price">
                  {freeEventFee}
                  <small> por evento</small>
                </span>
                <span className="storefront__plan-blurb">
                  Ou {freeEventAnnual}/ano para eventos ilimitados. 14 dias de teste grátis.
                </span>
                <ul className="storefront__plan-list">
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> 14 dias grátis pra experimentar
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Eventos ilimitados no plano anual
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Sem taxa por inscrição
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="storefront__plan">
                <span className="storefront__plan-name">Sem mensalidade</span>
                <span className="storefront__plan-price">
                  R$ 0<small> fixo</small>
                </span>
                <span className="storefront__plan-blurb">
                  Nada de assinatura obrigatória que pese na igreja pequena. Você paga conforme usa.
                </span>
                <ul className="storefront__plan-list">
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Conta grátis pra sempre
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Paga só quando usa
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Ideal pra igreja pequena
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </section>

        <section className="storefront__signup" id="criar">
          <div className="storefront__signup-card">
            <div className="storefront__signup-head">
              <h2 className="storefront__section-title">Crie seu sistema</h2>
              <p className="storefront__signup-lede">
                Leva menos de um minuto. Conta grátis, sem cartão de crédito.
              </p>
            </div>
            <Form onSubmit={handleSubmit} className="storefront__form">
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Nome da igreja / organização</Form.Label>
                    <Form.Control
                      value={churchName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setChurchName(value);
                        setSlug((prev) => (prev && prev !== slugify(churchName) ? prev : slugify(value)));
                      }}
                      placeholder="Ex.: Igreja Batista Central"
                      size="lg"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Identificador (slug)</Form.Label>
                    <Form.Control
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="igreja-batista-central"
                      size="lg"
                    />
                    <Form.Text className="text-muted">Sua página pública: /e/{slug || 'sua-igreja'}</Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Seu nome</Form.Label>
                    <Form.Control
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Nome do administrador"
                      size="lg"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">E-mail (será seu login)</Form.Label>
                    <Form.Control
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="voce@igreja.com"
                      size="lg"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Senha</Form.Label>
                    <div className="storefront__password">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        size="lg"
                        className="storefront__password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="storefront__password-toggle"
                      >
                        <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={22} />
                      </button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Button
                type="submit"
                variant="teal-blue"
                size="lg"
                className="storefront__submit fw-bold"
                disabled={loading}
              >
                Criar meu sistema
              </Button>
              <p className="storefront__form-reassurance">
                <Icons typeIcon="checked" iconSize={15} fill="#057c05" /> Você recebe o sistema pronto na hora, já com
                sua página pública.
              </p>
            </Form>
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="storefront__faqs">
            <h2 className="storefront__section-title">Perguntas frequentes</h2>
            <Accordion className="storefront__faqs-list">
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={String(index)} key={faq.id}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>
                    <div className="storefront__faq-answer" dangerouslySetInnerHTML={{ __html: faq.answer || '' }} />
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </section>
        )}
      </Container>

      <footer className="storefront__footer">
        <Container className="storefront__footer-inner">
          <span className="storefront__brand storefront__brand--footer">
            <span className="storefront__brand-mark">
              <Icons typeIcon="tent" iconSize={18} fill="#ffffff" />
            </span>
            Plataforma de Inscrições
          </span>
          <span className="storefront__footer-note">Inscrições, pagamentos e gestão para eventos da sua igreja.</span>
        </Container>
      </footer>

      <Loading loading={loading} />
    </div>
  );
};

export default Storefront;
