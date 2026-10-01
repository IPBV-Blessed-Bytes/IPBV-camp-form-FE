import { Container } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { StoreNav, StoreFooter } from '@/components/Storefront/StorefrontChrome';
import './style.scss';

const TERMS_VERSION = '2026-09-29';

const Terms = () => {
  const { t } = useTranslation();
  return (
    <div className="storefront terms-page">
      <StoreNav />
      <Container className="terms-page__wrap">
        <h1>{t('site.terms.title')}</h1>
        <p className="terms-page__meta">{t('site.terms.version', { version: TERMS_VERSION })}</p>

        <div className="terms-page__notice">
          <Trans i18nKey="site.terms.notice" components={{ strong: <strong /> }} />
        </div>

        <section>
          <h2>{t('site.terms.s1Title')}</h2>
          <p>{t('site.terms.s1Body')}</p>
        </section>

        <section>
          <h2>{t('site.terms.s2Title')}</h2>
          <p>{t('site.terms.s2Body')}</p>
        </section>

        <section>
          <h2>{t('site.terms.s3Title')}</h2>
          <p>{t('site.terms.s3Body')}</p>
        </section>

        <section>
          <h2>{t('site.terms.s4Title')}</h2>
          <p>{t('site.terms.s4Body')}</p>
        </section>

        <section>
          <h2>{t('site.terms.s5Title')}</h2>
          <p>{t('site.terms.s5Body')}</p>
        </section>

        <section>
          <h2>{t('site.terms.s6Title')}</h2>
          <p>{t('site.terms.s6Body')}</p>
        </section>

        <section>
          <h2>{t('site.terms.s7Title')}</h2>
          <p>{t('site.terms.s7Body')}</p>
        </section>

        <section>
          <h2>{t('site.terms.s8Title')}</h2>
          <p>{t('site.terms.s8Body')}</p>
        </section>
      </Container>
      <StoreFooter />
    </div>
  );
};

export default Terms;
