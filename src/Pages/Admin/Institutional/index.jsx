import { useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import {
  getInstitutionalContent,
  updateInstitutionalContent,
  uploadInstitutionalImage,
  institutionalImageUrl,
} from '@/services/institutional';
import { DEFAULT_INSTITUTIONAL_CONTENT, HIGHLIGHT_ICON_OPTIONS } from '@/config/institutionalContent';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import ActionButton from '@/components/Global/ActionButton';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const clone = (value) => JSON.parse(JSON.stringify(value));

const ImageField = ({ imageId, onChange, label, shape }) => {
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
      toast.error('Não foi possível enviar a imagem.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inst-admin-image">
      <div className={`inst-admin-image__preview inst-admin-image__preview--${shape || 'wide'}`}>
        {imageId ? (
          <img src={institutionalImageUrl(imageId)} alt={label || 'imagem'} />
        ) : (
          <span className="inst-admin-image__empty">
            <Icons typeIcon="camera" iconSize={22} fill="#98a2b3" />
          </span>
        )}
      </div>
      <div className="inst-admin-image__actions">
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
        <Button variant="outline-teal-blue" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? 'Enviando...' : imageId ? 'Trocar imagem' : 'Enviar imagem'}
        </Button>
        {imageId && (
          <Button variant="outline-danger" size="sm" onClick={() => onChange(null)}>
            Remover
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
      toast.success('Área institucional atualizada.');
    } catch {
      toast.error('Não foi possível salvar a área institucional.');
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
  const gallery = form.gallery || {};
  const notices = form.notices || {};
  const partners = form.partners || {};

  return (
    <div className="admin-subpage inst-admin">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Área Institucional"
        subtitle="Configure a página inicial: textos, fotos, equipe, programação e avisos. O botão de inscrição sempre leva ao formulário."
        typeIcon="camp"
      />

      <div className="admin-subpage__content">
        <div className="inst-admin__toolbar">
          <Button variant="teal-blue" size="lg" onClick={handleSave} disabled={saving} style={{ position: 'relative' }}>
            <span style={{ visibility: saving ? 'hidden' : 'visible' }}>Salvar alterações</span>
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
          <h5>Contador de visitas</h5>
          <Form.Check
            type="switch"
            id="inst-show-visits"
            label="Exibir o número de visitas na página pública"
            checked={!!form.showVisits}
            onChange={(e) => patch((n) => { n.showVisits = e.target.checked; })}
          />
        </section>

        <section className="inst-admin__card">
          <h5>Topo (destaque)</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Nome do evento (marca):</b></Form.Label>
                <Form.Control value={form.brand || ''} onChange={(e) => patch((n) => { n.brand = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Etiqueta (tagline):</b></Form.Label>
                <Form.Control value={hero.tagline || ''} onChange={(e) => patch((n) => { n.hero.tagline = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label><b>Título principal:</b></Form.Label>
            <Form.Control as="textarea" rows={2} value={hero.title || ''} onChange={(e) => patch((n) => { n.hero.title = e.target.value; })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><b>Subtítulo:</b></Form.Label>
            <Form.Control as="textarea" rows={2} value={hero.subtitle || ''} onChange={(e) => patch((n) => { n.hero.subtitle = e.target.value; })} />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Data (texto):</b></Form.Label>
                <Form.Control value={hero.dateLabel || ''} onChange={(e) => patch((n) => { n.hero.dateLabel = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Local (texto):</b></Form.Label>
                <Form.Control value={hero.locationLabel || ''} onChange={(e) => patch((n) => { n.hero.locationLabel = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Label><b>Imagem de fundo do topo (opcional):</b></Form.Label>
          <ImageField
            imageId={hero.backgroundImageId}
            shape="wide"
            label="fundo do topo"
            onChange={(id) => patch((n) => { n.hero.backgroundImageId = id; })}
          />
        </section>

        <section className="inst-admin__card">
          <div className="inst-admin__card-head">
            <h5>Números em destaque</h5>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.stats ||= []).push({ value: '', label: '' }); })}>
              + Adicionar número
            </Button>
          </div>
          {(form.stats || []).map((s, i) => (
            <Row key={i} className="inst-admin__row align-items-end">
              <Col md={4}>
                <Form.Label><b>Valor:</b></Form.Label>
                <Form.Control value={s.value || ''} onChange={(e) => patch((n) => { n.stats[i].value = e.target.value; })} />
              </Col>
              <Col md={7}>
                <Form.Label><b>Descrição:</b></Form.Label>
                <Form.Control value={s.label || ''} onChange={(e) => patch((n) => { n.stats[i].label = e.target.value; })} />
              </Col>
              <Col md={1} className="text-end">
                <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.stats.splice(i, 1); })} />
              </Col>
            </Row>
          ))}
        </section>

        <section className="inst-admin__card">
          <h5>Sobre</h5>
          <Form.Group className="mb-3">
            <Form.Label><b>Título:</b></Form.Label>
            <Form.Control value={about.title || ''} onChange={(e) => patch((n) => { n.about.title = e.target.value; })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><b>Texto:</b></Form.Label>
            <Form.Control as="textarea" rows={4} value={about.text || ''} onChange={(e) => patch((n) => { n.about.text = e.target.value; })} />
          </Form.Group>
          <div className="inst-admin__card-head">
            <h6>Destaques (cards)</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.about.highlights ||= []).push({ icon: 'info', title: '', text: '' }); })}>
              + Adicionar destaque
            </Button>
          </div>
          {(about.highlights || []).map((h, i) => (
            <Row key={i} className="inst-admin__row align-items-end">
              <Col md={3}>
                <Form.Label><b>Ícone:</b></Form.Label>
                <Form.Select value={h.icon || 'info'} onChange={(e) => patch((n) => { n.about.highlights[i].icon = e.target.value; })}>
                  {HIGHLIGHT_ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label><b>Título:</b></Form.Label>
                <Form.Control value={h.title || ''} onChange={(e) => patch((n) => { n.about.highlights[i].title = e.target.value; })} />
              </Col>
              <Col md={5}>
                <Form.Label><b>Texto:</b></Form.Label>
                <Form.Control value={h.text || ''} onChange={(e) => patch((n) => { n.about.highlights[i].text = e.target.value; })} />
              </Col>
              <Col md={1} className="text-end">
                <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.about.highlights.splice(i, 1); })} />
              </Col>
            </Row>
          ))}
        </section>

        <section className="inst-admin__card">
          <h5>Programação</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Título:</b></Form.Label>
                <Form.Control value={schedule.title || ''} onChange={(e) => patch((n) => { n.schedule.title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Subtítulo:</b></Form.Label>
                <Form.Control value={schedule.subtitle || ''} onChange={(e) => patch((n) => { n.schedule.subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__card-head">
            <h6>Dias</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.schedule.days ||= []).push({ day: '', items: [] }); })}>
              + Adicionar dia
            </Button>
          </div>
          {(schedule.days || []).map((d, di) => (
            <div key={di} className="inst-admin__subcard">
              <Row className="inst-admin__row align-items-end">
                <Col md={10}>
                  <Form.Label><b>Dia:</b></Form.Label>
                  <Form.Control value={d.day || ''} onChange={(e) => patch((n) => { n.schedule.days[di].day = e.target.value; })} />
                </Col>
                <Col md={2} className="text-end">
                  <ActionButton action="delete" title="Remover dia" onClick={() => patch((n) => { n.schedule.days.splice(di, 1); })} />
                </Col>
              </Row>
              {(d.items || []).map((it, ii) => (
                <Row key={ii} className="inst-admin__row align-items-end">
                  <Col md={3}>
                    <Form.Label><b>Horário:</b></Form.Label>
                    <Form.Control value={it.time || ''} onChange={(e) => patch((n) => { n.schedule.days[di].items[ii].time = e.target.value; })} />
                  </Col>
                  <Col md={8}>
                    <Form.Label><b>Atividade:</b></Form.Label>
                    <Form.Control value={it.title || ''} onChange={(e) => patch((n) => { n.schedule.days[di].items[ii].title = e.target.value; })} />
                  </Col>
                  <Col md={1} className="text-end">
                    <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.schedule.days[di].items.splice(ii, 1); })} />
                  </Col>
                </Row>
              ))}
              <Button variant="link" size="sm" className="p-0" onClick={() => patch((n) => { (n.schedule.days[di].items ||= []).push({ time: '', title: '' }); })}>
                + item
              </Button>
            </div>
          ))}
        </section>

        <section className="inst-admin__card">
          <h5>Equipe</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Título:</b></Form.Label>
                <Form.Control value={team.title || ''} onChange={(e) => patch((n) => { n.team.title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Subtítulo:</b></Form.Label>
                <Form.Control value={team.subtitle || ''} onChange={(e) => patch((n) => { n.team.subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__card-head">
            <h6>Membros</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.team.members ||= []).push({ name: '', role: '', imageId: null }); })}>
              + Adicionar membro
            </Button>
          </div>
          <div className="inst-admin__grid">
            {(team.members || []).map((m, i) => (
              <div key={i} className="inst-admin__subcard">
                <div className="d-flex justify-content-end">
                  <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.team.members.splice(i, 1); })} />
                </div>
                <ImageField
                  imageId={m.imageId}
                  shape="avatar"
                  label={m.name}
                  onChange={(id) => patch((n) => { n.team.members[i].imageId = id; })}
                />
                <Form.Label className="mt-2">Nome</Form.Label>
                <Form.Control value={m.name || ''} onChange={(e) => patch((n) => { n.team.members[i].name = e.target.value; })} />
                <Form.Label className="mt-2">Função</Form.Label>
                <Form.Control value={m.role || ''} onChange={(e) => patch((n) => { n.team.members[i].role = e.target.value; })} />
              </div>
            ))}
          </div>
        </section>

        <section className="inst-admin__card">
          <h5>Galeria</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Título:</b></Form.Label>
                <Form.Control value={gallery.title || ''} onChange={(e) => patch((n) => { n.gallery.title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Subtítulo:</b></Form.Label>
                <Form.Control value={gallery.subtitle || ''} onChange={(e) => patch((n) => { n.gallery.subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__card-head">
            <h6>Fotos</h6>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.gallery.photos ||= []).push({ imageId: null, label: '', images: [] }); })}>
              + Adicionar foto
            </Button>
          </div>
          <div className="inst-admin__grid">
            {(gallery.photos || []).map((p, i) => (
              <div key={i} className="inst-admin__subcard">
                <div className="d-flex justify-content-end">
                  <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.gallery.photos.splice(i, 1); })} />
                </div>
                <Form.Label>Capa</Form.Label>
                <ImageField
                  imageId={p.imageId}
                  shape="wide"
                  label={p.label}
                  onChange={(id) => patch((n) => { n.gallery.photos[i].imageId = id; })}
                />
                <Form.Label className="mt-2">Legenda</Form.Label>
                <Form.Control value={p.label || ''} onChange={(e) => patch((n) => { n.gallery.photos[i].label = e.target.value; })} />
                <Form.Label className="mt-3">Álbum (abre no modal ao clicar)</Form.Label>
                {(p.images || []).map((imgId, ii) => (
                  <div key={ii} className="inst-admin__album-item">
                    <div className="d-flex justify-content-end">
                      <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.gallery.photos[i].images.splice(ii, 1); })} />
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
            <h5>Avisos</h5>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.notices.items ||= []).push({ title: '', text: '' }); })}>
              + Adicionar aviso
            </Button>
          </div>
          <Form.Group className="mb-3">
            <Form.Label><b>Título da Seção:</b></Form.Label>
            <Form.Control value={notices.title || ''} onChange={(e) => patch((n) => { n.notices.title = e.target.value; })} />
          </Form.Group>
          {(notices.items || []).map((it, i) => (
            <Row key={i} className="inst-admin__row align-items-end">
              <Col md={4}>
                <Form.Label><b>Título:</b></Form.Label>
                <Form.Control value={it.title || ''} onChange={(e) => patch((n) => { n.notices.items[i].title = e.target.value; })} />
              </Col>
              <Col md={7}>
                <Form.Label><b>Texto:</b></Form.Label>
                <Form.Control value={it.text || ''} onChange={(e) => patch((n) => { n.notices.items[i].text = e.target.value; })} />
              </Col>
              <Col md={1} className="text-end">
                <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.notices.items.splice(i, 1); })} />
              </Col>
            </Row>
          ))}
        </section>

        <section className="inst-admin__card">
          <div className="inst-admin__card-head">
            <h5>Parceiros</h5>
            <Button variant="outline-teal-blue" size="sm" onClick={() => patch((n) => { (n.partners ||= {}).logos ||= []; n.partners.logos.push({ imageId: null, name: '' }); })}>
              + Adicionar parceiro
            </Button>
          </div>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Título da Seção:</b></Form.Label>
                <Form.Control value={partners.title || ''} onChange={(e) => patch((n) => { (n.partners ||= {}).title = e.target.value; })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><b>Subtítulo (opcional):</b></Form.Label>
                <Form.Control value={partners.subtitle || ''} onChange={(e) => patch((n) => { (n.partners ||= {}).subtitle = e.target.value; })} />
              </Form.Group>
            </Col>
          </Row>
          <div className="inst-admin__grid">
            {(partners.logos || []).map((l, i) => (
              <div key={i} className="inst-admin__subcard">
                <div className="d-flex justify-content-end">
                  <ActionButton action="delete" title="Remover" onClick={() => patch((n) => { n.partners.logos.splice(i, 1); })} />
                </div>
                <ImageField
                  imageId={l.imageId}
                  shape="wide"
                  label={l.name}
                  onChange={(id) => patch((n) => { n.partners.logos[i].imageId = id; })}
                />
                <Form.Label className="mt-2">Nome (opcional)</Form.Label>
                <Form.Control value={l.name || ''} onChange={(e) => patch((n) => { n.partners.logos[i].name = e.target.value; })} />
              </div>
            ))}
          </div>
        </section>

        <div className="inst-admin__toolbar">
          <Button variant="teal-blue" size="lg" onClick={handleSave} disabled={saving} style={{ position: 'relative' }}>
            <span style={{ visibility: saving ? 'hidden' : 'visible' }}>Salvar alterações</span>
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
