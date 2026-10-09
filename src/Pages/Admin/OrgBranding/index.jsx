import { useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import {
  getOrgBranding,
  updateOrgBranding,
  uploadOrgLogo,
  deleteOrgLogo,
  orgLogoUrl,
} from '@/services/organizationBranding';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import SpinnerButton from '@/components/Global/SpinnerButton';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const DEFAULT_COLOR = '#007185';
const HEX_PATTERN = /^#([0-9a-fA-F]{6})$/;

const OrgBranding = ({ loggedUsername }) => {
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
      toast.error('Não foi possível carregar a identidade da organização.');
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
      toast.success('Logo atualizado.');
    } catch {
      toast.error('Não foi possível enviar o logo.');
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
      toast.success('Logo removido.');
    } catch {
      toast.error('Não foi possível remover o logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (brandColor && !HEX_PATTERN.test(brandColor)) {
      toast.error('Informe uma cor em formato hexadecimal, ex: #0ea5a0.');
      return;
    }
    setSaving(true);
    try {
      await updateOrgBranding({ description, brandColor });
      setBranding((prev) => ({ ...prev, description, brandColor }));
      toast.success('Identidade salva.');
    } catch {
      toast.error('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading loading />;

  const logoSrc = hasLogo ? `${orgLogoUrl(slug)}?v=${logoVersion || 1}` : '';

  return (
    <div className="org-branding">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Identidade da Organização"
        subtitle="Personalize a página inicial que seus inscritos veem"
        typeIcon="camera"
      />

      <div className="org-branding__body">
        <Row className="g-4">
          <Col xs={12} lg={7}>
            <div className="org-branding__card">
              <h2 className="org-branding__card-title">Logo</h2>
              <p className="org-branding__hint">Aparece no topo da sua página pública. PNG ou JPG, fundo transparente de preferência.</p>

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
                  <SpinnerButton
                    variant="primary"
                    loading={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {hasLogo ? 'Trocar logo' : 'Enviar logo'}
                  </SpinnerButton>
                  {hasLogo && (
                    <Button variant="outline-danger" disabled={uploading} onClick={handleRemoveLogo}>
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="org-branding__card">
              <h2 className="org-branding__card-title">Descrição</h2>
              <p className="org-branding__hint">Uma frase curta que apresenta sua organização aos inscritos.</p>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={280}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: Comunidade cristã na Barra da Tijuca. Inscreva-se nos nossos eventos."
                className="org-branding__input"
              />
              <span className="org-branding__counter">{description.length}/280</span>
            </div>

            <div className="org-branding__card">
              <h2 className="org-branding__card-title">Cor da marca</h2>
              <p className="org-branding__hint">Usada nos destaques da página pública.</p>
              <div className="org-branding__color-row">
                <input
                  type="color"
                  value={accent}
                  onChange={(event) => setBrandColor(event.target.value)}
                  className="org-branding__color-swatch"
                  aria-label="Cor da marca"
                />
                <Form.Control
                  value={brandColor}
                  onChange={(event) => setBrandColor(event.target.value)}
                  placeholder="#0ea5a0"
                  className="org-branding__input org-branding__color-hex"
                  isInvalid={!!brandColor && !HEX_PATTERN.test(brandColor)}
                />
              </div>
            </div>

            <div className="org-branding__save">
              <SpinnerButton variant="success" loading={saving} onClick={handleSave}>
                Salvar alterações
              </SpinnerButton>
              {slug && (
                <a className="org-branding__link" href={`/o/${slug}`} target="_blank" rel="noreferrer">
                  Ver página pública
                  <Icons typeIcon="arrow-right" iconSize={16} fill={accent} />
                </a>
              )}
            </div>
          </Col>

          <Col xs={12} lg={5}>
            <div className="org-branding__preview" style={{ '--brand': accent }}>
              <span className="org-branding__preview-label">Prévia</span>
              <div className="org-branding__preview-hero">
                <div className="org-branding__preview-logo">
                  {hasLogo ? (
                    <img src={logoSrc} alt={name} />
                  ) : (
                    <span>{(name || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="org-branding__preview-eyebrow">Inscrições abertas</span>
                <h3 className="org-branding__preview-name">{name || 'Sua Organização'}</h3>
                <p className="org-branding__preview-desc">
                  {description || 'Selecione um evento abaixo para iniciar sua inscrição'}
                </p>
                <span className="org-branding__preview-card">Evento exemplo</span>
              </div>
            </div>
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
