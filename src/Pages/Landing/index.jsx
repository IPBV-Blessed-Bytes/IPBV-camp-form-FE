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

const VALUES = [
  {
    icon: 'couple',
    title: 'Servir a igreja pequena',
    text: 'A mesma ferramenta da igreja grande, acessível à congregação pequena — sem mensalidade que pese no orçamento.',
  },
  {
    icon: 'money',
    title: 'Mordomia e confiança',
    text: 'O dinheiro é da igreja e cai direto na conta dela. Nós não custodiamos nada; você mantém o controle.',
  },
  {
    icon: 'checked',
    title: 'Cuidado com os dados',
    text: 'Dados dos inscritos tratados com segurança e responsabilidade, seguindo a LGPD.',
  },
  {
    icon: 'clock',
    title: 'Simplicidade',
    text: 'Pronto em minutos, sem depender de TI. Você monta, publica e recebe — e volta a cuidar das pessoas.',
  },
];

const DIFFERENTIALS = [
  { icon: 'ride', title: 'Carona e transporte', text: 'Oferta e procura de vagas entre os inscritos e controle do ônibus da igreja.' },
  { icon: 'rooms', title: 'Quartos', text: 'Aloque os inscritos por quarto, com acompanhantes, direto no painel.' },
  { icon: 'team', title: 'Times e equipes', text: 'Organize os inscritos em times e equipes de serviço do evento.' },
  { icon: 'checkin', title: 'Check-in e pulseiras', text: 'Presença por QR ou CPF, individual ou por família, e controle de pulseiras.' },
  { icon: 'cart', title: 'Pacotes e lotes', text: 'Hospedagem, alimentação e transporte por categoria, com preço por idade e por lote.' },
  { icon: 'calendar', title: 'Multi-evento', text: 'Acampamento, congresso e retiro na mesma conta, cada um com sua página e inscrições.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    document.title = 'Sistema de Inscrição para Igrejas | Acampamentos, Retiros e Congressos';
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
  const essencialFeePercent = settings ? `${settings.essencialFeePercent}%` : '—';
  const essencialFreeEventFee = settings ? formatBRL(settings.essencialFreeEventFeeCents) : '—';
  const essencialFreeEventAnnual = settings ? formatBRL(settings.essencialFreeEventAnnualCents) : '—';

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

        <section className="storefront__differentials">
          <div className="storefront__section-head">
            <span className="storefront__eyebrow storefront__eyebrow--dark">O diferencial</span>
            <h2 className="storefront__section-title">Feito para a realidade da igreja</h2>
            <p className="storefront__plans-lede">
              Vender ingresso e coletar formulário já tem de sobra. O que não existe é um sistema que também organiza a{' '}
              <b>operação do evento da igreja</b> — carona, quartos, times, pulseiras e check-in — integrada ao
              pagamento, num fluxo só.
            </p>
          </div>
          <div className="storefront__diffgrid">
            {DIFFERENTIALS.map((item) => (
              <div className="storefront__diff" key={item.title}>
                <span className="storefront__diff-icon">
                  <Icons typeIcon={item.icon} iconSize={24} fill="#007185" />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="storefront__vs">
            <div className="storefront__vs-card">
              <span className="storefront__vs-tag">vs. Google Forms</span>
              <p>Aqui tem pagamento, pacotes, contas de usuário e a gestão do evento — não só coleta de respostas.</p>
            </div>
            <div className="storefront__vs-card">
              <span className="storefront__vs-tag">vs. Sympla / venda de ingresso</span>
              <p>O formulário é seu, editável campo a campo, com carona, quartos, times, pulseiras e check-in.</p>
            </div>
          </div>
        </section>

        <section className="storefront__purpose">
          <div className="storefront__section-head">
            <span className="storefront__eyebrow storefront__eyebrow--dark">Nosso propósito</span>
            <h2 className="storefront__section-title">Tecnologia a serviço da sua igreja</h2>
            <p className="storefront__plans-lede">
              Nascemos servindo o acampamento de uma igreja e crescemos com ela. Nossa missão é tirar o peso da
              organização das costas da liderança, para a igreja focar no que importa: <b>as pessoas e o Reino</b>.
            </p>
          </div>
          <div className="storefront__values">
            {VALUES.map((value) => (
              <div className="storefront__value" key={value.title}>
                <span className="storefront__value-icon">
                  <Icons typeIcon={value.icon} iconSize={24} fill="#007185" />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="storefront__plans" id="planos">
          <div className="storefront__section-head">
            <h2 className="storefront__section-title">Dois planos, sem mensalidade</h2>
            <p className="storefront__plans-lede">
              Escolha o tamanho da sua igreja. Conta grátis; você só paga quando cria um evento — e no pago, só sobre o
              que vende. O dinheiro cai direto na conta da igreja.
            </p>
          </div>
          <Row className="g-4 justify-content-center">
            <Col xs={12} md={6} lg={5}>
              <div className="storefront__plan">
                <span className="storefront__plan-name">Essencial</span>
                <span className="storefront__plan-tagline">Formulário + inscrições. Pra quem só precisa inscrever e receber.</span>
                <span className="storefront__plan-price">
                  {essencialFeePercent}
                  <small> por inscrição paga</small>
                </span>
                <span className="storefront__plan-blurb">
                  Evento gratuito: {essencialFreeEventFee}/evento ou {essencialFreeEventAnnual}/ano ilimitado.
                </span>
                <ul className="storefront__plan-list">
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Formulário 100% editável
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Pagamento (PIX, cartão e boleto)
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Inscritos, relatórios e Excel
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Página do evento e FAQ
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={12} md={6} lg={5}>
              <div className="storefront__plan storefront__plan--feature">
                <span className="storefront__plan-tag">Recomendado</span>
                <span className="storefront__plan-name">Completo</span>
                <span className="storefront__plan-tagline">Tudo do Essencial + a logística do evento. Pra quem organiza tudo.</span>
                <span className="storefront__plan-price">
                  {feePercent}
                  <small> por inscrição paga</small>
                </span>
                <span className="storefront__plan-blurb">
                  Evento gratuito: {freeEventFee}/evento ou {freeEventAnnual}/ano ilimitado.
                </span>
                <ul className="storefront__plan-list">
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Tudo do Essencial, e mais:
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Carona e ônibus da igreja
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Quartos e times/equipes
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> Check-in por QR e pulseiras
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
          <p className="storefront__plans-footnote">
            <Icons typeIcon="simple-info" iconSize={16} fill="#7f7878" /> Sem mensalidade — você paga conforme usa. O
            teste grátis de 14 dias vale só para <b>eventos gratuitos</b>; <b>eventos pagos já cobram a taxa</b> por
            inscrição desde a primeira venda.
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
