import { useEffect, useState } from 'react';
import { Accordion, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { listPlatformFaqs, getPlatformSettings } from '@/services/platform';
import Icons from '@/components/Global/Icons';
import { StoreNav, StoreFooter } from '@/components/Storefront/StorefrontChrome';
import '../Storefront/style.scss';

const formatBRL = (cents) =>
  ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

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

const Landing = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    listPlatformFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]));
    getPlatformSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const goToSignup = () => navigate('/comprar');

  const feePercent = settings ? `${settings.defaultFeePercent}%` : '—';
  const freeEventFee = settings ? formatBRL(settings.freeEventFeeCents) : '—';
  const freeEventAnnual = settings ? formatBRL(settings.freeEventAnnualCents) : '—';

  return (
    <div className="storefront">
      <StoreNav onLanding />

      <section className="storefront__hero">
        <Container className="storefront__hero-inner">
          <span className="storefront__eyebrow">Feito para igrejas e ministérios</span>
          <h1 className="storefront__hero-title">Crie o sistema de inscrições da sua igreja em minutos</h1>
          <p className="storefront__hero-subtitle">
            Formulário personalizado, pagamentos online e gestão completa de acampamentos, retiros, congressos e eventos
            — tudo em um só lugar.
          </p>
          <div className="storefront__hero-actions">
            <button type="button" className="storefront__hero-cta" onClick={goToSignup}>
              Começar agora
              <Icons typeIcon="arrow-right" iconSize={18} fill="#ffffff" />
            </button>
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
              Criar a conta é grátis. Você só paga quando cria um evento — e no evento pago, só sobre o que vende. Você
              recebe o dinheiro arrecadado direto na sua conta bancária cadastrada.
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
                  Nada de assinatura obrigatória que pese no orçamento mensal. Você paga conforme usa, escolhendo se a
                  taxa é absorvida pela igreja ou pelo usuário do sistema.
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
          <p className="storefront__plans-footnote">
            <Icons typeIcon="simple-info" iconSize={20} fill="#7f7878" /> O teste grátis de 14 dias vale só para{' '}
            <b>eventos gratuitos</b>. <b>Eventos pagos já cobram os 5%</b> por inscrição desde a primeira venda, mesmo
            durante o teste.
          </p>
        </section>

        <section className="storefront__cta-band">
          <div className="storefront__cta-band-inner">
            <div>
              <h2>Pronto para começar?</h2>
              <p>Crie o sistema da sua igreja agora — leva menos de um minuto e a conta é grátis.</p>
            </div>
            <button type="button" className="storefront__hero-cta" onClick={goToSignup}>
              Criar meu sistema
              <Icons typeIcon="arrow-right" iconSize={18} fill="#ffffff" />
            </button>
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

      <StoreFooter />
    </div>
  );
};

export default Landing;
