import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import { getActivePolls, votePoll, pollOptionImageUrl } from '@/services/polls';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import './style.scss';

const TOKEN_KEY = 'poll-voter-token';
const VOTED_KEY = 'poll-voted';

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

const Votacao = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(getVotedSet());
  const [submitting, setSubmitting] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    getActivePolls()
      .then((data) => setPolls(Array.isArray(data) ? data : []))
      .catch(() => setPolls([]))
      .finally(() => setLoading(false));
  }, []);

  const openConfirm = (poll, option) => {
    if (voted.has(poll.id) || submitting) return;
    setPending({ pollId: poll.id, pollTitle: poll.title, optionId: option.id, label: option.label, hasImage: option.hasImage });
  };

  const closeConfirm = () => {
    if (submitting) return;
    setPending(null);
  };

  const confirmVote = async () => {
    if (!pending || submitting) return;
    const { pollId, optionId } = pending;
    setSubmitting(optionId);
    try {
      const res = await votePoll(pollId, optionId, getVoterToken());
      if (res?.success || res?.alreadyVoted) {
        markVoted(pollId);
        setVoted((prev) => new Set([...prev, pollId]));
      }
    } catch {
      /* swallow — mobile audience, keep it quiet */
    } finally {
      setSubmitting(null);
      setPending(null);
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
          return (
            <section className={`votacao__poll${hasVoted ? ' is-done' : ''}`} key={poll.id}>
              <div className="votacao__poll-head">
                <h2 className="votacao__poll-title">{poll.title}</h2>
                <p className="votacao__poll-note">
                  <span aria-hidden="true">ℹ️</span> Você só pode votar em uma opção.
                </p>
              </div>
              {hasVoted && <p className="votacao__thanks">✅ Obrigado! Seu voto foi registrado.</p>}
              <div className="votacao__options">
                {(poll.options || []).map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={`votacao__option${hasVoted ? ' is-locked' : ''}`}
                    disabled={hasVoted || submitting === option.id}
                    onClick={() => openConfirm(poll, option)}
                  >
                    <span className="votacao__option-media">
                      {option.hasImage ? (
                        <img
                          className="votacao__option-img"
                          src={pollOptionImageUrl(option.id)}
                          alt={option.label}
                          loading="lazy"
                        />
                      ) : (
                        <span className="votacao__option-placeholder">{option.label?.charAt(0) || '?'}</span>
                      )}
                      {!hasVoted && <span className="votacao__option-cta">Votar</span>}
                    </span>
                    <span className="votacao__option-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })
      )}

      <CustomModal
        show={!!pending}
        onHide={closeConfirm}
        variant="confirm"
        title="Confirmar voto"
        footer={
          <>
            <Button variant="outline-secondary" onClick={closeConfirm} disabled={!!submitting}>
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmVote} disabled={!!submitting}>
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
