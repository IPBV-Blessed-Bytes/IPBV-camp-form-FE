import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import { StoreNav, StoreFooter } from '@/components/Storefront/StorefrontChrome';
import { getPlatformMe } from '@/services/platform';
import './style.scss';
import '../Storefront/style.scss';

const AUDIENCES = [
  { key: 'cliente', label: 'Ajuda do cliente', ownerOnly: false },
  { key: 'dono', label: 'Runbook do dono', ownerOnly: true },
  { key: 'tecnico', label: 'Arquitetura', ownerOnly: true },
  { key: 'vendas', label: 'Vendas', ownerOnly: true },
];

const SECTIONS = {
  cliente: [
    { id: 'c-comecar', title: 'Primeiros passos' },
    { id: 'c-evento', title: 'Criar um evento' },
    { id: 'c-form', title: 'Montar o formulário' },
    { id: 'c-produtos', title: 'Produtos, pacotes e lotes' },
    { id: 'c-publicar', title: 'Publicar e página pública' },
    { id: 'c-inscricoes', title: 'Gerenciar inscrições' },
    { id: 'c-ferramentas', title: 'Ferramentas do evento' },
  ],
  dono: [
    { id: 'd-painel', title: 'Painel da Plataforma' },
    { id: 'd-provisionar', title: 'Provisionar uma igreja' },
    { id: 'd-cobranca', title: 'Como você recebe' },
    { id: 'd-inadimplencia', title: 'Inadimplência' },
    { id: 'd-config', title: 'Configuração' },
    { id: 'd-hosting', title: 'Custo de hospedagem' },
    { id: 'd-golive', title: 'Go-live' },
  ],
  tecnico: [
    { id: 't-stack', title: 'Stack' },
    { id: 't-tenancy', title: 'Multi-tenancy' },
    { id: 't-schema', title: 'Formulário schema-driven' },
    { id: 't-checkout', title: 'Checkout e split' },
    { id: 't-billing', title: 'Billing e enforcement' },
    { id: 't-platform', title: 'Camada de plataforma' },
  ],
  vendas: [
    { id: 'v-porque', title: 'Por que não é só um form' },
    { id: 'v-como', title: 'Como funciona' },
    { id: 'v-precos', title: 'Preços' },
    { id: 'v-recursos', title: 'Recursos' },
  ],
};

const Manual = ({ loggedUsername, publicMode = false }) => {
  const [owner, setOwner] = useState(false);
  const [active, setActive] = useState('cliente');
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    if (publicMode) {
      setOwner(false);
      document.title = 'Ajuda | Sistema de Inscrição para Igrejas';
      return;
    }
    getPlatformMe()
      .then((data) => setOwner(Boolean(data?.owner)))
      .catch(() => setOwner(false));
  }, [publicMode]);

  const tabs = useMemo(
    () => (publicMode ? AUDIENCES.filter((a) => a.key === 'cliente') : AUDIENCES.filter((a) => !a.ownerOnly || owner)),
    [owner, publicMode],
  );

  useEffect(() => {
    if (!tabs.some((t) => t.key === active)) {
      setActive('cliente');
    }
  }, [tabs, active]);

  const sections = SECTIONS[active] || [];

  useEffect(() => {
    const secs = SECTIONS[active] || [];
    setActiveSection(secs[0]?.id || '');
    const onScroll = () => {
      const top = window.scrollY + 160;
      let current = secs[0]?.id || '';
      secs.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= top) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [active]);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={publicMode ? 'manual manual--public' : 'admin-subpage manual'}>
      {publicMode ? (
        <StoreNav />
      ) : (
        <AdminSubpageHeader
          username={loggedUsername}
          title="Manual da Plataforma"
          subtitle="Documentação: uso pelo cliente, operação, arquitetura e vendas"
          typeIcon="info"
        />
      )}

      {tabs.length > 1 && (
        <div className="manual__head">
          <div className="manual__tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active === tab.key}
                className={`manual__tab ${active === tab.key ? 'is-active' : ''}`}
                onClick={() => {
                  setActive(tab.key);
                  window.scrollTo({ top: 0, behavior: 'auto' });
                }}
              >
                <span className="manual__tab-dot" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="manual__layout">
        <aside className="manual__subnav">
          <p className="manual__subnav-title">Nesta seção</p>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  className={activeSection === s.id ? 'is-active' : ''}
                  onClick={() => goTo(s.id)}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <main className="manual__content" ref={contentRef}>
          {active === 'cliente' && <ClienteDocs />}
          {active === 'dono' && <DonoDocs />}
          {active === 'tecnico' && <TecnicoDocs />}
          {active === 'vendas' && <VendasDocs />}

          {!publicMode && (
            <div className="manual__footer">
              Manual da Plataforma · documentação interna (cliente · dono · engenharia · vendas). Conteúdo em evolução
              conforme o produto; valores de preço e a integração de pagamento em sandbox estão em definição.
            </div>
          )}
        </main>
      </div>

      {publicMode && <StoreFooter />}
    </div>
  );
};

const ClienteDocs = () => (
  <>
    <div className="manual__hero">
      <span className="manual__eyebrow">Para a igreja</span>
      <h1>Monte o sistema de inscrições do seu evento</h1>
      <p className="manual__lede">
        Um formulário de inscrição <strong>100% editável</strong>, com pagamento online e a gestão completa do seu
        acampamento, congresso ou retiro — tudo num lugar só.
      </p>
    </div>

    <section className="manual__doc" id="c-comecar">
      <h2>Primeiros passos</h2>
      <p>
        Depois que sua conta é criada, você entra no <strong>painel administrativo</strong> com o e-mail e a senha que
        definiu. O painel é organizado em cartões por área: inscrições, financeiro, configurações do formulário e
        ferramentas do evento.
      </p>
      <div className="manual__callout">
        <div className="manual__callout-k">Conceito</div>
        <p>
          Cada igreja é uma <strong>organização</strong> e pode ter <strong>vários eventos</strong> (o acampamento
          anual, um congresso, um retiro). Cada evento tem seu próprio formulário, página pública e inscrições,
          isolados dos demais.
        </p>
      </div>
    </section>

    <section className="manual__doc" id="c-evento">
      <h2>Criar um evento</h2>
      <p>
        Em <strong>Eventos</strong>, crie um novo evento com nome e identificador (o <em>slug</em> que vira o endereço
        público, por exemplo <code>/e/sua-igreja</code>). Escolha se terá pagamento ligado ou será gratuito. Você pode
        manter as inscrições fechadas enquanto termina de montar tudo.
      </p>
    </section>

    <section className="manual__doc" id="c-form">
      <h2>Montar o formulário</h2>
      <p>
        No <strong>Construtor de Formulário</strong> você define quais perguntas o inscrito responde. Não precisa
        começar do zero:
      </p>
      <h3>Comece com um modelo</h3>
      <p>Com o formulário vazio, escolha um modelo pronto e ele cria as seções e campos base para você ajustar:</p>
      <div className="manual__cards">
        <div className="manual__card"><h4>Acampamento</h4><p>Dados pessoais, responsável, pacote (hospedagem/alimentação), carona e saúde.</p></div>
        <div className="manual__card"><h4>Congresso</h4><p>Dados pessoais, responsável, pacote de inscrição e informações ministeriais.</p></div>
        <div className="manual__card"><h4>Retiro</h4><p>Dados pessoais, responsável, pacote, transporte e saúde.</p></div>
      </div>
      <h3>Seções e campos</h3>
      <p>
        Organize o formulário em <strong>seções</strong> e, dentro delas, <strong>campos</strong>. Cada campo tem
        rótulo, tipo e se é obrigatório. Tipos disponíveis:
      </p>
      <ul>
        <li>Texto curto e longo, número, data, e-mail, telefone;</li>
        <li><strong>CPF</strong> — garante inscrição única por documento;</li>
        <li>Lista, escolha única e múltipla escolha (opções digitadas <em>ou</em> puxadas de tabelas do evento, como produtos e lotes);</li>
        <li><strong>Consentimento (LGPD)</strong> — caixa de aceite com texto e link;</li>
        <li><strong>Arquivo</strong> — o inscrito envia um documento (ver documento de menor).</li>
      </ul>
      <h3>Módulos</h3>
      <p>
        Ative o módulo <strong>Pacote</strong> (hospedagem, alimentação e transporte por categorias) e o módulo{' '}
        <strong>Carona</strong> (oferta e procura de vagas), quando o evento pedir.
      </p>
    </section>

    <section className="manual__doc" id="c-produtos">
      <h2>Produtos, pacotes e lotes</h2>
      <p>
        Para eventos pagos, cadastre <strong>produtos</strong>, agrupe-os em <strong>categorias de pacote</strong> e
        defina <strong>lotes</strong> com datas e preços. O valor de cada inscrição é calculado automaticamente a
        partir do pacote escolhido, das regras de preço por idade e da taxa do evento.
      </p>
    </section>

    <section className="manual__doc" id="c-publicar">
      <h2>Publicar e a página pública</h2>
      <p>
        Em <strong>Estágio do Formulário</strong> você liga as inscrições. A página pública fica em{' '}
        <code>/e/seu-slug</code>: o inscrito faz login, preenche o formulário (várias pessoas da família num único
        carrinho) e paga por PIX, cartão ou boleto. A confirmação é automática — sem enviar comprovante.
      </p>
      <h3>Área institucional</h3>
      <p>
        Cada evento tem uma <strong>landing institucional</strong> editável (programação, galeria, parceiros, como
        chegar, contador de visitas) com <strong>templates</strong> de layout e cor escolhidos no admin, sem mexer no
        formulário.
      </p>
    </section>

    <section className="manual__doc" id="c-inscricoes">
      <h2>Gerenciar inscrições</h2>
      <p>
        Em <strong>Inscrições</strong> você vê tudo em tabela, com busca, cartões de resumo e{' '}
        <strong>exportação para Excel</strong>. Dá para ver detalhes, editar, excluir (vai para a lixeira, com
        restauração) e, em inscrições pagas, emitir <strong>reembolso</strong>.
      </p>
      <h3>Campos administrativos</h3>
      <p>
        Você pode criar <strong>campos que só a administração preenche</strong> após a inscrição (equipe, observações
        internas, família pastoral). Eles aparecem como colunas extras marcadas na tabela e entram no export,
        separados das respostas do inscrito.
      </p>
      <h3>Documento de menor</h3>
      <p>
        Suba um <strong>modelo de documento</strong> por evento; o responsável baixa o modelo no formulário e envia o
        documento assinado pelo campo de arquivo. Você acessa cada arquivo direto na tabela de inscrições.
      </p>
    </section>

    <section className="manual__doc" id="c-ferramentas">
      <h2>Ferramentas do evento</h2>
      <div className="manual__cards">
        <div className="manual__card"><h4>Check-in</h4><p>Presença por CPF ou QR, individual ou por pedido.</p></div>
        <div className="manual__card"><h4>Quartos</h4><p>Distribuição de inscritos por quarto, com acompanhantes.</p></div>
        <div className="manual__card"><h4>Times</h4><p>Alocação de inscritos em times/equipes.</p></div>
        <div className="manual__card"><h4>Pulseiras</h4><p>Controle de pulseiras por inscrito.</p></div>
        <div className="manual__card"><h4>Boletos</h4><p>Boletos parcelados e vencimentos.</p></div>
        <div className="manual__card"><h4>FAQ e chatbot</h4><p>Perguntas frequentes em accordions e assistente opcional.</p></div>
      </div>
      <div className="manual__callout is-good">
        <div className="manual__callout-k">Dica</div>
        <p>
          Em <strong>Papéis e Permissões</strong> crie contas para sua equipe (secretaria, credenciamento,
          financeiro) com acesso só ao que cada um precisa.
        </p>
      </div>
    </section>
  </>
);

const DonoDocs = () => (
  <>
    <div className="manual__hero">
      <span className="manual__eyebrow">Para o operador da plataforma</span>
      <h1>Runbook do dono</h1>
      <p className="manual__lede">
        Como <strong>você</strong> opera o negócio: provisionar e gerir igrejas, receber via split do PagarMe e
        controlar inadimplência. Uma única instância serve todas as igrejas como <em>tenants</em>.
      </p>
    </div>

    <section className="manual__doc" id="d-painel">
      <h2>Painel da Plataforma</h2>
      <p>
        O <strong>Painel da Plataforma</strong> (em <code>/platform</code>) é separado do admin das igrejas e só
        aparece para você. O acesso é liberado por uma <strong>allowlist de e-mails</strong>: quem estiver em{' '}
        <code>PLATFORM_OWNER_EMAILS</code> enxerga o painel; os demais recebem 403. Lá você vê os totais e a lista de
        todas as igrejas.
      </p>
    </section>

    <section className="manual__doc" id="d-provisionar">
      <h2>Provisionar uma igreja</h2>
      <p>Provisionar é <strong>instantâneo</strong> — cria linhas no banco, sem deploy manual. Dois caminhos:</p>
      <div className="manual__steps">
        <div className="manual__step"><div className="manual__step-n">1</div><div><h4>Self-service (loja)</h4><p>A igreja entra em <code>/comprar</code>, preenche nome, identificador e dados do admin, e o sistema cria a organização + admin + primeiro evento automaticamente.</p></div></div>
        <div className="manual__step"><div className="manual__step-n">2</div><div><h4>Manual (painel)</h4><p>Você cria a organização pelo Painel da Plataforma, definindo nome, identificador, plano e status.</p></div></div>
      </div>
      <div className="manual__callout is-warn">
        <div className="manual__callout-k">Atenção</div>
        <p>Hoje o signup já dá acesso imediato (sem e-mail de confirmação). Falta o e-mail de boas-vindas com credenciais — melhoria planejada.</p>
      </div>
    </section>

    <section className="manual__doc" id="d-cobranca">
      <h2>Como você recebe</h2>
      <p>Você <strong>não é facilitador de pagamento</strong>. O dinheiro flui em dois canais:</p>
      <ul>
        <li><strong>Inscrito → Igreja:</strong> o pagamento da inscrição cai na conta da própria igreja.</li>
        <li><strong>Igreja → Você:</strong> você fica com um percentual, automático.</li>
      </ul>
      <h3>Eventos pagos: split do PagarMe</h3>
      <p>
        Cada igreja é um <strong>recebedor (recipient)</strong> no seu marketplace PagarMe. Em cada inscrição paga, o
        PagarMe faz o <strong>split</strong>: a igreja recebe (100 − X)% direto e você recebe <strong>X%</strong>. O
        PagarMe custodia e liquida. No painel, cada organização tem o <strong>recebedor</strong> e a{' '}
        <strong>taxa da plataforma (%)</strong>.
      </p>
      <h3>Eventos gratuitos</h3>
      <p>
        Sem inscrição paga não há split, então a igreja paga uma <strong>taxa fixa</strong> a você (por evento, ou um
        valor por eventos ilimitados), com <strong>14 dias de trial</strong>.
      </p>
      <div className="manual__callout">
        <div className="manual__callout-k">Onde definir</div>
        <p>
          O <strong>%</strong> padrão, a <strong>taxa de evento gratuito</strong> e o <strong>anual</strong> são
          editados em <strong>Preços da plataforma</strong>, no painel do dono. A taxa (%) pode ser sobrescrita por
          igreja. Padrões atuais: 5%, R$39/evento, R$290/ano.
        </p>
      </div>
      <div className="manual__callout is-warn">
        <div className="manual__callout-k">Valide com contador</div>
        <p>Você é o marketplace de registro; o PagarMe é a instituição regulada. Valide NF do seu percentual e enquadramento fiscal com um contador.</p>
      </div>
    </section>

    <section className="manual__doc" id="d-inadimplencia">
      <h2>Inadimplência e regularização</h2>
      <p>Cada organização tem um <strong>estado de cobrança</strong> e uma <strong>data de vencimento</strong>. O bloqueio é escalonado a partir do vencimento (ou do fim do trial):</p>
      <div className="manual__table-wrap">
        <table className="manual__table">
          <thead><tr><th>Situação</th><th>Estado</th><th>O que acontece</th></tr></thead>
          <tbody>
            <tr><td>Em dia / trial vigente</td><td><span className="manual__pill is-good">Liberado</span></td><td>Acesso total.</td></tr>
            <tr><td>Até 2 dias após o vencimento</td><td><span className="manual__pill is-warn">Aviso</span></td><td>Acesso total; e-mail avisando o bloqueio.</td></tr>
            <tr><td>2 a 7 dias após</td><td><span className="manual__pill is-warn">Form bloqueado</span></td><td>Página pública off; admin ainda entra.</td></tr>
            <tr><td>7+ dias após</td><td><span className="manual__pill is-danger">Admin bloqueado</span></td><td>Sistema 100% inutilizado até regularizar.</td></tr>
            <tr><td>Cancelado</td><td><span className="manual__pill is-danger">Bloqueado</span></td><td>Acesso encerrado.</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Um <strong>job diário</strong> envia os e-mails de aviso/bloqueio. No painel, a seção{' '}
        <strong>Cobrança &amp; inadimplência</strong> mostra a situação de todas as igrejas (em dia / vencendo / form
        bloqueado / admin bloqueado) e uma lista de atenção com os dias até o próximo bloqueio.
      </p>
      <p>
        Para reativar uma igreja, use o botão <strong>Regularizar</strong> (1 clique: volta a ativa e avança o
        vencimento). A regularização <strong>automática</strong> — pagamento confirmado reativa a org via webhook —
        já tem o endpoint pronto e entra junto com a cobrança real no PagarMe.
      </p>
    </section>

    <section className="manual__doc" id="d-config">
      <h2>Configuração</h2>
      <div className="manual__table-wrap">
        <table className="manual__table">
          <thead><tr><th>Variável</th><th>Para quê</th></tr></thead>
          <tbody>
            <tr><td><code>PLATFORM_OWNER_EMAILS</code></td><td>E-mails que enxergam o Painel da Plataforma.</td></tr>
            <tr><td><code>PAGARME_SECRET_KEY</code></td><td>Chave master do seu marketplace PagarMe.</td></tr>
            <tr><td><code>PAGARME_PLATFORM_RECIPIENT_ID</code></td><td>Seu recebedor (onde cai o seu %).</td></tr>
            <tr><td><code>PAGARME_PLATFORM_FEE_PERCENT</code></td><td>Percentual padrão da plataforma (default 10).</td></tr>
            <tr><td><code>APP_FRONTEND_URL</code></td><td>Domínio usado em links de e-mail e no success_url.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="manual__doc" id="d-hosting">
      <h2>Custo de hospedagem</h2>
      <p>
        Como é <strong>uma instância única</strong> servindo todas as igrejas, o custo é fixo (não cresce por
        cliente) até precisar escalar. Componentes:
      </p>
      <div className="manual__table-wrap">
        <table className="manual__table">
          <thead><tr><th>Componente</th><th>Opção típica</th><th>Custo/mês (ref.)</th></tr></thead>
          <tbody>
            <tr><td>Frontend (estático)</td><td>Vercel / Netlify / Cloudflare Pages</td><td>Grátis–US$20</td></tr>
            <tr><td>Backend (JVM ~1&nbsp;GB)</td><td>VPS (Hostinger/DO) ou Railway/Fly.io</td><td>US$7–15</td></tr>
            <tr><td>Banco MySQL</td><td>No mesmo VPS, ou gerenciado</td><td>US$0–15</td></tr>
            <tr><td>E-mail transacional</td><td>Brevo/Resend (tier grátis)</td><td>Grátis–US$10</td></tr>
            <tr><td>Storage de arquivos</td><td>S3 / Cloudflare R2 (se migrar do banco)</td><td>~Grátis–US$5</td></tr>
            <tr><td>Domínio</td><td>anual, rateado</td><td>~US$1–3</td></tr>
          </tbody>
        </table>
      </div>
      <p>Dois cenários realistas em baixo volume:</p>
      <ul>
        <li><strong>Enxuto</strong> (VPS único self-managed + FE grátis + e-mail no tier grátis): <strong>~US$10–18/mês</strong> (~R$60–100).</li>
        <li><strong>Gerenciado</strong> (Railway/Render + banco gerenciado + FE grátis): <strong>~US$25–45/mês</strong> (~R$140–250).</li>
      </ul>
      <div className="manual__callout is-warn">
        <div className="manual__callout-k">Ponto de atenção</div>
        <p>
          Hoje imagens e PDFs são guardados como BLOB no MySQL — isso incha o banco e encarece o storage gerenciado.
          Migrar esses arquivos para <strong>object storage</strong> (S3/R2) reduz custo e melhora performance.
        </p>
      </div>
      <div className="manual__callout is-good">
        <div className="manual__callout-k">Ponto de equilíbrio</div>
        <p>
          Com custo fixo de ~R$100/mês: a um ticket médio de R$150 e taxa de 5%, <strong>~14 inscrições pagas/mês</strong>
          já cobrem a infra; ou uma a duas taxas de evento gratuito. Isso alimenta a definição de preços.
        </p>
      </div>
      <p className="manual__lede" style={{ fontSize: '14px' }}>
        Valores são <strong>referências</strong> (câmbio ~R$5,50/US$, varia) para dimensionar — confirme na
        contratação.
      </p>
    </section>

    <section className="manual__doc" id="d-golive">
      <h2>O que falta para o go-live</h2>
      <ul>
        <li><strong>Onboarding do recebedor</strong> — formulário de dados bancários/KYC criando o recipient no PagarMe.</li>
        <li><strong>Checkout via Orders API</strong> — migrar PIX/cartão/boleto para o Orders com split (validar em sandbox).</li>
        <li><strong>Taxa de evento gratuito</strong> e <strong>plano anual</strong> opcional.</li>
        <li><strong>Regularização automática</strong> por webhook de pagamento.</li>
        <li><strong>Preços</strong> definitivos e custo de hospedagem.</li>
      </ul>
    </section>
  </>
);

const TecnicoDocs = () => (
  <>
    <div className="manual__hero">
      <span className="manual__eyebrow">Para engenharia</span>
      <h1>Arquitetura da plataforma</h1>
      <p className="manual__lede">
        Uma instância multi-tenant, formulário <strong>schema-driven</strong>, sobre Spring Boot e React. Panorama
        para onboarding de devs e manutenção.
      </p>
    </div>

    <section className="manual__doc" id="t-stack">
      <h2>Stack</h2>
      <ul>
        <li><strong>Backend:</strong> Spring Boot 3.1.2 · Java 17 · Maven · MySQL · Flyway · Spring Data JPA · Lombok · Spring Security (JWT).</li>
        <li><strong>Frontend:</strong> React 18 · Vite · react-router · react-bootstrap · react-query · react-toastify · DOMPurify.</li>
        <li><strong>Pagamentos:</strong> PagarMe API v5 (payment links + Orders; migração para Orders + split em andamento).</li>
      </ul>
    </section>

    <section className="manual__doc" id="t-tenancy">
      <h2>Multi-tenancy</h2>
      <p>Hierarquia: <strong>Organization</strong> → <strong>Event</strong> → tudo escopado por <code>event_id</code>.</p>
      <ul>
        <li>Controllers de evento usam <code>@EventScoped</code> sob <code>/e/{'{'}slug{'}'}/…</code>.</li>
        <li><code>EventResolverInterceptor</code> resolve o slug → Event, popula o <code>EventContext</code> (ThreadLocal) e aplica o <strong>gate de cobrança</strong>.</li>
        <li>Controllers de plataforma (auth, users, events, <code>/platform</code>) não são event-scoped.</li>
        <li>No FE, <code>withEventScope(url)</code> reescreve <code>/x</code> → <code>/e/{'{'}slug{'}'}/x</code> só para os prefixos em <code>EVENT_SCOPED_PREFIXES</code>.</li>
      </ul>
    </section>

    <section className="manual__doc" id="t-schema">
      <h2>Formulário schema-driven</h2>
      <ul>
        <li><code>FormSection</code> / <code>FormField</code> definem o formulário por evento; opções podem vir de tabelas (<code>config.source</code> = products/lots/package_categories).</li>
        <li>Módulos (Pacote, Carona) são seções com <code>moduleType</code>.</li>
        <li><code>EventRegistration</code> guarda respostas em JSON (<code>answers</code>) e respostas administrativas em <code>adminAnswers</code>.</li>
        <li><code>AdminField</code>, <code>MinorTemplate</code> e <code>RegistrationUpload</code> complementam o motor.</li>
      </ul>
      <div className="manual__callout">
        <div className="manual__callout-k">Legado vs genérico</div>
        <p>
          O caminho <strong>genérico</strong> (schema-driven, <code>EventRegistration</code>) convive com o{' '}
          <strong>legado Camper</strong> (tabelas <code>acampantes</code>, específico do IPBV). O rewrite do IPBV é o
          item final do roadmap.
        </p>
      </div>
    </section>

    <section className="manual__doc" id="t-checkout">
      <h2>Checkout e split</h2>
      <p><code>GenericCheckoutService</code> cria as cobranças no PagarMe (auth Basic, host de sandbox para <code>sk_test</code>). Modelo de receita = <strong>marketplace + split</strong>:</p>
      <ul>
        <li>A igreja é um <strong>recipient</strong> sob o marketplace; a cobrança usa a chave master da plataforma.</li>
        <li><code>PagarmeSplitService</code> monta o array de split percentual (igreja 100 − X, plataforma X) em <code>payments[].split[]</code>.</li>
        <li>Split no <strong>Orders API</strong> cobre pix/cartão/boleto; payment link só splita cartão — daí a migração.</li>
      </ul>
    </section>

    <section className="manual__doc" id="t-billing">
      <h2>Billing e enforcement</h2>
      <ul>
        <li><code>Organization</code>: <code>pagarme_recipient_id</code>, <code>platform_fee_percent</code>, <code>billing_status</code>, <code>due_date</code>, <code>trial_ends_at</code>.</li>
        <li><code>BillingEnforcementService.levelFor(org)</code> computa NONE / PUBLIC_BLOCKED / ADMIN_BLOCKED (2 e 7 dias).</li>
        <li>O interceptor devolve <strong>402</strong> com <code>billing_blocked: public|admin</code>; staff (role ≠ guest) passa no bloqueio só-público.</li>
        <li><code>BillingNotificationService</code>: job <code>@Scheduled</code> diário de avisos.</li>
      </ul>
    </section>

    <section className="manual__doc" id="t-platform">
      <h2>Camada de plataforma</h2>
      <ul>
        <li><code>PlatformController</code> / <code>PlatformService</code>: organizações (CRUD), stats, FAQ da loja — gateados por <code>@platformSecurity.isOwner</code>.</li>
        <li><code>ProvisioningService</code>: cria org + admin + evento no signup (trial de 14 dias).</li>
        <li><code>PlatformSecurityService</code>: checa o e-mail contra <code>platform.owner-emails</code>.</li>
        <li>Migrations Flyway recentes: V3.73 (organization) → V3.79 (billing status).</li>
      </ul>
    </section>
  </>
);

const VendasDocs = () => (
  <>
    <div className="manual__hero">
      <span className="manual__eyebrow">Para igrejas e eventos cristãos</span>
      <h1>O sistema de inscrições feito para a sua igreja</h1>
      <p className="manual__lede">
        Formulário personalizado, pagamento online e gestão completa de acampamentos, congressos e retiros.{' '}
        <strong>Sem mensalidade</strong> que pese no orçamento da igreja pequena.
      </p>
    </div>

    <section className="manual__doc" id="v-porque">
      <h2>Por que não é só um formulário</h2>
      <p>
        Existe o Sympla (venda de ingresso) e o Google Forms (formulário). Não existe um{' '}
        <strong>formulário 100% editável, focado na realidade da igreja</strong>, com pagamento e as automações que o
        evento cristão precisa.
      </p>
      <div className="manual__cards">
        <div className="manual__card"><h4>vs. Google Forms</h4><p>Aqui tem pagamento, pacotes, contas de usuário e controle do evento — não só coleta.</p></div>
        <div className="manual__card"><h4>vs. Sympla</h4><p>O formulário é seu, editável campo a campo, com carona, quartos, times, pulseiras e check-in.</p></div>
      </div>
    </section>

    <section className="manual__doc" id="v-como">
      <h2>Como funciona</h2>
      <div className="manual__steps">
        <div className="manual__step"><div className="manual__step-n">1</div><div><h4>Crie sua conta</h4><p>Grátis, em minutos. Você só paga quando cria um evento.</p></div></div>
        <div className="manual__step"><div className="manual__step-n">2</div><div><h4>Monte seu evento</h4><p>Comece por um modelo pronto e ajuste campos, pacotes e a página do evento.</p></div></div>
        <div className="manual__step"><div className="manual__step-n">3</div><div><h4>Publique e receba</h4><p>Divulgue o link e receba inscrições e pagamentos direto na conta da igreja, com confirmação automática.</p></div></div>
      </div>
    </section>

    <section className="manual__doc" id="v-precos">
      <h2>Preços</h2>
      <p>Pensado para <strong>não onerar igreja pequena</strong>: você paga conforme usa.</p>
      <div className="manual__pricegrid">
        <div className="manual__price is-feature">
          <h4>Evento pago</h4>
          <div className="amt">5% <small>por inscrição paga</small></div>
          <ul><li>Taxa de serviço somada ao inscrito</li><li>Dinheiro na conta da igreja</li><li>PIX, cartão e boleto</li></ul>
        </div>
        <div className="manual__price">
          <h4>Evento gratuito</h4>
          <div className="amt">R$39 <small>por evento</small></div>
          <ul><li>Ou R$290/ano ilimitado</li><li>14 dias de trial</li><li>Inscrições ilimitadas</li></ul>
        </div>
        <div className="manual__price">
          <h4>Sem mensalidade</h4>
          <div className="amt">R$0 <small>fixo</small></div>
          <ul><li>Você paga conforme usa</li><li>Sem assinatura obrigatória</li><li>Acessível a igreja pequena</li></ul>
        </div>
      </div>
      <div className="manual__callout">
        <div className="manual__callout-k">Nota</div>
        <p>Modelo <strong>pay-as-you-go</strong>: sem mensalidade obrigatória, sem custódia do dinheiro da igreja. Os valores (o %, a taxa de evento gratuito e o anual) são definidos pelo dono no painel da plataforma.</p>
      </div>
    </section>

    <section className="manual__doc" id="v-recursos">
      <h2>Tudo que vem junto</h2>
      <div className="manual__cards">
        <div className="manual__card"><h4>Formulário editável</h4><p>Campos, seções e regras do seu jeito, com modelos prontos.</p></div>
        <div className="manual__card"><h4>Pagamento automático</h4><p>PIX, cartão e boleto com confirmação sem comprovante.</p></div>
        <div className="manual__card"><h4>Carona e transporte</h4><p>Oferta e procura de vagas e ônibus da igreja.</p></div>
        <div className="manual__card"><h4>Quartos e times</h4><p>Hospedagem e equipes organizadas pela administração.</p></div>
        <div className="manual__card"><h4>Check-in e pulseiras</h4><p>Presença por QR/CPF no dia do evento.</p></div>
        <div className="manual__card"><h4>Multi-evento</h4><p>Acampamento, congressos e retiros na mesma conta.</p></div>
        <div className="manual__card"><h4>Página do evento</h4><p>Landing institucional com programação, galeria e mapa.</p></div>
        <div className="manual__card"><h4>Relatórios</h4><p>Inscrições em tabela, exportação para Excel e resumos.</p></div>
      </div>
    </section>
  </>
);

Manual.propTypes = {
  loggedUsername: PropTypes.string,
  publicMode: PropTypes.bool,
};

export default Manual;
