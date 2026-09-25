import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

import { platformSignup, getPlatformSettings } from '@/services/platform';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import { StoreNav, StoreFooter } from '@/components/Storefront/StorefrontChrome';
import './style.scss';

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

  useEffect(() => {
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

  if (result) {
    return (
      <div className="storefront">
        <StoreNav />
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
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="storefront">
      <StoreNav />

      <Container className="storefront__form-page">
        <button type="button" className="storefront__back" onClick={() => navigate('/')}>
          <Icons typeIcon="arrow-left" iconSize={16} fill="#007185" />
          Voltar
        </button>

        <div className="storefront__signup-card">
          <div className="storefront__signup-head">
            <h1 className="storefront__section-title">Crie seu sistema</h1>
            <p className="storefront__signup-lede">
              Leva menos de um minuto. Conta grátis, sem cartão de crédito — você recebe o sistema pronto na hora.
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
              <Icons typeIcon="checked" iconSize={15} fill="#057c05" /> Sem taxa pra criar a conta. Você só paga quando
              cria um evento{settings ? ` — ${settings.defaultFeePercent}% por inscrição paga` : ''}.
            </p>
          </Form>
        </div>
      </Container>

      <StoreFooter />
      <Loading loading={loading} />
    </div>
  );
};

export default Storefront;
