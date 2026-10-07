import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Accordion, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';

import { listPlatformFaqs, getPlatformSettings } from '@/services/platform';
import Icons from '@/components/Global/Icons';
import { StoreNav, StoreFooter } from '@/components/Storefront/StorefrontChrome';
import '../Storefront/style.scss';

const formatBRL = (cents) =>
  ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

const FEATURES = [
  { icon: 'form-context', key: 'form' },
  { icon: 'credit-card', key: 'payment' },
  { icon: 'chart', key: 'management' },
  { icon: 'checkin', key: 'checkin' },
];

const HERO_CHIPS = ['pix', 'noMonthly', 'readyMinutes'];

const VALUES = [
  { icon: 'couple', key: 'smallChurch' },
  { icon: 'money', key: 'stewardship' },
  { icon: 'checked', key: 'dataCare' },
  { icon: 'clock', key: 'simplicity' },
];

const DIFFERENTIALS = [
  { icon: 'ride', key: 'transport' },
  { icon: 'rooms', key: 'rooms' },
  { icon: 'team', key: 'teams' },
  { icon: 'checkin', key: 'checkin' },
  { icon: 'cart', key: 'packages' },
  { icon: 'calendar', key: 'multievent' },
];

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    document.title = t('site.landing.documentTitle');
  }, [t]);

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
  const essencialFeePercent = settings ? `${settings.essencialFeePercent}%` : '—';
  const essencialFreeEventFee = settings ? formatBRL(settings.essencialFreeEventFeeCents) : '—';
  const essencialFreeEventAnnual = settings ? formatBRL(settings.essencialFreeEventAnnualCents) : '—';

  const feeTiers = settings?.defaultFeeTiers || [];
  const completoHeadline = () => {
    if (!feeTiers.length) return feePercent;
    const percents = feeTiers.map((tier) => tier.percent);
    const min = Math.min(...percents);
    const max = Math.max(...percents);
    return min === max ? `${min}%` : `${min}–${max}%`;
  };
  const feeTierLines = feeTiers.map((tier, index) => {
    const previous = index > 0 ? feeTiers[index - 1].maxCents : null;
    if (tier.maxCents == null) {
      return t('site.landing.plans.feeTierAbove', { percent: tier.percent, amount: formatBRL(previous) });
    }
    if (previous == null) {
      return t('site.landing.plans.feeTierUpTo', { percent: tier.percent, amount: formatBRL(tier.maxCents) });
    }
    return t('site.landing.plans.feeTierBetween', {
      percent: tier.percent,
      from: formatBRL(previous),
      to: formatBRL(tier.maxCents),
    });
  });

  return (
    <div className="storefront">
      <StoreNav onLanding />

      <section className="storefront__hero">
        <Container className="storefront__hero-inner">
          <span className="storefront__eyebrow">{t('site.landing.hero.eyebrow')}</span>
          <h1 className="storefront__hero-title">{t('site.landing.hero.title')}</h1>
          <p className="storefront__hero-subtitle">{t('site.landing.hero.subtitle')}</p>
          <div className="storefront__hero-actions">
            <button type="button" className="storefront__hero-cta" onClick={goToSignup}>
              {t('site.landing.hero.ctaStart')}
              <Icons typeIcon="arrow-right" iconSize={18} fill="#ffffff" />
            </button>
            <a href="#planos" className="storefront__hero-link">
              {t('site.landing.hero.seePrices')}
            </a>
          </div>
          <ul className="storefront__hero-chips">
            {HERO_CHIPS.map((chip) => (
              <li key={chip}>
                <Icons typeIcon="checked" iconSize={16} fill="#ffffff" />
                {t(`site.landing.hero.chips.${chip}`)}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="storefront__body">
        <section className="storefront__features">
          {FEATURES.map((feature) => (
            <div className="storefront__feature" key={feature.key}>
              <span className="storefront__feature-icon">
                <Icons typeIcon={feature.icon} iconSize={26} fill="#007185" />
              </span>
              <h3>{t(`site.landing.features.${feature.key}.title`)}</h3>
              <p>{t(`site.landing.features.${feature.key}.text`)}</p>
            </div>
          ))}
        </section>

        <section className="storefront__differentials">
          <div className="storefront__section-head">
            <span className="storefront__eyebrow storefront__eyebrow--dark">{t('site.landing.differentials.eyebrow')}</span>
            <h2 className="storefront__section-title">{t('site.landing.differentials.title')}</h2>
            <p className="storefront__plans-lede">
              <Trans i18nKey="site.landing.differentials.lede" components={{ b: <b /> }} />
            </p>
          </div>
          <div className="storefront__diffgrid">
            {DIFFERENTIALS.map((item) => (
              <div className="storefront__diff" key={item.key}>
                <span className="storefront__diff-icon">
                  <Icons typeIcon={item.icon} iconSize={24} fill="#007185" />
                </span>
                <div>
                  <h3>{t(`site.landing.differentials.items.${item.key}.title`)}</h3>
                  <p>{t(`site.landing.differentials.items.${item.key}.text`)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="storefront__vs">
            <div className="storefront__vs-card">
              <span className="storefront__vs-tag">{t('site.landing.differentials.vsGoogleTag')}</span>
              <p>{t('site.landing.differentials.vsGoogleText')}</p>
            </div>
            <div className="storefront__vs-card">
              <span className="storefront__vs-tag">{t('site.landing.differentials.vsGenericTag')}</span>
              <p>{t('site.landing.differentials.vsGenericText')}</p>
            </div>
          </div>
        </section>

        <section className="storefront__purpose">
          <div className="storefront__section-head">
            <span className="storefront__eyebrow storefront__eyebrow--dark">{t('site.landing.purpose.eyebrow')}</span>
            <h2 className="storefront__section-title">{t('site.landing.purpose.title')}</h2>
            <p className="storefront__plans-lede">
              <Trans i18nKey="site.landing.purpose.lede" components={{ b: <b /> }} />
            </p>
          </div>
          <div className="storefront__values">
            {VALUES.map((value) => (
              <div className="storefront__value" key={value.key}>
                <span className="storefront__value-icon">
                  <Icons typeIcon={value.icon} iconSize={24} fill="#007185" />
                </span>
                <h3>{t(`site.landing.purpose.values.${value.key}.title`)}</h3>
                <p>{t(`site.landing.purpose.values.${value.key}.text`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="storefront__video">
          <div className="storefront__section-head">
            <span className="storefront__eyebrow storefront__eyebrow--dark">Depoimentos</span>
            <h2 className="storefront__section-title">Quem usa, recomenda</h2>
            <p className="storefront__plans-lede">
              Veja o que igrejas e organizações dizem sobre o Inscriptio.
            </p>
          </div>
          <div className="storefront__video-frame">
            <iframe
              src="https://www.youtube.com/embed/giHDkC0xvRw"
              title="Depoimentos sobre o Inscriptio"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        <section className="storefront__plans" id="planos">
          <div className="storefront__section-head">
            <h2 className="storefront__section-title">{t('site.landing.plans.title')}</h2>
            <p className="storefront__plans-lede">{t('site.landing.plans.lede')}</p>
          </div>
          <Row className="g-4 justify-content-center">
            <Col xs={12} md={6} lg={5}>
              <div className="storefront__plan">
                <span className="storefront__plan-name">{t('site.landing.plans.essencialName')}</span>
                <span className="storefront__plan-tagline">{t('site.landing.plans.essencialTagline')}</span>
                <span className="storefront__plan-price">
                  {essencialFeePercent}
                  <small> {t('site.landing.plans.perPaidRegistration')}</small>
                </span>
                <span className="storefront__plan-blurb">
                  {t('site.landing.plans.freeEventBlurb', {
                    fee: essencialFreeEventFee,
                    annual: essencialFreeEventAnnual,
                  })}
                </span>
                <ul className="storefront__plan-list">
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.essencialFeature1')}
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.essencialFeature2')}
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.essencialFeature3')}
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.essencialFeature4')}
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={12} md={6} lg={5}>
              <div className="storefront__plan storefront__plan--feature">
                <span className="storefront__plan-tag">{t('site.landing.plans.recommended')}</span>
                <span className="storefront__plan-name">{t('site.landing.plans.completoName')}</span>
                <span className="storefront__plan-tagline">{t('site.landing.plans.completoTagline')}</span>
                <span className="storefront__plan-price">
                  {completoHeadline()}
                  <small> {t('site.landing.plans.perPaidRegistration')}</small>
                </span>
                {feeTierLines.length > 0 && (
                  <div className="storefront__plan-tiers">
                    <span className="storefront__plan-tiers-intro">{t('site.landing.plans.feeTiersIntro')}</span>
                    <ul>
                      {feeTierLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <span className="storefront__plan-blurb">
                  {t('site.landing.plans.freeEventBlurb', { fee: freeEventFee, annual: freeEventAnnual })}
                </span>
                <ul className="storefront__plan-list">
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.completoFeature1')}
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.completoFeature2')}
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.completoFeature3')}
                  </li>
                  <li>
                    <Icons typeIcon="checked" iconSize={16} fill="#057c05" /> {t('site.landing.plans.completoFeature4')}
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
          <div className="storefront__plans-footnote d-flex">
            <Icons typeIcon="simple-info" iconSize={50} fill="#7f7878" />

            <div>
              <p className="mb-2">
                <Trans i18nKey="site.landing.plans.footnote" components={{ b: <b /> }} />
              </p>
              <p className="mb-0">
                <Trans i18nKey="site.landing.plans.freeEventFootnote" components={{ b: <b /> }} />
              </p>
            </div>
          </div>
        </section>

        <section className="storefront__cta-band">
          <div className="storefront__cta-band-inner">
            <div>
              <h2>{t('site.landing.ctaBand.title')}</h2>
              <p>{t('site.landing.ctaBand.text')}</p>
            </div>
            <button type="button" className="storefront__hero-cta" onClick={goToSignup}>
              {t('site.landing.ctaBand.button')}
              <Icons typeIcon="arrow-right" iconSize={18} fill="#ffffff" />
            </button>
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="storefront__faqs">
            <h2 className="storefront__section-title">{t('site.landing.faqs.title')}</h2>
            <Accordion className="storefront__faqs-list">
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={String(index)} key={faq.id}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>
                    <div className="storefront__faq-answer" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer || '') }} />
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
