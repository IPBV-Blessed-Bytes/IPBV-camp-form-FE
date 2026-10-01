import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import { StoreNav, StoreFooter } from '@/components/Storefront/StorefrontChrome';
import { getPlatformMe } from '@/services/platform';
import './style.scss';
import '../Storefront/style.scss';

const FMT = {
  strong: <strong />,
  em: <em />,
  code: <code />,
  small: <small />,
};

const AUDIENCES = [
  { key: 'cliente', ownerOnly: false },
  { key: 'dono', ownerOnly: true },
  { key: 'tecnico', ownerOnly: true },
  { key: 'vendas', ownerOnly: true },
];

const SECTIONS = {
  cliente: [
    { id: 'c-comecar' },
    { id: 'c-evento' },
    { id: 'c-form' },
    { id: 'c-produtos' },
    { id: 'c-publicar' },
    { id: 'c-inscricoes' },
    { id: 'c-ferramentas' },
  ],
  dono: [
    { id: 'd-painel' },
    { id: 'd-provisionar' },
    { id: 'd-cobranca' },
    { id: 'd-inadimplencia' },
    { id: 'd-config' },
    { id: 'd-hosting' },
    { id: 'd-golive' },
  ],
  tecnico: [
    { id: 't-stack' },
    { id: 't-tenancy' },
    { id: 't-schema' },
    { id: 't-checkout' },
    { id: 't-billing' },
    { id: 't-platform' },
  ],
  vendas: [
    { id: 'v-porque' },
    { id: 'v-como' },
    { id: 'v-precos' },
    { id: 'v-recursos' },
  ],
};

const Manual = ({ loggedUsername, publicMode = false }) => {
  const { t } = useTranslation();
  const [owner, setOwner] = useState(false);
  const [active, setActive] = useState('cliente');
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    if (publicMode) {
      setOwner(false);
      document.title = t('manual.header.docTitlePublic');
      return;
    }
    getPlatformMe()
      .then((data) => setOwner(Boolean(data?.owner)))
      .catch(() => setOwner(false));
  }, [publicMode, t]);

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
          title={t('manual.header.title')}
          subtitle={t('manual.header.subtitle')}
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
                {t(`manual.tabs.${tab.key}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="manual__layout">
        <aside className="manual__subnav">
          <p className="manual__subnav-title">{t('manual.nav.title')}</p>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  className={activeSection === s.id ? 'is-active' : ''}
                  onClick={() => goTo(s.id)}
                >
                  {t(`manual.nav.${s.id}`)}
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
            <div className="manual__footer">{t('manual.footer')}</div>
          )}
        </main>
      </div>

      {publicMode && <StoreFooter />}
    </div>
  );
};

const ClienteDocs = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="manual__hero">
        <span className="manual__eyebrow">{t('manual.cliente.hero.eyebrow')}</span>
        <h1>{t('manual.cliente.hero.title')}</h1>
        <p className="manual__lede">
          <Trans t={t} i18nKey="manual.cliente.hero.lede" components={FMT} />
        </p>
      </div>

      <section className="manual__doc" id="c-comecar">
        <h2>{t('manual.cliente.comecar.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.cliente.comecar.p1" components={FMT} /></p>
        <div className="manual__callout">
          <div className="manual__callout-k">{t('manual.cliente.comecar.calloutK')}</div>
          <p><Trans t={t} i18nKey="manual.cliente.comecar.calloutP" components={FMT} /></p>
        </div>
      </section>

      <section className="manual__doc" id="c-evento">
        <h2>{t('manual.cliente.evento.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.cliente.evento.p1" components={FMT} /></p>
      </section>

      <section className="manual__doc" id="c-form">
        <h2>{t('manual.cliente.form.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.cliente.form.p1" components={FMT} /></p>
        <h3>{t('manual.cliente.form.h3modelo')}</h3>
        <p>{t('manual.cliente.form.pModelo')}</p>
        <div className="manual__cards">
          <div className="manual__card"><h4>{t('manual.cliente.form.cardAcampamentoT')}</h4><p>{t('manual.cliente.form.cardAcampamentoP')}</p></div>
          <div className="manual__card"><h4>{t('manual.cliente.form.cardCongressoT')}</h4><p>{t('manual.cliente.form.cardCongressoP')}</p></div>
          <div className="manual__card"><h4>{t('manual.cliente.form.cardRetiroT')}</h4><p>{t('manual.cliente.form.cardRetiroP')}</p></div>
        </div>
        <h3>{t('manual.cliente.form.h3campos')}</h3>
        <p><Trans t={t} i18nKey="manual.cliente.form.pCampos" components={FMT} /></p>
        <ul>
          <li><Trans t={t} i18nKey="manual.cliente.form.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.cliente.form.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.cliente.form.li3" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.cliente.form.li4" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.cliente.form.li5" components={FMT} /></li>
        </ul>
        <h3>{t('manual.cliente.form.h3modulos')}</h3>
        <p><Trans t={t} i18nKey="manual.cliente.form.pModulos" components={FMT} /></p>
      </section>

      <section className="manual__doc" id="c-produtos">
        <h2>{t('manual.cliente.produtos.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.cliente.produtos.p1" components={FMT} /></p>
      </section>

      <section className="manual__doc" id="c-publicar">
        <h2>{t('manual.cliente.publicar.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.cliente.publicar.p1" components={FMT} /></p>
        <h3>{t('manual.cliente.publicar.h3inst')}</h3>
        <p><Trans t={t} i18nKey="manual.cliente.publicar.pInst" components={FMT} /></p>
      </section>

      <section className="manual__doc" id="c-inscricoes">
        <h2>{t('manual.cliente.inscricoes.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.cliente.inscricoes.p1" components={FMT} /></p>
        <h3>{t('manual.cliente.inscricoes.h3admin')}</h3>
        <p><Trans t={t} i18nKey="manual.cliente.inscricoes.pAdmin" components={FMT} /></p>
        <h3>{t('manual.cliente.inscricoes.h3menor')}</h3>
        <p><Trans t={t} i18nKey="manual.cliente.inscricoes.pMenor" components={FMT} /></p>
      </section>

      <section className="manual__doc" id="c-ferramentas">
        <h2>{t('manual.cliente.ferramentas.h2')}</h2>
        <div className="manual__cards">
          <div className="manual__card"><h4>{t('manual.cliente.ferramentas.cardCheckinT')}</h4><p>{t('manual.cliente.ferramentas.cardCheckinP')}</p></div>
          <div className="manual__card"><h4>{t('manual.cliente.ferramentas.cardQuartosT')}</h4><p>{t('manual.cliente.ferramentas.cardQuartosP')}</p></div>
          <div className="manual__card"><h4>{t('manual.cliente.ferramentas.cardTimesT')}</h4><p>{t('manual.cliente.ferramentas.cardTimesP')}</p></div>
          <div className="manual__card"><h4>{t('manual.cliente.ferramentas.cardPulseirasT')}</h4><p>{t('manual.cliente.ferramentas.cardPulseirasP')}</p></div>
          <div className="manual__card"><h4>{t('manual.cliente.ferramentas.cardBoletosT')}</h4><p>{t('manual.cliente.ferramentas.cardBoletosP')}</p></div>
          <div className="manual__card"><h4>{t('manual.cliente.ferramentas.cardFaqT')}</h4><p>{t('manual.cliente.ferramentas.cardFaqP')}</p></div>
        </div>
        <div className="manual__callout is-good">
          <div className="manual__callout-k">{t('manual.cliente.ferramentas.calloutK')}</div>
          <p><Trans t={t} i18nKey="manual.cliente.ferramentas.calloutP" components={FMT} /></p>
        </div>
      </section>
    </>
  );
};

const DonoDocs = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="manual__hero">
        <span className="manual__eyebrow">{t('manual.dono.hero.eyebrow')}</span>
        <h1>{t('manual.dono.hero.title')}</h1>
        <p className="manual__lede">
          <Trans t={t} i18nKey="manual.dono.hero.lede" components={FMT} />
        </p>
      </div>

      <section className="manual__doc" id="d-painel">
        <h2>{t('manual.dono.painel.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.dono.painel.p1" components={FMT} /></p>
      </section>

      <section className="manual__doc" id="d-provisionar">
        <h2>{t('manual.dono.provisionar.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.dono.provisionar.p1" components={FMT} /></p>
        <div className="manual__steps">
          <div className="manual__step"><div className="manual__step-n">1</div><div><h4>{t('manual.dono.provisionar.step1T')}</h4><p><Trans t={t} i18nKey="manual.dono.provisionar.step1P" components={FMT} /></p></div></div>
          <div className="manual__step"><div className="manual__step-n">2</div><div><h4>{t('manual.dono.provisionar.step2T')}</h4><p>{t('manual.dono.provisionar.step2P')}</p></div></div>
        </div>
        <div className="manual__callout is-warn">
          <div className="manual__callout-k">{t('manual.dono.provisionar.calloutK')}</div>
          <p>{t('manual.dono.provisionar.calloutP')}</p>
        </div>
      </section>

      <section className="manual__doc" id="d-cobranca">
        <h2>{t('manual.dono.cobranca.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.dono.cobranca.p1" components={FMT} /></p>
        <ul>
          <li><Trans t={t} i18nKey="manual.dono.cobranca.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.dono.cobranca.li2" components={FMT} /></li>
        </ul>
        <h3>{t('manual.dono.cobranca.h3split')}</h3>
        <p><Trans t={t} i18nKey="manual.dono.cobranca.pSplit" components={FMT} /></p>
        <h3>{t('manual.dono.cobranca.h3gratuitos')}</h3>
        <p><Trans t={t} i18nKey="manual.dono.cobranca.pGratuitos" components={FMT} /></p>
        <div className="manual__callout">
          <div className="manual__callout-k">{t('manual.dono.cobranca.calloutDefK')}</div>
          <p><Trans t={t} i18nKey="manual.dono.cobranca.calloutDefP" components={FMT} /></p>
        </div>
        <div className="manual__callout is-warn">
          <div className="manual__callout-k">{t('manual.dono.cobranca.calloutContK')}</div>
          <p>{t('manual.dono.cobranca.calloutContP')}</p>
        </div>
      </section>

      <section className="manual__doc" id="d-inadimplencia">
        <h2>{t('manual.dono.inadimplencia.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.dono.inadimplencia.p1" components={FMT} /></p>
        <div className="manual__table-wrap">
          <table className="manual__table">
            <thead><tr><th>{t('manual.dono.inadimplencia.thSituacao')}</th><th>{t('manual.dono.inadimplencia.thEstado')}</th><th>{t('manual.dono.inadimplencia.thAcontece')}</th></tr></thead>
            <tbody>
              <tr><td>{t('manual.dono.inadimplencia.r1Situacao')}</td><td><span className="manual__pill is-good">{t('manual.dono.inadimplencia.r1Estado')}</span></td><td>{t('manual.dono.inadimplencia.r1Acontece')}</td></tr>
              <tr><td>{t('manual.dono.inadimplencia.r2Situacao')}</td><td><span className="manual__pill is-warn">{t('manual.dono.inadimplencia.r2Estado')}</span></td><td>{t('manual.dono.inadimplencia.r2Acontece')}</td></tr>
              <tr><td>{t('manual.dono.inadimplencia.r3Situacao')}</td><td><span className="manual__pill is-warn">{t('manual.dono.inadimplencia.r3Estado')}</span></td><td>{t('manual.dono.inadimplencia.r3Acontece')}</td></tr>
              <tr><td>{t('manual.dono.inadimplencia.r4Situacao')}</td><td><span className="manual__pill is-danger">{t('manual.dono.inadimplencia.r4Estado')}</span></td><td>{t('manual.dono.inadimplencia.r4Acontece')}</td></tr>
              <tr><td>{t('manual.dono.inadimplencia.r5Situacao')}</td><td><span className="manual__pill is-danger">{t('manual.dono.inadimplencia.r5Estado')}</span></td><td>{t('manual.dono.inadimplencia.r5Acontece')}</td></tr>
            </tbody>
          </table>
        </div>
        <p><Trans t={t} i18nKey="manual.dono.inadimplencia.p2" components={FMT} /></p>
        <p><Trans t={t} i18nKey="manual.dono.inadimplencia.p3" components={FMT} /></p>
      </section>

      <section className="manual__doc" id="d-config">
        <h2>{t('manual.dono.config.h2')}</h2>
        <div className="manual__table-wrap">
          <table className="manual__table">
            <thead><tr><th>{t('manual.dono.config.thVar')}</th><th>{t('manual.dono.config.thParaQue')}</th></tr></thead>
            <tbody>
              <tr><td><code>PLATFORM_OWNER_EMAILS</code></td><td>{t('manual.dono.config.var1')}</td></tr>
              <tr><td><code>PAGARME_SECRET_KEY</code></td><td>{t('manual.dono.config.var2')}</td></tr>
              <tr><td><code>PAGARME_PLATFORM_RECIPIENT_ID</code></td><td>{t('manual.dono.config.var3')}</td></tr>
              <tr><td><code>PAGARME_PLATFORM_FEE_PERCENT</code></td><td>{t('manual.dono.config.var4')}</td></tr>
              <tr><td><code>APP_FRONTEND_URL</code></td><td>{t('manual.dono.config.var5')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="manual__doc" id="d-hosting">
        <h2>{t('manual.dono.hosting.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.dono.hosting.p1" components={FMT} /></p>
        <div className="manual__table-wrap">
          <table className="manual__table">
            <thead><tr><th>{t('manual.dono.hosting.thComponente')}</th><th>{t('manual.dono.hosting.thOpcao')}</th><th>{t('manual.dono.hosting.thCusto')}</th></tr></thead>
            <tbody>
              <tr><td>{t('manual.dono.hosting.r1Componente')}</td><td>{t('manual.dono.hosting.r1Opcao')}</td><td>{t('manual.dono.hosting.r1Custo')}</td></tr>
              <tr><td>{t('manual.dono.hosting.r2Componente')}</td><td>{t('manual.dono.hosting.r2Opcao')}</td><td>{t('manual.dono.hosting.r2Custo')}</td></tr>
              <tr><td>{t('manual.dono.hosting.r3Componente')}</td><td>{t('manual.dono.hosting.r3Opcao')}</td><td>{t('manual.dono.hosting.r3Custo')}</td></tr>
              <tr><td>{t('manual.dono.hosting.r4Componente')}</td><td>{t('manual.dono.hosting.r4Opcao')}</td><td>{t('manual.dono.hosting.r4Custo')}</td></tr>
              <tr><td>{t('manual.dono.hosting.r5Componente')}</td><td>{t('manual.dono.hosting.r5Opcao')}</td><td>{t('manual.dono.hosting.r5Custo')}</td></tr>
              <tr><td>{t('manual.dono.hosting.r6Componente')}</td><td>{t('manual.dono.hosting.r6Opcao')}</td><td>{t('manual.dono.hosting.r6Custo')}</td></tr>
            </tbody>
          </table>
        </div>
        <p>{t('manual.dono.hosting.p2')}</p>
        <ul>
          <li><Trans t={t} i18nKey="manual.dono.hosting.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.dono.hosting.li2" components={FMT} /></li>
        </ul>
        <div className="manual__callout is-warn">
          <div className="manual__callout-k">{t('manual.dono.hosting.calloutAtK')}</div>
          <p><Trans t={t} i18nKey="manual.dono.hosting.calloutAtP" components={FMT} /></p>
        </div>
        <div className="manual__callout is-good">
          <div className="manual__callout-k">{t('manual.dono.hosting.calloutEqK')}</div>
          <p><Trans t={t} i18nKey="manual.dono.hosting.calloutEqP" components={FMT} /></p>
        </div>
        <p className="manual__lede" style={{ fontSize: '14px' }}>
          <Trans t={t} i18nKey="manual.dono.hosting.ref" components={FMT} />
        </p>
      </section>

      <section className="manual__doc" id="d-golive">
        <h2>{t('manual.dono.golive.h2')}</h2>
        <ul>
          <li><Trans t={t} i18nKey="manual.dono.golive.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.dono.golive.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.dono.golive.li3" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.dono.golive.li4" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.dono.golive.li5" components={FMT} /></li>
        </ul>
      </section>
    </>
  );
};

const TecnicoDocs = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="manual__hero">
        <span className="manual__eyebrow">{t('manual.tecnico.hero.eyebrow')}</span>
        <h1>{t('manual.tecnico.hero.title')}</h1>
        <p className="manual__lede">
          <Trans t={t} i18nKey="manual.tecnico.hero.lede" components={FMT} />
        </p>
      </div>

      <section className="manual__doc" id="t-stack">
        <h2>{t('manual.tecnico.stack.h2')}</h2>
        <ul>
          <li><Trans t={t} i18nKey="manual.tecnico.stack.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.stack.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.stack.li3" components={FMT} /></li>
        </ul>
      </section>

      <section className="manual__doc" id="t-tenancy">
        <h2>{t('manual.tecnico.tenancy.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.tecnico.tenancy.p1" components={FMT} /></p>
        <ul>
          <li><Trans t={t} i18nKey="manual.tecnico.tenancy.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.tenancy.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.tenancy.li3" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.tenancy.li4" components={FMT} /></li>
        </ul>
      </section>

      <section className="manual__doc" id="t-schema">
        <h2>{t('manual.tecnico.schema.h2')}</h2>
        <ul>
          <li><Trans t={t} i18nKey="manual.tecnico.schema.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.schema.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.schema.li3" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.schema.li4" components={FMT} /></li>
        </ul>
        <div className="manual__callout">
          <div className="manual__callout-k">{t('manual.tecnico.schema.calloutK')}</div>
          <p><Trans t={t} i18nKey="manual.tecnico.schema.calloutP" components={FMT} /></p>
        </div>
      </section>

      <section className="manual__doc" id="t-checkout">
        <h2>{t('manual.tecnico.checkout.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.tecnico.checkout.p1" components={FMT} /></p>
        <ul>
          <li><Trans t={t} i18nKey="manual.tecnico.checkout.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.checkout.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.checkout.li3" components={FMT} /></li>
        </ul>
      </section>

      <section className="manual__doc" id="t-billing">
        <h2>{t('manual.tecnico.billing.h2')}</h2>
        <ul>
          <li><Trans t={t} i18nKey="manual.tecnico.billing.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.billing.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.billing.li3" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.billing.li4" components={FMT} /></li>
        </ul>
      </section>

      <section className="manual__doc" id="t-platform">
        <h2>{t('manual.tecnico.platform.h2')}</h2>
        <ul>
          <li><Trans t={t} i18nKey="manual.tecnico.platform.li1" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.platform.li2" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.platform.li3" components={FMT} /></li>
          <li><Trans t={t} i18nKey="manual.tecnico.platform.li4" components={FMT} /></li>
        </ul>
      </section>
    </>
  );
};

const VendasDocs = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="manual__hero">
        <span className="manual__eyebrow">{t('manual.vendas.hero.eyebrow')}</span>
        <h1>{t('manual.vendas.hero.title')}</h1>
        <p className="manual__lede">
          <Trans t={t} i18nKey="manual.vendas.hero.lede" components={FMT} />
        </p>
      </div>

      <section className="manual__doc" id="v-porque">
        <h2>{t('manual.vendas.porque.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.vendas.porque.p1" components={FMT} /></p>
        <div className="manual__cards">
          <div className="manual__card"><h4>{t('manual.vendas.porque.cardGfT')}</h4><p>{t('manual.vendas.porque.cardGfP')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.porque.cardSymplaT')}</h4><p>{t('manual.vendas.porque.cardSymplaP')}</p></div>
        </div>
      </section>

      <section className="manual__doc" id="v-como">
        <h2>{t('manual.vendas.como.h2')}</h2>
        <div className="manual__steps">
          <div className="manual__step"><div className="manual__step-n">1</div><div><h4>{t('manual.vendas.como.step1T')}</h4><p>{t('manual.vendas.como.step1P')}</p></div></div>
          <div className="manual__step"><div className="manual__step-n">2</div><div><h4>{t('manual.vendas.como.step2T')}</h4><p>{t('manual.vendas.como.step2P')}</p></div></div>
          <div className="manual__step"><div className="manual__step-n">3</div><div><h4>{t('manual.vendas.como.step3T')}</h4><p>{t('manual.vendas.como.step3P')}</p></div></div>
        </div>
      </section>

      <section className="manual__doc" id="v-precos">
        <h2>{t('manual.vendas.precos.h2')}</h2>
        <p><Trans t={t} i18nKey="manual.vendas.precos.p1" components={FMT} /></p>
        <div className="manual__pricegrid">
          <div className="manual__price is-feature">
            <h4>{t('manual.vendas.precos.pagoT')}</h4>
            <div className="amt"><Trans t={t} i18nKey="manual.vendas.precos.pagoAmt" components={FMT} /></div>
            <ul><li>{t('manual.vendas.precos.pagoLi1')}</li><li>{t('manual.vendas.precos.pagoLi2')}</li><li>{t('manual.vendas.precos.pagoLi3')}</li></ul>
          </div>
          <div className="manual__price">
            <h4>{t('manual.vendas.precos.gratT')}</h4>
            <div className="amt"><Trans t={t} i18nKey="manual.vendas.precos.gratAmt" components={FMT} /></div>
            <ul><li>{t('manual.vendas.precos.gratLi1')}</li><li>{t('manual.vendas.precos.gratLi2')}</li><li>{t('manual.vendas.precos.gratLi3')}</li></ul>
          </div>
          <div className="manual__price">
            <h4>{t('manual.vendas.precos.semT')}</h4>
            <div className="amt"><Trans t={t} i18nKey="manual.vendas.precos.semAmt" components={FMT} /></div>
            <ul><li>{t('manual.vendas.precos.semLi1')}</li><li>{t('manual.vendas.precos.semLi2')}</li><li>{t('manual.vendas.precos.semLi3')}</li></ul>
          </div>
        </div>
        <div className="manual__callout">
          <div className="manual__callout-k">{t('manual.vendas.precos.calloutK')}</div>
          <p><Trans t={t} i18nKey="manual.vendas.precos.calloutP" components={FMT} /></p>
        </div>
      </section>

      <section className="manual__doc" id="v-recursos">
        <h2>{t('manual.vendas.recursos.h2')}</h2>
        <div className="manual__cards">
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c1T')}</h4><p>{t('manual.vendas.recursos.c1P')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c2T')}</h4><p>{t('manual.vendas.recursos.c2P')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c3T')}</h4><p>{t('manual.vendas.recursos.c3P')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c4T')}</h4><p>{t('manual.vendas.recursos.c4P')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c5T')}</h4><p>{t('manual.vendas.recursos.c5P')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c6T')}</h4><p>{t('manual.vendas.recursos.c6P')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c7T')}</h4><p>{t('manual.vendas.recursos.c7P')}</p></div>
          <div className="manual__card"><h4>{t('manual.vendas.recursos.c8T')}</h4><p>{t('manual.vendas.recursos.c8P')}</p></div>
        </div>
      </section>
    </>
  );
};

Manual.propTypes = {
  loggedUsername: PropTypes.string,
  publicMode: PropTypes.bool,
};

export default Manual;
