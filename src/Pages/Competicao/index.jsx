import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { getSignupOpenPolls, signupToPoll, pollOptionImageUrl } from '@/services/polls';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import './style.scss';

const TOKEN_KEY = 'poll-signup-token';
const DONE_KEY = 'poll-signup-done';

const getSignupToken = () => {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const getDoneSet = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const markDone = (pollId) => {
  try {
    const set = getDoneSet();
    set.add(pollId);
    localStorage.setItem(DONE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
};

const emptyForm = { name: '', file: null, observation: '', music: '' };

const Competicao = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(getDoneSet());
  const [active, setActive] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getSignupOpenPolls()
      .then((data) => setPolls(Array.isArray(data) ? data : []))
      .catch(() => setPolls([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openSignup = (poll) => {
    setForm(emptyForm);
    setActive(poll);
  };

  const handleSubmit = async () => {
    if (!active) return;
    if (!form.name.trim()) {
      toast.error('Informe o nome do competidor.');
      return;
    }
    setSubmitting(true);
    try {
      await signupToPoll(active.id, {
        name: form.name.trim(),
        file: form.file,
        signupToken: getSignupToken(),
        observation: form.observation.trim(),
        music: form.music.trim(),
      });
      markDone(active.id);
      setDone((prev) => new Set([...prev, active.id]));
      toast.success('Inscrição confirmada! Boa sorte 🎉');
      setActive(null);
      load();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível concluir sua inscrição.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading loading />;

  return (
    <div className="competir">
      <header className="competir__header">
        <span className="competir__badge">🏆 Competição</span>
        <h1>Inscreva-se para competir</h1>
        <p>Escolha a competição e garanta sua vaga. Depois é só torcer pelos votos do público!</p>
      </header>

      <button type="button" className="competir__back" onClick={() => navigate('/')}>
        <Icons typeIcon="arrow-left" iconSize={18} fill="currentColor" />
        <span>Voltar</span>
      </button>

      {polls.length === 0 ? (
        <div className="competir__empty">
          <Icons typeIcon="dart" iconSize={40} fill="#c3ccd1" />
          <p>Nenhuma competição com inscrições abertas no momento.</p>
        </div>
      ) : (
        polls.map((poll) => {
          const contestants = poll.options || [];
          const already = done.has(poll.id);
          return (
            <section className="competir-card" key={poll.id}>
              <div className="competir-card__head">
                <h2>{poll.title}</h2>
                <span className="competir-card__count">
                  {contestants.length} {contestants.length === 1 ? 'inscrito' : 'inscritos'}
                </span>
              </div>

              {contestants.length > 0 && (
                <div className="competir-card__contestants">
                  {contestants.map((c) => (
                    <span className="competir-contestant" key={c.id} title={c.label}>
                      {c.hasImage ? (
                        <img src={pollOptionImageUrl(c.id)} alt={c.label} loading="lazy" />
                      ) : (
                        <span className="competir-contestant__initial">{c.label?.charAt(0)?.toUpperCase() || '?'}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {already ? (
                <span className="competir-card__done">✅ Você já está inscrito nesta competição.</span>
              ) : (
                <Button className="competir-card__btn" onClick={() => openSignup(poll)}>
                  Inscrever-se
                </Button>
              )}
            </section>
          );
        })
      )}

      <CustomModal
        show={!!active}
        onHide={() => !submitting && setActive(null)}
        variant="confirm"
        title={active ? `Inscrição — ${active.title}` : 'Inscrição'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActive(null)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Enviando…' : 'Confirmar inscrição'}
            </Button>
          </>
        }
      >
        <div className="competir-form">
          <div className="competir-form__thumb">
            {form.file ? (
              <img src={URL.createObjectURL(form.file)} alt="Pré-visualização" />
            ) : form.name.trim() ? (
              <span className="competir-form__initial">{form.name.trim().charAt(0).toUpperCase()}</span>
            ) : (
              <span className="competir-form__placeholder">
                <Icons typeIcon="camera" iconSize={26} fill="#9aa5ab" />
              </span>
            )}
          </div>
          <div className="competir-form__fields">
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">Nome do competidor / grupo</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Como você quer aparecer na votação"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">Foto <span className="text-muted">(opcional)</span></Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                size="sm"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">Precisa de alguma música?</Form.Label>
              <Form.Control
                value={form.music}
                onChange={(e) => setForm({ ...form, music: e.target.value })}
                placeholder="Qual música? (opcional)"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="fw-semibold">Observação</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.observation}
                onChange={(e) => setForm({ ...form, observation: e.target.value })}
                placeholder="Algo que você queira pontuar que possamos ajudar?"
              />
            </Form.Group>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default Competicao;
