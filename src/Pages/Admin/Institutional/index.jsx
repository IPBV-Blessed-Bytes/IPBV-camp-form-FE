import { useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import {
  getInstitutionalContent,
  updateInstitutionalContent,
  uploadInstitutionalImage,
  institutionalImageUrl,
} from '@/services/institutional';
import {
  DEFAULT_INSTITUTIONAL_CONTENT,
  DEFAULT_INSTITUTIONAL_COLOR,
  HIGHLIGHT_ICON_OPTIONS,
  INSTITUTIONAL_TEMPLATES,
} from '@/config/institutionalContent';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const clone = (value) => JSON.parse(JSON.stringify(value));

const SECTIONS = [
  'modelo',
  'visitas',
  'topo',
  'numeros',
  'sobre',
  'programacao',
  'palestrantes',
  'equipe',
  'galeria',
  'avisos',
  'parceiros',
];

const scrollToCard = (index) => {
  const cards = document.querySelectorAll('.inst-admin__card');
  if (cards[index]) cards[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const ImageField = ({ imageId, onChange, label, shape }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const data = await uploadInstitutionalImage(file);
      onChange(data.id);
    } catch {
      toast.error(t('admin.institutional.uploadError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inst-admin-image">
      <div className={`inst-admin-image__preview inst-admin-image__preview--${shape || 'wide'}`}>
        {imageId ? (
          <img src={institutionalImageUrl(imageId)} alt={label || t('admin.institutional.imageAlt')} />
        ) : (
          <span className="inst-admin-image__empty">
            <Icons typeIcon="camera" iconSize={22} fill="#98a2b3" />
          </span>
        )}
      </div>
      <div className="inst-admin-image__actions">
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
        <SpinnerButton variant="outline-teal-blue" size="sm" loading={busy} onClick={() => inputRef.current?.click()}>
          {imageId ? t('admin.institutional.changeImage') : t('admin.institutional.sendImage')}
        </SpinnerButton>
        {imageId && (
          <Button variant="outline-danger" size="sm" onClick={() => onChange(null)}>
            {t('admin.institutional.remove')}
          </Button>
        )}
      </div>
    </div>
  );
};

ImageField.propTypes = {
  imageId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  shape: PropTypes.string,
};

const AdminInstitutional = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  scrollUp();

  useEffect(() => {
    getInstitutionalContent()
      .then((data) => setForm(data && Object.keys(data).length ? data : clone(DEFAULT_INSTITUTIONAL_CONTENT)))
      .catch(() => setForm(clone(DEFAULT_INSTITUTIONAL_CONTENT)))
      .finally(() => setLoading(false));
  }, []);

  const patch = (mutator) =>
    setForm((prev) => {
      const next = clone(prev);
      mutator(next);
      return next;
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateInstitutionalContent(form);
      registerLog('Atualizou a área institucional', loggedUsername);
      toast.success(t('admin.institutional.saveSuccess'));
    } catch {
      toast.error(t('admin.institutional.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <Loading loading />;
  }

  const hero = form.hero || {};
  const about = form.about || {};
  const schedule = form.schedule || {};
  const team = form.team || {};
  const speakers = form.speakers || {};
  const gallery = form.gallery || {};
  const notices = form.notices || {};
  const partners = form.partners || {};

  return (
    <div className="admin-subpage inst-admin">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.institutional.title')}
        subtitle={t('admin.institutional.subtitle')}
        typeIcon="camp"
      />

      <div className="admin-subpage__content">
        <div className="inst-admin__toolbar">
          <nav className="inst-admin__nav">
            {SECTIONS.map((key, i) => (
              <button type="button" key={key} onClick={() => scrollToCard(i)}>
                {t(`admin.institutional.nav.${key}`)}
              </button>
            ))}
          </nav>
          <Button variant="teal-blue" size="lg" onClick={handleSave} disabled={saving} style={{ position: 'relative' }}>
            <span style={{ visibility: saving ? 'hidden' : 'visible' }}>{t('admin.institutional.saveChanges')}</span>
            {saving && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                style={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-0.5rem', marginLeft: '-0.5rem' }}
              />
            )}
          </Button>
        </div>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.templateColorTitle')}</h5>
          <Form.Label><b>{t('admin.institutional.colorLabel')}</b></Form.Label>
          <div className="inst-admin__color-row">
            <Form.Control
              type="color"
              value={form.color || DEFAULT_INSTITUTIONAL_COLOR}
              onChange={(e) => patch((n) => { n.color = e.target.value; })}
              title={t('admin.institutional.colorTitle')}
            />
            <Form.Control
              value={form.color || ''}
              placeholder={DEFAULT_INSTITUTIONAL_COLOR}
              onChange={(e) => patch((n) => { n.color = e.target.value; })}
            />
          </div>
          <Form.Text className="text-muted-italic d-block mb-3">
            {t('admin.institutional.colorHelp')}
          </Form.Text>
          <Form.Label><b>{t('admin.institutional.templateLabel')}</b></Form.Label>
          <div className="inst-admin__templates">
            {INSTITUTIONAL_TEMPLATES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`inst-admin__template${(form.template || 'template-1') === t.id ? ' is-selected' : ''}`}
                onClick={() => patch((n) => { n.template = t.id; })}
              >
                <strong>{t.label}</strong>
                <span>{t.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.visitsTitle')}</h5>
          <Form.Check
            type="switch"
            id="inst-show-visits"
            label={t('admin.institutional.visitsSwitch')}
            checked={!!form.showVisits}
            onChange={(e) => patch((n) => { n.showVisits = e.target.checked; })}
          />
        </section>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.heroTitle')}</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.brandLabel')}</b></Form.Label>
                <Form.Control value={form.brand || ''} onChange={(e) => patch((n) => { n.brand = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.taglineLabel')}</b></Form.Label>
                <Form.Control value={hero.tagline || ''} onChange={(e) => patch((n) => { n.hero.tagline = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.institutional.mainTitleLabel')}</b></Form.Label>
            <Form.Control as="textarea" rows={2} value={hero.title || ''} onChange={(e) => patch((n) => { n.hero.title = e.target.value; })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.institutional.subtitleLabel')}</b></Form.Label>
            <Form.Control as="textarea" rows={2} value={hero.subtitle || ''} onChange={(e) => patch((n) => { n.hero.subtitle = e.target.value; })} />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.dateLabel')}</b></Form.Label>
                <Form.Control value={hero.dateLabel || ''} onChange={(e) => patch((n) => { n.hero.dateLabel = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.locationLabel')}</b></Form.Label>
                <Form.Control value={hero.locationLabel || ''} onChange={(e) => patch((n) => { n.hero.locationLabel = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Label><b>{t('admin.institutional.heroBgLabel')}</b></Form.Label>
          <ImageField
            imageId={hero.backgroundImageId}
            shape="wide"
            label={t('admin.institutional.heroBgImageAlt')}
            onChange={(id) => patch((n) => { n.hero.backgroundImageId = id; })}
          />
        </section>

        <section className="inst-admin__card">
          <div className="inst-admin__card-head">
            <h5>{t('admin.institutional.statsTitle')}</h5>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.stats ||= []).push({ value: '', label: '' }); })}>
              {t('admin.institutional.addNumber')}
            </Button>
          </div>
          {(form.stats || []).map((s, i) => (
            <Row key={i} className="inst-admin__row align-items-end">
              <Col md={4}>
                <Form.Label><b>{t('admin.institutional.valueLabel')}</b></Form.Label>
                <Form.Control value={s.value || ''} onChange={(e) => patch((n) => { n.stats[i].value = e.target.value; })} />
              </Col>
              <Col md={7}>
                <Form.Label><b>{t('admin.institutional.descriptionLabel')}</b></Form.Label>
                <Form.Control value={s.label || ''} onChange={(e) => patch((n) => { n.stats[i].label = e.target.value; })} />
              </Col>
              <Col md={1} className="text-end">
                <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.stats.splice(i, 1); })} />
              </Col>
            </Row>
          ))}
        </section>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.aboutTitle')}</h5>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.institutional.titleLabel')}</b></Form.Label>
            <Form.Control value={about.title || ''} onChange={(e) => patch((n) => { n.about.title = e.target.value; })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.institutional.textLabel')}</b></Form.Label>
            <Form.Control as="textarea" rows={4} value={about.text || ''} onChange={(e) => patch((n) => { n.about.text = e.target.value; })} />
          </Form.Group>
          <div className="inst-admin__card-head">
            <h6>{t('admin.institutional.highlightsTitle')}</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.about.highlights ||= []).push({ icon: 'info', title: '', text: '' }); })}>
              {t('admin.institutional.addHighlight')}
            </Button>
          </div>
          {(about.highlights || []).map((h, i) => (
            <Row key={i} className="inst-admin__row align-items-end">
              <Col md={3}>
                <Form.Label><b>{t('admin.institutional.iconLabel')}</b></Form.Label>
                <Form.Select value={h.icon || 'info'} onChange={(e) => patch((n) => { n.about.highlights[i].icon = e.target.value; })}>
                  {HIGHLIGHT_ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label><b>{t('admin.institutional.titleLabel')}</b></Form.Label>
                <Form.Control value={h.title || ''} onChange={(e) => patch((n) => { n.about.highlights[i].title = e.target.value; })} />
              </Col>
              <Col md={5}>
                <Form.Label><b>{t('admin.institutional.textLabel')}</b></Form.Label>
                <Form.Control value={h.text || ''} onChange={(e) => patch((n) => { n.about.highlights[i].text = e.target.value; })} />
              </Col>
              <Col md={1} className="text-end">
                <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.about.highlights.splice(i, 1); })} />
              </Col>
            </Row>
          ))}
        </section>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.scheduleTitle')}</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.titleLabel')}</b></Form.Label>
                <Form.Control value={schedule.title || ''} onChange={(e) => patch((n) => { n.schedule.title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.subtitleLabel')}</b></Form.Label>
                <Form.Control value={schedule.subtitle || ''} onChange={(e) => patch((n) => { n.schedule.subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__card-head">
            <h6>{t('admin.institutional.daysTitle')}</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.schedule.days ||= []).push({ day: '', items: [] }); })}>
              {t('admin.institutional.addDay')}
            </Button>
          </div>
          {(schedule.days || []).map((d, di) => (
            <div key={di} className="inst-admin__subcard">
              <Row className="inst-admin__row align-items-end">
                <Col md={10}>
                  <Form.Label><b>{t('admin.institutional.dayLabel')}</b></Form.Label>
                  <Form.Control value={d.day || ''} onChange={(e) => patch((n) => { n.schedule.days[di].day = e.target.value; })} />
                </Col>
                <Col md={2} className="text-end">
                  <ActionButton action="delete" title={t('admin.institutional.removeDay')} onClick={() => patch((n) => { n.schedule.days.splice(di, 1); })} />
                </Col>
              </Row>
              {(d.items || []).map((it, ii) => (
                <Row key={ii} className="inst-admin__row align-items-end">
                  <Col md={3}>
                    <Form.Label><b>{t('admin.institutional.timeLabel')}</b></Form.Label>
                    <Form.Control value={it.time || ''} onChange={(e) => patch((n) => { n.schedule.days[di].items[ii].time = e.target.value; })} />
                  </Col>
                  <Col md={8}>
                    <Form.Label><b>{t('admin.institutional.activityLabel')}</b></Form.Label>
                    <Form.Control value={it.title || ''} onChange={(e) => patch((n) => { n.schedule.days[di].items[ii].title = e.target.value; })} />
                  </Col>
                  <Col md={1} className="text-end">
                    <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.schedule.days[di].items.splice(ii, 1); })} />
                  </Col>
                </Row>
              ))}
              <Button variant="link" size="sm" className="p-0" onClick={() => patch((n) => { (n.schedule.days[di].items ||= []).push({ time: '', title: '' }); })}>
                {t('admin.institutional.addItem')}
              </Button>
            </div>
          ))}
        </section>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.speakersTitle')}</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.titleLabel')}</b></Form.Label>
                <Form.Control value={speakers.title || ''} onChange={(e) => patch((n) => { (n.speakers ||= {}).title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.subtitleLabel')}</b></Form.Label>
                <Form.Control value={speakers.subtitle || ''} onChange={(e) => patch((n) => { (n.speakers ||= {}).subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__card-head">
            <h6>{t('admin.institutional.speakersMembersTitle')}</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { ((n.speakers ||= {}).members ||= []).push({ name: '', role: '', imageId: null }); })}>
              {t('admin.institutional.addSpeaker')}
            </Button>
          </div>
          <div className="inst-admin__grid">
            {(speakers.members || []).map((m, i) => (
              <div key={i} className="inst-admin__subcard">
                <div className="d-flex justify-content-end">
                  <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.speakers.members.splice(i, 1); })} />
                </div>
                <ImageField
                  imageId={m.imageId}
                  shape="avatar"
                  label={m.name}
                  onChange={(id) => patch((n) => { n.speakers.members[i].imageId = id; })}
                />
                <Form.Label className="mt-2">{t('admin.institutional.nameLabel')}</Form.Label>
                <Form.Control value={m.name || ''} onChange={(e) => patch((n) => { n.speakers.members[i].name = e.target.value; })} />
                <Form.Label className="mt-2">{t('admin.institutional.themeLabel')}</Form.Label>
                <Form.Control value={m.role || ''} onChange={(e) => patch((n) => { n.speakers.members[i].role = e.target.value; })} />
              </div>
            ))}
          </div>
        </section>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.teamTitle')}</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.titleLabel')}</b></Form.Label>
                <Form.Control value={team.title || ''} onChange={(e) => patch((n) => { n.team.title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.subtitleLabel')}</b></Form.Label>
                <Form.Control value={team.subtitle || ''} onChange={(e) => patch((n) => { n.team.subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__card-head">
            <h6>{t('admin.institutional.membersTitle')}</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.team.members ||= []).push({ name: '', role: '', imageId: null }); })}>
              {t('admin.institutional.addMember')}
            </Button>
          </div>
          <div className="inst-admin__grid">
            {(team.members || []).map((m, i) => (
              <div key={i} className="inst-admin__subcard">
                <div className="d-flex justify-content-end">
                  <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.team.members.splice(i, 1); })} />
                </div>
                <ImageField
                  imageId={m.imageId}
                  shape="avatar"
                  label={m.name}
                  onChange={(id) => patch((n) => { n.team.members[i].imageId = id; })}
                />
                <Form.Label className="mt-2">{t('admin.institutional.nameLabel')}</Form.Label>
                <Form.Control value={m.name || ''} onChange={(e) => patch((n) => { n.team.members[i].name = e.target.value; })} />
                <Form.Label className="mt-2">{t('admin.institutional.roleLabel')}</Form.Label>
                <Form.Control value={m.role || ''} onChange={(e) => patch((n) => { n.team.members[i].role = e.target.value; })} />
              </div>
            ))}
          </div>
        </section>

        <section className="inst-admin__card">
          <h5>{t('admin.institutional.galleryTitle')}</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.titleLabel')}</b></Form.Label>
                <Form.Control value={gallery.title || ''} onChange={(e) => patch((n) => { n.gallery.title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.subtitleLabel')}</b></Form.Label>
                <Form.Control value={gallery.subtitle || ''} onChange={(e) => patch((n) => { n.gallery.subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__card-head">
            <h6>{t('admin.institutional.photosTitle')}</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.gallery.photos ||= []).push({ imageId: null, label: '', images: [] }); })}>
              {t('admin.institutional.addPhoto')}
            </Button>
          </div>
          <div className="inst-admin__grid">
            {(gallery.photos || []).map((p, i) => (
              <div key={i} className="inst-admin__subcard">
                <div className="d-flex justify-content-end">
                  <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.gallery.photos.splice(i, 1); })} />
                </div>
                <Form.Label>{t('admin.institutional.coverLabel')}</Form.Label>
                <ImageField
                  imageId={p.imageId}
                  shape="wide"
                  label={p.label}
                  onChange={(id) => patch((n) => { n.gallery.photos[i].imageId = id; })}
                />
                <Form.Label className="mt-2">{t('admin.institutional.captionLabel')}</Form.Label>
                <Form.Control value={p.label || ''} onChange={(e) => patch((n) => { n.gallery.photos[i].label = e.target.value; })} />
                <Form.Label className="mt-3">{t('admin.institutional.albumLabel')}</Form.Label>
                {(p.images || []).map((imgId, ii) => (
                  <div key={ii} className="inst-admin__album-item">
                    <div className="d-flex justify-content-end">
                      <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.gallery.photos[i].images.splice(ii, 1); })} />
                    </div>
                    <ImageField
                      imageId={imgId}
                      shape="wide"
                      label={p.label}
                      onChange={(id) => patch((n) => { if (id) n.gallery.photos[i].images[ii] = id; else n.gallery.photos[i].images.splice(ii, 1); })}
                    />
                  </div>
                ))}
                <div className="inst-admin__album-item">
                  <ImageField
                    imageId={null}
                    shape="wide"
                    label={p.label}
                    onChange={(id) => patch((n) => { if (id) (n.gallery.photos[i].images ||= []).push(id); })}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="inst-admin__card">
          <div className="inst-admin__card-head">
            <h5>{t('admin.institutional.noticesTitle')}</h5>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.notices.items ||= []).push({ title: '', text: '' }); })}>
              {t('admin.institutional.addNotice')}
            </Button>
          </div>
          <Form.Group className="mb-3">
            <Form.Label><b>{t('admin.institutional.sectionTitleLabel')}</b></Form.Label>
            <Form.Control value={notices.title || ''} onChange={(e) => patch((n) => { n.notices.title = e.target.value; })} />
          </Form.Group>
          {(notices.items || []).map((it, i) => (
            <Row key={i} className="inst-admin__row align-items-end">
              <Col md={4}>
                <Form.Label><b>{t('admin.institutional.titleLabel')}</b></Form.Label>
                <Form.Control value={it.title || ''} onChange={(e) => patch((n) => { n.notices.items[i].title = e.target.value; })} />
              </Col>
              <Col md={7}>
                <Form.Label><b>{t('admin.institutional.textLabel')}</b></Form.Label>
                <Form.Control value={it.text || ''} onChange={(e) => patch((n) => { n.notices.items[i].text = e.target.value; })} />
              </Col>
              <Col md={1} className="text-end">
                <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.notices.items.splice(i, 1); })} />
              </Col>
            </Row>
          ))}
        </section>

        <section className="inst-admin__card">
          <div className="inst-admin__card-head">
            <h5>{t('admin.institutional.partnersTitle')}</h5>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.partners ||= {}).logos ||= []; n.partners.logos.push({ imageId: null, name: '' }); })}>
              {t('admin.institutional.addPartner')}
            </Button>
          </div>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.sectionTitleLabel')}</b></Form.Label>
                <Form.Control value={partners.title || ''} onChange={(e) => patch((n) => { (n.partners ||= {}).title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>{t('admin.institutional.subtitleOptionalLabel')}</b></Form.Label>
                <Form.Control value={partners.subtitle || ''} onChange={(e) => patch((n) => { (n.partners ||= {}).subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__grid">
            {(partners.logos || []).map((l, i) => (
              <div key={i} className="inst-admin__subcard">
                <div className="d-flex justify-content-end">
                  <ActionButton action="delete" title={t('admin.institutional.remove')} onClick={() => patch((n) => { n.partners.logos.splice(i, 1); })} />
                </div>
                <ImageField
                  imageId={l.imageId}
                  shape="wide"
                  label={l.name}
                  onChange={(id) => patch((n) => { n.partners.logos[i].imageId = id; })}
                />
                <Form.Label className="mt-2">{t('admin.institutional.nameOptionalLabel')}</Form.Label>
                <Form.Control value={l.name || ''} onChange={(e) => patch((n) => { n.partners.logos[i].name = e.target.value; })} />
              </div>
            ))}
          </div>
        </section>

        <div className="inst-admin__toolbar inst-admin__toolbar--bottom">
          <Button variant="teal-blue" size="lg" onClick={handleSave} disabled={saving} style={{ position: 'relative' }}>
            <span style={{ visibility: saving ? 'hidden' : 'visible' }}>{t('admin.institutional.saveChanges')}</span>
            {saving && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                style={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-0.5rem', marginLeft: '-0.5rem' }}
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

AdminInstitutional.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminInstitutional;
