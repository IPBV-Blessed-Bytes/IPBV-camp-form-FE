import { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

import { platformSignup } from '@/services/platform';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const PLANS = [
  {
    value: 'free',
    name: 'Grátis',
    price: 'R$ 0',
    blurb: 'Para começar: um evento, inscrições ilimitadas e formulário personalizável.',
  },
  {
    value: 'basico',
    name: 'Básico',
    price: 'R$ 49/mês',
    blurb: 'Vários eventos, pagamentos online (Pix, cartão e boleto) e relatórios.',
  },
  {
    value: 'pro',
    name: 'Pro',
    price: 'R$ 99/mês',
    blurb: 'Tudo do Básico, mais white-label completo, equipe e suporte prioritário.',
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const Storefront = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState('free');
  const [churchName, setChurchName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
        plan,
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
          <h2 className="storefront__section-title">Escolha seu plano</h2>
          <Row className="g-3">
            {PLANS.map((item) => (
              <Col xs={12} md={4} key={item.value}>
                <button
                  type="button"
                  className={`storefront__plan ${plan === item.value ? 'is-selected' : ''}`}
                  onClick={() => setPlan(item.value)}
                  aria-pressed={plan === item.value}
                >
                  <span className="storefront__plan-name">{item.name}</span>
                  <span className="storefront__plan-price">{item.price}</span>
                  <span className="storefront__plan-blurb">{item.blurb}</span>
                  {plan === item.value && <span className="storefront__plan-check">Selecionado</span>}
                </button>
              </Col>
            ))}
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

              <Col xs={12} md={6} className="d-flex align-items-end">
                <div className="storefront__chosen-plan">
                  Plano selecionado: <strong>{PLANS.find((item) => item.value === plan)?.name}</strong>
                </div>
              </Col>
            </Row>

            <Button type="submit" variant="teal-blue" size="lg" className="storefront__submit fw-bold" disabled={loading}>
              Criar meu sistema
            </Button>
          </Form>
        </section>
      </Container>

      <Loading loading={loading} />
    </div>
  );
};

export default Storefront;
