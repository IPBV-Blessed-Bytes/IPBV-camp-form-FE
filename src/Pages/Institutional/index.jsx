import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import Footer from '@/components/Global/Footer';
import CustomModal from '@/components/Global/CustomModal';
import { scrollTop } from '@/hooks/useScrollUp';
import { useFormState } from '@/contexts/FormStateContext';
import { useEventBranding } from '@/contexts/EventBrandingContext';
import { getInstitutionalContent, institutionalImageUrl, registerInstitutionalVisit } from '@/services/institutional';
import { DEFAULT_INSTITUTIONAL_CONTENT, GALLERY_TONES, INSTITUTIONAL_NAV } from '@/config/institutionalContent';
import { eventPath } from '@/config/eventScope';
import './style.scss';

const Institutional = () => {
  const navigate = useNavigate();
  const { handleAdminClick } = useFormState();
  const { name: eventName, mapQuery } = useEventBranding();
  const [scrolled, setScrolled] = useState(false);
  const [content, setContent] = useState(null);
  const [visits, setVisits] = useState(null);
  const [galleryModal, setGalleryModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const goToForm = () => {
    navigate(eventPath('/inscricao'));
    scrollTop();
  };
  const goToAccount = () => {
    navigate('/minha-conta');
    scrollTop();
  };

  useEffect(() => {
    getInstitutionalContent()
      .then((data) => setContent(data && Object.keys(data).length ? data : DEFAULT_INSTITUTIONAL_CONTENT))
      .catch(() => setContent(DEFAULT_INSTITUTIONAL_CONTENT));
  }, []);

  useEffect(() => {
    registerInstitutionalVisit()
      .then(setVisits)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!content) {
    return <Loading loading />;
  }

  const brand = content.brand || eventName || 'Inscrições';
  const hero = content.hero || {};
  const stats = content.stats || [];
  const about = content.about || {};
  const highlights = about.highlights || [];
  const schedule = content.schedule || {};
  const days = schedule.days || [];
  const team = content.team || {};
  const members = (team.members || []).filter(
    (m) => m && ((m.name && m.name.trim()) || (m.role && m.role.trim()) || m.imageId),
  );
  const gallery = content.gallery || {};
  const photos = (gallery.photos || []).filter((p) => p && (p.imageId || (p.label && p.label.trim())));
  const notices = content.notices || {};
  const noticeItems = notices.items || [];
  const partners = content.partners || {};
  const partnerLogos = (partners.logos || []).filter((l) => l && l.imageId);

  const heroStyle = hero.backgroundImageId
    ? { backgroundImage: `url(${institutionalImageUrl(hero.backgroundImageId)})` }
    : undefined;

  const sectionVisible = {
    sobre: !!(about.title || about.text || highlights.length > 0),
    programacao: true,
    equipe: members.length > 0,
    galeria: photos.length > 0,
    avisos: noticeItems.length > 0,
    parceiros: partnerLogos.length > 0,
    'como-chegar': !!mapQuery,
  };

  return (
    <div className="institutional">
      <header className={`inst-nav${scrolled ? ' inst-nav--scrolled' : ''}`}>
        <div className="inst-nav__inner">
          <button type="button" className="inst-nav__brand" onClick={() => scrollTo('topo')}>
            <span className="inst-nav__logo">
              <Icons typeIcon="tent" iconSize={22} fill="#007185" />
            </span>
            {brand}
          </button>
          <nav className="inst-nav__links">
            {INSTITUTIONAL_NAV.filter((n) => sectionVisible[n.id] !== false).map((n) => (
              <button key={n.id} type="button" onClick={() => scrollTo(n.id)}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="inst-nav__actions">
            <Button type="button" variant="" className="inst-btn inst-btn--ghost" onClick={goToAccount}>
              Minha conta
            </Button>
            <Button type="button" variant="" className="inst-btn inst-btn--primary" onClick={goToForm}>
              Inscreva-se
            </Button>
          </div>
        </div>
      </header>

      <section className={`inst-hero${heroStyle ? ' inst-hero--image' : ''}`} id="topo" style={heroStyle}>
        <div className="inst-hero__overlay" />
        <div className="inst-hero__content">
          {hero.tagline && <span className="inst-hero__tag">{hero.tagline}</span>}
          {hero.title && <h1 className="inst-hero__title">{hero.title}</h1>}
          {hero.subtitle && <p className="inst-hero__subtitle">{hero.subtitle}</p>}
          {(hero.dateLabel || hero.locationLabel) && (
            <div className="inst-hero__meta">
              {hero.dateLabel && (
                <span>
                  <Icons typeIcon="calendar" iconSize={20} fill="#fff" /> {hero.dateLabel}
                </span>
              )}
              {hero.locationLabel && (
                <span>
                  <Icons typeIcon="location-pin" iconSize={20} fill="#fff" /> {hero.locationLabel}
                </span>
              )}
            </div>
          )}
          <div className="inst-hero__cta">
            <Button type="button" variant="" className="inst-btn inst-btn--yellow inst-btn--lg" onClick={goToForm}>
              Fazer minha inscrição
            </Button>
            <Button type="button" variant="" className="inst-btn inst-btn--outline-light inst-btn--lg" onClick={() => scrollTo('sobre')}>
              Saiba mais
            </Button>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="inst-hero__stats">
            {stats.map((s, i) => (
              <div key={`${s.label}-${i}`} className="inst-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {(about.title || about.text || highlights.length > 0) && (
        <section className="inst-section" id="sobre">
          <div className="inst-section__head">
            {about.title && <h2>{about.title}</h2>}
            {about.text && <p>{about.text}</p>}
          </div>
          {highlights.length > 0 && (
            <div className="inst-cards inst-cards--3">
              {highlights.map((h, i) => (
                <div key={`${h.title}-${i}`} className="inst-card inst-card--highlight">
                  <span className="inst-card__icon">
                    <Icons typeIcon={h.icon || 'info'} iconSize={28} fill="#007185" />
                  </span>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="inst-section inst-section--tinted" id="programacao">
        <div className="inst-section__head">
          <h2>{schedule.title || 'Programação'}</h2>
          {schedule.subtitle && <p>{schedule.subtitle}</p>}
        </div>
        {days.length > 0 ? (
          <div className="inst-schedule">
            {days.map((d, di) => (
              <div key={`${d.day}-${di}`} className="inst-schedule__day">
                <h3>{d.day}</h3>
                <ul>
                  {(d.items || []).map((it, ii) => (
                    <li key={`${d.day}-${ii}`}>
                      <span className="inst-schedule__time">{it.time}</span>
                      <span className="inst-schedule__title">{it.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="inst-schedule__empty">A programação completa será divulgada em breve.</p>
        )}
      </section>

      {members.length > 0 && (
        <section className="inst-section" id="equipe">
          <div className="inst-section__head">
            <h2>{team.title || 'Equipe'}</h2>
            {team.subtitle && <p>{team.subtitle}</p>}
          </div>
          <div className="inst-cards inst-cards--4">
            {members.map((m, i) => (
              <div key={`${m.name}-${i}`} className="inst-team">
                <div className="inst-team__avatar">
                  {m.imageId ? (
                    <img src={institutionalImageUrl(m.imageId)} alt={m.name} />
                  ) : (
                    <Icons typeIcon="person" iconSize={34} fill="#007185" />
                  )}
                </div>
                <h3>{m.name}</h3>
                <span>{m.role}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section className="inst-section inst-section--tinted" id="galeria">
          <div className="inst-section__head">
            <h2>{gallery.title || 'Galeria'}</h2>
            {gallery.subtitle && <p>{gallery.subtitle}</p>}
          </div>
          <div className="inst-gallery">
            {photos.map((p, i) => {
              const album = (p.images || []).filter(Boolean);
              const hasAlbum = album.length > 0;
              return (
                <div
                  key={`${p.label}-${i}`}
                  className={`inst-gallery__item inst-gallery__item--${GALLERY_TONES[i % GALLERY_TONES.length]}${
                    hasAlbum ? ' inst-gallery__item--clickable' : ''
                  }`}
                  onClick={hasAlbum ? () => setGalleryModal({ label: p.label, images: album }) : undefined}
                  onKeyDown={hasAlbum ? (e) => (e.key === 'Enter' || e.key === ' ') && setGalleryModal({ label: p.label, images: album }) : undefined}
                  role={hasAlbum ? 'button' : undefined}
                  tabIndex={hasAlbum ? 0 : undefined}
                >
                  {p.imageId && (
                    <img className="inst-gallery__cover" src={institutionalImageUrl(p.imageId)} alt={p.label || 'Galeria'} loading="lazy" />
                  )}
                  {hasAlbum && <span className="inst-gallery__count">{album.length}</span>}
                  {p.label && (
                    <span className="inst-gallery__label">
                      {!p.imageId && <Icons typeIcon="camera" iconSize={22} fill="#ffffff" />} {p.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {noticeItems.length > 0 && (
        <section className="inst-section" id="avisos">
          <div className="inst-section__head">
            <h2>{notices.title || 'Avisos'}</h2>
          </div>
          <div className="inst-notices">
            {noticeItems.map((n, i) => (
              <div key={`${n.title}-${i}`} className="inst-notice">
                <span className="inst-notice__mark">
                  <Icons typeIcon="megaphone" iconSize={22} fill="#007185" />
                </span>
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {partnerLogos.length > 0 && (
        <section className="inst-section" id="parceiros">
          <div className="inst-section__head">
            <h2>{partners.title || 'Parceiros'}</h2>
            {partners.subtitle && <p>{partners.subtitle}</p>}
          </div>
          <div className="inst-partners">
            {partnerLogos.map((l, i) => (
              <div key={`${l.name || 'parceiro'}-${i}`} className="inst-partners__item">
                <img src={institutionalImageUrl(l.imageId)} alt={l.name || 'Parceiro'} />
              </div>
            ))}
          </div>
        </section>
      )}

      {mapQuery && (
        <section className="inst-section inst-section--tinted" id="como-chegar">
          <div className="inst-section__head">
            <h2>Como Chegar</h2>
          </div>
          <div className="inst-map">
            <iframe
              title="Como chegar"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="inst-final">
        <h2>Pronto para viver essa experiência?</h2>
        <p>As vagas são limitadas. Garanta a sua inscrição agora mesmo.</p>
        <Button type="button" variant="" className="inst-btn inst-btn--yellow inst-btn--lg" onClick={goToForm}>
          Quero me inscrever
        </Button>
        {content.showVisits && visits != null && (
          <span className="inst-visits">
            <Icons typeIcon="visible-password" iconSize={16} stroke="rgba(255,255,255,0.85)" fill="none" />
            {visits.toLocaleString('pt-BR')} visitas
          </span>
        )}
      </section>

      <Footer handleAdminClick={handleAdminClick} />

      <CustomModal
        show={!!galleryModal}
        onHide={() => setGalleryModal(null)}
        variant="info"
        icon="camera"
        title={galleryModal?.label || 'Galeria'}
        size="lg"
      >
        <div className="inst-gallery-modal">
          {(galleryModal?.images || []).map((id, i) => (
            <img
              key={`${id}-${i}`}
              src={institutionalImageUrl(id)}
              alt={`${galleryModal?.label || 'foto'} ${i + 1}`}
              onClick={() => setLightbox(id)}
            />
          ))}
        </div>
      </CustomModal>

      {lightbox && (
        <div
          className="inst-lightbox"
          role="button"
          tabIndex={0}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && setLightbox(null)}
        >
          <button type="button" className="inst-lightbox__close" aria-label="Fechar" onClick={() => setLightbox(null)}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <img src={institutionalImageUrl(lightbox)} alt="Foto ampliada" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default Institutional;
