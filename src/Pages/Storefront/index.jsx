import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Trans, useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';

import { platformSignup, platformSignupGoogle, getPlatformSettings } from '@/services/platform';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import GoogleSignInButton from '@/components/Global/GoogleSignInButton';
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
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [churchName, setChurchName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    getPlatformSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!churchName.trim()) {
      toast.error(t('site.storefront.errors.churchRequired'));
      return;
    }
    if (!adminName.trim()) {
      toast.error(t('site.storefront.errors.nameRequired'));
      return;
    }
    if (!adminEmail.trim()) {
      toast.error(t('site.storefront.errors.emailRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
      toast.error(t('site.storefront.errors.emailInvalid'));
      return;
    }
    if (!slug.trim()) {
      toast.error(t('site.storefront.errors.slugRequired'));
      return;
    }
    if (adminPassword.length < 6) {
      toast.error(t('site.storefront.errors.passwordTooShort'));
      return;
    }
    if (!termsAccepted) {
      toast.error(t('site.storefront.errors.termsRequired'));
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
        termsAccepted: true,
      });
      setResult({ ...data, churchName: churchName.trim() });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('site.storefront.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    if (!churchName.trim()) {
      toast.error(t('site.storefront.errors.googleChurchRequired'));
      return;
    }
    if (!slug.trim()) {
      toast.error(t('site.storefront.errors.googleSlugRequired'));
      return;
    }
    if (!termsAccepted) {
      toast.error(t('site.storefront.errors.googleTermsRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await platformSignupGoogle({
        churchName: churchName.trim(),
        slug: slug.trim() || undefined,
        credential,
        plan: 'free',
        termsAccepted: true,
      });
      setResult({ ...data, churchName: churchName.trim(), google: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('site.storefront.errors.googleCreateFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const confirmed = result.emailVerified || result.google;
    return (
      <div className="storefront">
        <StoreNav />
        <Container className="storefront__success-wrap">
          <div className="storefront__success">
            <span className="storefront__success-badge">
              <Icons typeIcon={confirmed ? 'checked' : 'email'} iconSize={40} fill={confirmed ? '#057c05' : '#0a5f86'} />
            </span>
            <h2>{t('site.storefront.success.title', { church: result.churchName })}</h2>
            {confirmed ? (
              <>
                <p>
                  <Trans
                    i18nKey="site.storefront.success.confirmedIntro"
                    components={{ strong: <strong /> }}
                    values={{ email: adminEmail.trim() || t('site.storefront.success.yourGoogleAccount') }}
                  />
                </p>
                <div className="storefront__success-links">
                  <Button variant="teal-blue" size="lg" className="fw-bold" onClick={() => navigate('/admin')}>
                    {t('site.storefront.success.accessPanel')}
                  </Button>
                  {result.eventPath && (
                    <a className="btn btn-outline-teal-blue btn-lg" href={result.eventPath}>
                      {t('site.storefront.success.viewPublicPage', { path: result.eventPath })}
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p>
                <Trans
                  i18nKey="site.storefront.success.unconfirmed"
                  components={{ strong: <strong /> }}
                  values={{ email: adminEmail.trim() }}
                />
              </p>
            )}
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
          {t('site.storefront.back')}
        </button>

        <div className="storefront__signup-card">
          <div className="storefront__signup-head">
            <h1 className="storefront__section-title">{t('site.storefront.formTitle')}</h1>
            <p className="storefront__signup-lede">{t('site.storefront.formLede')}</p>
          </div>

          <Form onSubmit={handleSubmit} className="storefront__form">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">{t('site.storefront.labelChurch')}</Form.Label>
                  <Form.Control
                    value={churchName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setChurchName(value);
                      setSlug((prev) => (prev && prev !== slugify(churchName) ? prev : slugify(value)));
                    }}
                    placeholder={t('site.storefront.placeholderChurch')}
                    size="lg"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">{t('site.storefront.labelSlug')}</Form.Label>
                  <Form.Control
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder={t('site.storefront.placeholderSlug')}
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    {t('site.storefront.slugHint', { slug: slug || t('site.storefront.slugFallback') })}
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">{t('site.storefront.labelName')}</Form.Label>
                  <Form.Control
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder={t('site.storefront.placeholderName')}
                    size="lg"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">{t('site.storefront.labelEmail')}</Form.Label>
                  <Form.Control
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder={t('site.storefront.placeholderEmail')}
                    size="lg"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">{t('site.storefront.labelPassword')}</Form.Label>
                  <div className="storefront__password">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder={t('site.storefront.placeholderPassword')}
                      size="lg"
                      className="storefront__password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? t('site.storefront.hidePassword') : t('site.storefront.showPassword')}
                      className="storefront__password-toggle"
                    >
                      <Icons typeIcon={showPassword ? 'visible-password' : 'hidden-password'} iconSize={22} />
                    </button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="storefront__terms mb-3">
              <Form.Check
                type="checkbox"
                id="storefront-terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                label={
                  <Trans
                    i18nKey="site.storefront.termsLabel"
                    components={{ 1: <a href="/termos" target="_blank" rel="noopener noreferrer" /> }}
                  />
                }
              />
            </Form.Group>

            <Button
              type="submit"
              variant="teal-blue"
              size="lg"
              className="storefront__submit fw-bold"
              disabled={loading}
            >
              {t('site.storefront.submit')}
            </Button>
            <p className="storefront__form-reassurance">
              <Icons typeIcon="checked" iconSize={15} fill="#057c05" />{' '}
              {t('site.storefront.reassurance', {
                feeSuffix: settings
                  ? t('site.storefront.reassuranceFee', { percent: settings.defaultFeePercent })
                  : '',
              })}
            </p>

            <div className="storefront__divider">
              <span>{t('site.storefront.or')}</span>
            </div>
            <div className="storefront__google">
              <GoogleSignInButton onCredential={handleGoogle} />
              <p className="storefront__google-hint">{t('site.storefront.googleHint')}</p>
            </div>
          </Form>
        </div>
      </Container>

      <StoreFooter />
      <Loading loading={loading} />
    </div>
  );
};

export default Storefront;
