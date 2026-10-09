import { useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import {
  getOrgBranding,
  updateOrgBranding,
  uploadOrgLogo,
  deleteOrgLogo,
  orgLogoUrl,
} from '@/services/organizationBranding';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import FormSection from '@/components/Admin/FormSection';
import SpinnerButton from '@/components/Global/SpinnerButton';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const DEFAULT_COLOR = '#007185';
const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const expandHex = (hex) => {
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
};

const OrgBranding = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [branding, setBranding] = useState(null);
  const [description, setDescription] = useState('');
  const [brandColor, setBrandColor] = useState(DEFAULT_COLOR);
  const [logoVersion, setLogoVersion] = useState(0);

  const load = async () => {
    try {
      const data = await getOrgBranding();
      setBranding(data);
      setDescription(data?.description || '');
      setBrandColor(data?.brandColor || DEFAULT_COLOR);
    } catch {
      toast.error(t('admin.orgBranding.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const slug = branding?.slug;
  const name = branding?.name || '';
  const hasLogo = (branding?.hasLogo && logoVersion >= 0) || logoVersion > 0;
  const accent = HEX_PATTERN.test(brandColor) ? brandColor : DEFAULT_COLOR;

  const handleLogoFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await uploadOrgLogo(file);
      setBranding((prev) => ({ ...prev, hasLogo: true }));
      setLogoVersion(Date.now());
      toast.success(t('admin.orgBranding.logoSaved'));
    } catch {
      toast.error(t('admin.orgBranding.logoError'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setUploading(true);
    try {
      await deleteOrgLogo();
      setBranding((prev) => ({ ...prev, hasLogo: false }));
      setLogoVersion(0);
      toast.success(t('admin.orgBranding.logoRemoved'));
    } catch {
      toast.error(t('admin.orgBranding.logoRemoveError'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (brandColor && !HEX_PATTERN.test(brandColor)) {
      toast.error(t('admin.orgBranding.colorInvalid'));
      return;
    }
    setSaving(true);
    try {
      await updateOrgBranding({ description, brandColor });
      setBranding((prev) => ({ ...prev, description, brandColor }));
      toast.success(t('admin.orgBranding.saved'));
    } catch {
      toast.error(t('admin.orgBranding.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading loading />;

  const logoSrc = hasLogo ? `${orgLogoUrl(slug)}?v=${logoVersion || 1}` : '';

  return (
    <div className="admin-subpage admin-subpage--settings">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.orgBranding.title')}
        subtitle={t('admin.orgBranding.subtitle')}
        typeIcon="camera"
      />

      <div className="admin-subpage__content org-branding">
        <Row className="g-4">
          <Col xs={12} lg={7}>
            <FormSection
              title={t('admin.orgBranding.logoTitle')}
              description={t('admin.orgBranding.logoDesc')}
            >
              <div className="org-branding__logo-row">
                <div className="org-branding__logo-box" style={{ '--brand': accent }}>
                  {hasLogo ? (
                    <img src={logoSrc} alt={name} className="org-branding__logo-img" />
                  ) : (
                    <span className="org-branding__logo-monogram">{(name || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="org-branding__logo-actions">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogoFile} />
                  <SpinnerButton variant="outline-teal-blue" loading={uploading} onClick={() => fileRef.current?.click()}>
                    {hasLogo ? t('admin.orgBranding.changeLogo') : t('admin.orgBranding.uploadLogo')}
                  </SpinnerButton>
                  {hasLogo && (
                    <Button variant="outline-danger" disabled={uploading} onClick={handleRemoveLogo}>
                      {t('admin.orgBranding.remove')}
                    </Button>
                  )}
                </div>
              </div>
            </FormSection>

            <FormSection title={t('admin.orgBranding.descriptionTitle')} description={t('admin.orgBranding.descriptionDesc')}>
              <Form.Group className="mt-2">
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength={280}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t('admin.orgBranding.descriptionPlaceholder')}
                />
                <span className="org-branding__counter">{description.length}/280</span>
              </Form.Group>
            </FormSection>

            <FormSection title={t('admin.orgBranding.colorTitle')} description={t('admin.orgBranding.colorDesc')}>
              <div className="org-branding__color-row">
                <input
                  type="color"
                  value={expandHex(accent)}
                  onChange={(event) => setBrandColor(event.target.value)}
                  className="org-branding__color-swatch"
                  aria-label={t('admin.orgBranding.colorTitle')}
                />
                <Form.Control
                  value={brandColor}
                  onChange={(event) => setBrandColor(event.target.value)}
                  placeholder={t('admin.orgBranding.colorPlaceholder')}
                  className="org-branding__color-hex"
                  isInvalid={!!brandColor && !HEX_PATTERN.test(brandColor)}
                />
              </div>
            </FormSection>

            <div className="org-branding__save">
              {slug && (
                <a className="org-branding__link" href={`/o/${slug}`} target="_blank" rel="noreferrer">
                  {t('admin.orgBranding.viewPublicPage')}
                  <Icons typeIcon="arrow-right" iconSize={16} fill={accent} />
                </a>
              )}

              <SpinnerButton variant="teal-blue" loading={saving} onClick={handleSave}>
                {t('admin.orgBranding.save')}
              </SpinnerButton>
            </div>
          </Col>

          <Col xs={12} lg={5}>
            <FormSection title={t('admin.orgBranding.preview')}>
              <div className="org-branding__preview" style={{ '--brand': accent }}>
                <div className="org-branding__preview-hero">
                  <div className="org-branding__preview-logo">
                    {hasLogo ? <img src={logoSrc} alt={name} /> : <span>{(name || '?').charAt(0).toUpperCase()}</span>}
                  </div>
                  <span className="org-branding__preview-eyebrow">{t('admin.orgBranding.previewEyebrow')}</span>
                  <h3 className="org-branding__preview-name">{name || t('admin.orgBranding.orgFallback')}</h3>
                  <p className="org-branding__preview-desc">
                    {description || t('admin.orgBranding.descFallback')}
                  </p>
                  <span className="org-branding__preview-card">{t('admin.orgBranding.eventExample')}</span>
                </div>
              </div>
            </FormSection>
          </Col>
        </Row>
      </div>
    </div>
  );
};

OrgBranding.propTypes = {
  loggedUsername: PropTypes.string,
};

export default OrgBranding;
