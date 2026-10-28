import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { getActivePolls, votePoll, pollOptionImageUrl } from '@/services/polls';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import './style.scss';

const TOKEN_KEY = 'poll-voter-token';
const VOTED_KEY = 'poll-voted';
const MEDALS = ['🥇', '🥈', '🥉'];

const getVoterToken = () => {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const getVotedSet = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const markVoted = (pollId) => {
  try {
    const set = getVotedSet();
    set.add(pollId);
    localStorage.setItem(VOTED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
};

const fmtTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const Podium = ({ poll }) => {
  const ranked = [...(poll.options || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);
  if (!ranked.length || !ranked.some((o) => (o.votes || 0) > 0)) return null;
  const order = [ranked[1], ranked[0], ranked[2]].filter(Boolean);
  return (
    <div className="votacao-podium" aria-label="Pódio">
      {order.map((option) => {
        const place = ranked.indexOf(option);
        return (
          <div className={`votacao-podium__spot votacao-podium__spot--${place + 1}`} key={option.id}>
            <span className="votacao-podium__medal">{MEDALS[place]}</span>
            <span className="votacao-podium__avatar">
              {option.hasImage ? (
                <img src={pollOptionImageUrl(option.id)} alt={option.label} loading="lazy" />
              ) : (
                <span className="votacao-podium__initial">{option.label?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </span>
            <span className="votacao-podium__name" title={option.label}>{option.label}</span>
            <span className="votacao-podium__votes">{option.votes || 0} {option.votes === 1 ? 'voto' : 'votos'}</span>
            <span className="votacao-podium__bar" aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
};

Podium.propTypes = { poll: PropTypes.object };

const Votacao = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(getVotedSet());
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState(null);
  const [selections, setSelections] = useState({});
  const [now, setNow] = useState(Date.now());

  const load = () =>
    getActivePolls()
      .then((data) => setPolls(Array.isArray(data) ? data : []))
      .catch(() => {});

  useEffect(() => {
    load().finally(() => setLoading(false));
    const refresh = setInterval(load, 5000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, []);

  const remainingSecs = (poll) => (poll.votingEndsAt ? Math.max(0, Math.ceil((poll.votingEndsAt - now) / 1000)) : null);
  const isClosed = (poll) => poll.votingEndsAt != null && now >= poll.votingEndsAt;

  const openConfirm = (poll, option) => {
    if (voted.has(poll.id) || isClosed(poll) || submitting) return;
    setPending({ pollId: poll.id, optionId: option.id, label: option.label, hasImage: option.hasImage });
  };

  const confirmVote = async () => {
    if (!pending || submitting) return;
    const { pollId, optionId } = pending;
    setSubmitting(true);
    try {
      const res = await votePoll(pollId, [optionId], getVoterToken());
      if (res?.success || res?.alreadyVoted) {
        markVoted(pollId);
        setVoted((prev) => new Set([...prev, pollId]));
      }
      load();
    } catch {
      /* quiet */
    } finally {
      setSubmitting(false);
      setPending(null);
    }
  };

  const toggleSelect = (poll, optionId) => {
    if (voted.has(poll.id) || isClosed(poll) || submitting) return;
    setSelections((prev) => {
      const current = new Set(prev[poll.id] || []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        if (current.size >= (poll.maxChoices || 1)) return prev;
        current.add(optionId);
      }
      return { ...prev, [poll.id]: [...current] };
    });
  };

  const submitMultiple = async (poll) => {
    const ids = selections[poll.id] || [];
    if (!ids.length || submitting) return;
    setSubmitting(true);
    try {
      const res = await votePoll(poll.id, ids, getVoterToken());
      if (res?.success || res?.alreadyVoted) {
        markVoted(poll.id);
        setVoted((prev) => new Set([...prev, poll.id]));
      }
      load();
    } catch {
      /* quiet */
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading loading />;

  return (
    <div className="votacao">
      <header className="votacao__header">
        <span className="votacao__badge">🗳️ Votação</span>
        <h1 className="votacao__brand">Escolha sua favorita</h1>
        <p className="votacao__subtitle">Toque na opção que você mais curtiu e confirme seu voto.</p>
      </header>

      {polls.length === 0 ? (
        <div className="votacao__empty">
          <span className="votacao__empty-icon">🗳️</span>
          <p>Nenhuma votação aberta no momento.</p>
        </div>
      ) : (
        polls.map((poll) => {
          const hasVoted = voted.has(poll.id);
          const closed = isClosed(poll);
          const remaining = remainingSecs(poll);
          const multiple = Boolean(poll.allowMultiple) && (poll.maxChoices || 1) > 1;
          const selected = selections[poll.id] || [];
          const locked = hasVoted || closed;
          return (
            <section className={`votacao__poll${hasVoted ? ' is-done' : ''}`} key={poll.id}>
              <div className="votacao__poll-head">
                <h2 className="votacao__poll-title">{poll.title}</h2>
                {remaining != null && (
                  <span className={`votacao__timer${closed ? ' is-ended' : ''}${remaining <= 10 && !closed ? ' is-urgent' : ''}`}>
                    <Icons typeIcon="clock" iconSize={15} fill="currentColor" />
                    {closed ? 'Encerrada' : fmtTime(remaining)}
                  </span>
                )}
                <p className="votacao__poll-note">
                  <span aria-hidden="true">ℹ️</span>{' '}
                  {multiple ? `Você pode escolher até ${poll.maxChoices} opções.` : 'Você só pode votar em uma opção.'}
                </p>
              </div>

              <Podium poll={poll} />

              {hasVoted && <p className="votacao__thanks">✅ Obrigado! Seu voto foi registrado.</p>}
              {!hasVoted && closed && <p className="votacao__thanks votacao__thanks--closed">⏱️ Esta votação foi encerrada.</p>}

              <div className="votacao__options">
                {(poll.options || []).map((option) => {
                  const isSelected = multiple && selected.includes(option.id);
                  return (
                    <button
                      type="button"
                      key={option.id}
                      className={`votacao__option${locked ? ' is-locked' : ''}${isSelected ? ' is-selected' : ''}`}
                      disabled={locked}
                      onClick={() => (multiple ? toggleSelect(poll, option.id) : openConfirm(poll, option))}
                    >
                      <span className="votacao__option-media">
                        {option.hasImage ? (
                          <img className="votacao__option-img" src={pollOptionImageUrl(option.id)} alt={option.label} loading="lazy" />
                        ) : (
                          <span className="votacao__option-placeholder">{option.label?.charAt(0) || '?'}</span>
                        )}
                        {multiple && isSelected && <span className="votacao__option-check">✓</span>}
                        {!locked && !multiple && <span className="votacao__option-cta">Votar</span>}
                      </span>
                      <span className="votacao__option-label">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {multiple && !locked && (
                <Button
                  className="votacao__submit"
                  variant="success"
                  disabled={!selected.length || submitting}
                  onClick={() => submitMultiple(poll)}
                >
                  {submitting ? 'Registrando…' : `Confirmar voto (${selected.length}/${poll.maxChoices})`}
                </Button>
              )}
            </section>
          );
        })
      )}

      <CustomModal
        show={!!pending}
        onHide={() => !submitting && setPending(null)}
        variant="confirm"
        title="Confirmar voto"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setPending(null)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmVote} disabled={submitting}>
              {submitting ? 'Registrando…' : 'Confirmar voto'}
            </Button>
          </>
        }
      >
        {pending && (
          <div className="votacao__confirm">
            {pending.hasImage && (
              <img className="votacao__confirm-img" src={pollOptionImageUrl(pending.optionId)} alt={pending.label} />
            )}
            <p className="votacao__confirm-text">
              Confirmar seu voto em <b>{pending.label}</b>? Você só pode votar em uma opção e não poderá alterar depois.
            </p>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default Votacao;
