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

  if (result) {
    return (
      <div className="storefront">
        <Container className="storefront__success-wrap">
          <div className="storefront__success">
            <Icons typeIcon="checked" iconSize={48} fill="#057c05" />
            <h2>Pronto! O sistema da {result.churchName} foi criado.</h2>
            <p>
              Entre com o e-mail <strong>{adminEmail.trim()}</strong> e a senha que você acabou de definir para
              administrar o seu sistema.
            </p>
            <div className="storefront__success-links">
              <Button variant="teal-blue" onClick={() => navigate('/admin')}>
                Acessar o painel administrativo
              </Button>
              {result.eventPath && (
                <a className="btn btn-outline-teal-blue" href={result.eventPath}>
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
      <section className="storefront__hero">
        <Container>
          <h1 className="storefront__hero-title">
            Crie o sistema de inscrições da sua igreja em minutos
          </h1>
          <p className="storefront__hero-subtitle">
            Formulário personalizado, pagamentos online e gestão completa de acampamentos, retiros e eventos — tudo em
            um só lugar.
          </p>
        </Container>
      </section>

      <Container className="storefront__body">
        <section className="storefront__plans">
          <h2 className="storefront__section-title">Preços simples, sem mensalidade</h2>
          <p className="storefront__plans-lede">
            Criar a conta é grátis. Você só paga quando cria um evento — e no evento pago, só sobre o que vende.
          </p>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <div className="storefront__plan storefront__plan--feature">
                <span className="storefront__plan-name">Evento pago</span>
                <span className="storefront__plan-price">
                  {settings ? `${settings.defaultFeePercent}%` : '—'}
                  <small> por inscrição</small>
                </span>
                <span className="storefront__plan-blurb">
                  Taxa de serviço somada ao inscrito. O dinheiro cai na conta da sua igreja (PIX, cartão e boleto).
                </span>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="storefront__plan">
                <span className="storefront__plan-name">Evento gratuito</span>
                <span className="storefront__plan-price">
                  {settings ? formatBRL(settings.freeEventFeeCents) : '—'}
                  <small> por evento</small>
                </span>
                <span className="storefront__plan-blurb">
                  Ou {settings ? formatBRL(settings.freeEventAnnualCents) : '—'}/ano para eventos ilimitados. 14 dias
                  de teste grátis.
                </span>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="storefront__plan">
                <span className="storefront__plan-name">Sem mensalidade</span>
                <span className="storefront__plan-price">R$ 0<small> fixo</small></span>
                <span className="storefront__plan-blurb">
                  Nada de assinatura obrigatória que pese na igreja pequena. Você paga conforme usa.
                </span>
              </div>
            </Col>
          </Row>
        </section>

        <section className="storefront__signup">
          <h2 className="storefront__section-title">Crie seu sistema</h2>
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

            <Button type="submit" variant="teal-blue" size="lg" className="storefront__submit fw-bold" disabled={loading}>
              Criar meu sistema
            </Button>
          </Form>
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

      <Loading loading={loading} />
    </div>
  );
};

export default Storefront;
