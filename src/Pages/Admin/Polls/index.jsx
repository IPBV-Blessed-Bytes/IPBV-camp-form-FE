import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, Badge, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import {
  listPolls,
  createPoll,
  updatePoll,
  deletePoll,
  addPollOption,
  deletePollOption,
  pollOptionImageUrl,
  startPollTimer,
  pausePollTimer,
  resetPollTimer,
} from '@/services/polls';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import SectionHeader from '@/components/Admin/SectionHeader';
import ActionButton from '@/components/Global/ActionButton';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const sortedOptions = (poll) => [...(poll.options || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0));

const fmtClock = (secs) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

const PODIUM_MEDALS = ['🥇', '🥈', '🥉'];

const timerStateLabel = (poll, now) => {
  if (!poll.votingDurationSeconds) return 'sem cronômetro definido';
  if (poll.votingEndsAt) {
    const rem = Math.max(0, Math.ceil((poll.votingEndsAt - now) / 1000));
    return rem > 0 ? `em andamento — ${fmtClock(rem)}` : 'tempo esgotado';
  }
  return 'parado';
};

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

const suspenseWidth = (t, finalPct) => {
  const keys = [
    [0, 0],
    [0.22, 92],
    [0.42, 10],
    [0.62, Math.min(100, finalPct + 20)],
    [0.8, Math.max(0, finalPct - 5)],
    [1, finalPct],
  ];
  for (let i = 0; i < keys.length - 1; i += 1) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const local = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * easeInOut(Math.max(0, Math.min(1, local)));
    }
  }
  return finalPct;
};

const DISPLAY_MODES = [
  { key: 'gradual', label: 'Apuração gradual' },
  { key: 'suspense', label: 'Apuração suspense' },
  { key: 'live', label: 'Ao vivo' },
];

const AdminPolls = ({ loggedUsername }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('manage');
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const [manageId, setManageId] = useState(null);
  const [optDraft, setOptDraft] = useState({ label: '', file: null });

  const [displayMode, setDisplayMode] = useState('gradual');
  const [reveal, setReveal] = useState(null);
  const [animT, setAnimT] = useState(0);
  const [animating, setAnimating] = useState(false);
  const rafRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setPolls(await listPolls());
    } catch {
      if (!silent) toast.error('Não foi possível carregar as votações.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (mode === 'results' && displayMode !== 'live') return undefined;
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
  }, [load, mode, displayMode]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const managedPoll = useMemo(() => polls.find((p) => p.id === manageId) || null, [polls, manageId]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const doTimer = async (action, pollId) => {
    const fn = action === 'start' ? startPollTimer : action === 'pause' ? pausePollTimer : resetPollTimer;
    try {
      await fn(pollId);
      load(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Não foi possível atualizar o cronômetro.');
    }
  };

  const updateManaged = async (payload, errorMsg) => {
    if (!managedPoll) return;
    try {
      await updatePoll(managedPoll.id, payload);
      load(true);
    } catch {
      toast.error(errorMsg || 'Erro ao atualizar a votação.');
    }
  };

  const buildReveal = useCallback(
    () =>
      polls
        .filter((p) => p.active)
        .map((poll) => {
          const total = poll.totalVotes || 0;
          const ranked = sortedOptions(poll).map((o) => {
            const votes = o.votes || 0;
            return {
              id: o.id,
              label: o.label,
              hasImage: o.hasImage,
              finalVotes: votes,
              finalPct: total > 0 ? Math.round((votes / total) * 100) : 0,
            };
          });
          const topVotes = ranked[0]?.finalVotes || 0;
          return { id: poll.id, title: poll.title, total, ranked, topVotes };
        }),
    [polls],
  );

  const resetReveal = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setAnimating(false);
    setReveal(null);
    setAnimT(0);
  }, []);

  const startReveal = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setReveal(buildReveal());
    setAnimT(0);
    setAnimating(true);
    const duration = displayMode === 'suspense' ? 5200 : 4200;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setAnimT(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setAnimating(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [buildReveal, displayMode]);

  const changeDisplayMode = (key) => {
    resetReveal();
    setDisplayMode(key);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      await createPoll(newTitle.trim());
      setNewTitle('');
      setShowCreate(false);
      await load();
      toast.success('Votação criada.');
    } catch {
      toast.error('Erro ao criar a votação.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (poll) => {
    try {
      await updatePoll(poll.id, { active: !poll.active });
      await load();
    } catch {
      toast.error('Erro ao atualizar.');
    }
  };

  const handleRename = async (poll, title) => {
    if (!title.trim() || title.trim() === poll.title) return;
    try {
      await updatePoll(poll.id, { title: title.trim() });
      await load();
    } catch {
      toast.error('Erro ao renomear.');
    }
  };

  const handleDeletePoll = async (poll) => {
    if (!window.confirm(`Excluir a votação "${poll.title}" e todos os votos?`)) return;
    try {
      await deletePoll(poll.id);
      await load();
      toast.success('Votação excluída.');
    } catch {
      toast.error('Erro ao excluir.');
    }
  };

  const handleAddOption = async (pollId) => {
    if (!optDraft.label?.trim()) {
      toast.error('Informe o nome da opção.');
      return;
    }
    setBusy(true);
    try {
      await addPollOption(pollId, optDraft.label.trim(), optDraft.file || null);
      setOptDraft({ label: '', file: null });
      await load();
    } catch {
      toast.error('Erro ao adicionar a opção.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await deletePollOption(optionId);
      await load();
    } catch {
      toast.error('Erro ao excluir a opção.');
    }
  };

  const stats = useMemo(() => {
    const active = polls.filter((p) => p.active).length;
    const options = polls.reduce((acc, p) => acc + (p.options?.length || 0), 0);
    const votes = polls.reduce((acc, p) => acc + (p.totalVotes || 0), 0);
    return { active, options, votes };
  }, [polls]);

  if (loading) return <Loading loading />;

  if (mode === 'results') {
    const activePolls = polls.filter((p) => p.active);
    const liveMode = displayMode === 'live';
    const revealed = !liveMode && !!reveal;
    const source = liveMode ? null : reveal || buildReveal();

    const renderPolls = liveMode
      ? activePolls.map((poll) => {
          const total = poll.totalVotes || 0;
          const ranked = sortedOptions(poll);
          const topVotes = ranked[0]?.votes || 0;
          return {
            id: poll.id,
            title: poll.title,
            total,
            rows: ranked.map((o, i) => {
              const votes = o.votes || 0;
              const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
              return { id: o.id, label: o.label, hasImage: o.hasImage, width: pct, pct, votes, showVotes: true, leader: total > 0 && votes === topVotes, rank: i + 1 };
            }),
          };
        })
      : source.map((poll) => ({
          id: poll.id,
          title: poll.title,
          total: poll.total,
          rows: poll.ranked.map((o, i) => {
            let width = 0;
            let pct = 0;
            let votes = 0;
            let showVotes = false;
            let leader = false;
            if (revealed) {
              if (displayMode === 'gradual') {
                const e = easeOutCubic(animT);
                width = o.finalPct * e;
                pct = Math.round(o.finalPct * e);
                votes = Math.round(o.finalVotes * e);
                showVotes = true;
              } else {
                width = suspenseWidth(animT, o.finalPct);
                pct = Math.round(width);
                votes = o.finalVotes;
                showVotes = animT >= 1;
              }
              leader = animT >= 1 && o.finalVotes > 0 && o.finalVotes === poll.topVotes;
            }
            return { id: o.id, label: o.label, hasImage: o.hasImage, width, pct, votes, showVotes, leader, rank: i + 1 };
          }),
        }));

    return (
      <div className="admin-subpage admin-subpage--polls">
        <AdminSubpageHeader
          username={loggedUsername}
          title="Votações"
          subtitle={liveMode ? 'Modo exibição — resultados ao vivo' : 'Modo exibição — apuração'}
          typeIcon="feedback"
        />

        <div className="admin-subpage__content">
          <div className="polls-results__bar">
            <div className="polls-results__modes">
              {DISPLAY_MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`polls-results__mode${displayMode === m.key ? ' is-active' : ''}`}
                  onClick={() => changeDisplayMode(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <Button variant="outline-teal-blue" className="d-inline-flex align-items-center gap-2" onClick={() => { resetReveal(); setMode('manage'); }}>
              <Icons typeIcon="arrow-left" iconSize={16} fill="currentColor" /> Voltar à edição
            </Button>
          </div>

          <div className="polls-results__status">
            {liveMode ? (
              <span className="polls-results__live">
                <span className="polls-results__dot" /> Atualização automática
              </span>
            ) : !reveal ? (
              <Button variant="teal-blue" className="d-inline-flex align-items-center gap-2" onClick={startReveal} disabled={activePolls.length === 0}>
                <Icons typeIcon="megaphone" iconSize={18} fill="#fff" /> Revelar resultados
              </Button>
            ) : animating ? (
              <span className="polls-results__apurando">
                <span className="polls-results__dot" /> Apurando…
              </span>
            ) : (
              <Button variant="outline-teal-blue" className="d-inline-flex align-items-center gap-2" onClick={startReveal}>
                <Icons typeIcon="refresh" iconSize={16} fill="currentColor" /> Refazer apuração
              </Button>
            )}
          </div>

          {activePolls.length === 0 && (
            <p className="text-muted mt-3">Nenhuma votação ativa para exibir. Ative uma votação na tela de edição.</p>
          )}

          {renderPolls.map((poll) => (
            <Card className="polls-show" key={poll.id}>
              <Card.Body>
                <div className="polls-show__head">
                  <h2 className="polls-show__title">{poll.title}</h2>
                  <span className="polls-show__total">{poll.total} voto{poll.total === 1 ? '' : 's'}</span>
                </div>
                {poll.rows.length >= 2 && poll.rows.some((r) => r.showVotes && r.votes > 0) && (
                  <div className="polls-podium">
                    {[poll.rows[1], poll.rows[0], poll.rows[2]].filter(Boolean).map((row) => {
                      const place = poll.rows.indexOf(row);
                      return (
                        <div className={`polls-podium__spot polls-podium__spot--${place + 1}`} key={`pod-${row.id}`}>
                          <span className="polls-podium__medal">{PODIUM_MEDALS[place]}</span>
                          <span className="polls-podium__avatar">
                            {row.hasImage ? (
                              <img src={pollOptionImageUrl(row.id)} alt={row.label} />
                            ) : (
                              <span className="polls-podium__initial">{row.label?.charAt(0)?.toUpperCase() || '?'}</span>
                            )}
                          </span>
                          <span className="polls-podium__name" title={row.label}>{row.label}</span>
                          <span className="polls-podium__votes">{row.showVotes ? `${row.votes} voto${row.votes === 1 ? '' : 's'}` : '—'}</span>
                          <span className="polls-podium__bar" aria-hidden="true" />
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="polls-show__options">
                  {poll.rows.map((row) => (
                    <div className={`polls-show-row${row.leader ? ' is-leader' : ''}`} key={row.id}>
                      <span className="polls-show-row__rank">{row.rank}º</span>
                      {row.hasImage ? (
                        <img className="polls-show-row__img" src={pollOptionImageUrl(row.id)} alt={row.label} />
                      ) : (
                        <div className="polls-show-row__img polls-show-row__img--empty">{row.label?.charAt(0) || '?'}</div>
                      )}
                      <div className="polls-show-row__info">
                        <div className="polls-show-row__top">
                          <span className="polls-show-row__label">
                            {row.leader && <span className="polls-show-row__crown">👑</span>}
                            {row.label}
                          </span>
                          <span className="polls-show-row__pct">{row.pct}%</span>
                        </div>
                        <div className="polls-show-row__bar">
                          <div
                            className="polls-show-row__bar-fill"
                            style={{ width: `${row.width}%`, transition: liveMode ? undefined : 'none' }}
                          />
                        </div>
                        <span className="polls-show-row__votes">{row.showVotes ? `${row.votes} voto${row.votes === 1 ? '' : 's'}` : '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Votações', value: polls.length },
    { label: 'Ativas', value: stats.active, tone: 'free' },
    { label: 'Opções', value: stats.options, tone: 'used' },
    { label: 'Votos', value: stats.votes, tone: 'accent' },
  ];

  const term = search.trim().toLowerCase();
  const filtered = term ? polls.filter((p) => (p.title || '').toLowerCase().includes(term)) : polls;

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'polls-display',
      name: 'Modo exibição',
      onClick: () => setMode('results'),
      typeButton: 'outline-teal-blue',
      typeIcon: 'chart',
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'polls-add',
      name: 'Nova Votação',
      onClick: () => {
        setNewTitle('');
        setShowCreate(true);
      },
      typeButton: 'teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--polls">
      <AdminSubpageHeader username={loggedUsername} title="Votações" subtitle="Enquetes para o público votar" typeIcon="feedback" />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="polls-search">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por votação..." />
        </div>

        <SectionHeader title="Votações" count={filtered.length} />

        <div className="admin-table-card">
          <div className="table-responsive">
            <Table striped bordered hover className="custom-table">
              <thead>
                <tr>
                  <th className="table-cells-header">Título:</th>
                  <th className="table-cells-header">Opções:</th>
                  <th className="table-cells-header">Votos:</th>
                  <th className="table-cells-header">Status:</th>
                  <th className="table-cells-header">Ações:</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-start text-secondary p-4">
                      Nenhuma votação criada
                    </td>
                  </tr>
                ) : (
                  filtered.map((poll) => (
                    <tr key={poll.id}>
                      <td className="fw-semibold text-capitalize">{poll.title}</td>
                      <td>{poll.options?.length || 0}</td>
                      <td>
                        <Badge bg="teal-blue">{poll.totalVotes || 0}</Badge>
                      </td>
                      <td>
                        <Form.Check
                          type="switch"
                          id={`poll-active-${poll.id}`}
                          checked={poll.active}
                          onChange={() => handleToggleActive(poll)}
                          label={poll.active ? 'Ativa' : 'Inativa'}
                        />
                      </td>
                      <td>
                        <div className="table-action-cell">
                          <ActionButton action="edit" label="Gerenciar opções" onClick={() => setManageId(poll.id)} />
                          <ActionButton action="delete" label="Excluir votação" onClick={() => handleDeletePoll(poll)} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <CustomModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        variant="info"
        title="Nova votação"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="polls-btn" onClick={handleCreate} disabled={busy}>
              Criar
            </Button>
          </>
        }
      >
        <Form.Group>
          <Form.Label className="fw-semibold">Título da votação</Form.Label>
          <Form.Control
            placeholder="Ex.: Melhor fantasia, Show de talentos..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <Form.Text className="text-muted">Depois de criar, adicione as opções com foto.</Form.Text>
        </Form.Group>
      </CustomModal>

      <CustomModal
        show={!!managedPoll}
        onHide={() => setManageId(null)}
        variant="info"
        size="lg"
        title="Gerenciar votação"
        footer={
          <Button variant="secondary" onClick={() => setManageId(null)}>
            Fechar
          </Button>
        }
      >
        {managedPoll && (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Título</Form.Label>
              <Form.Control defaultValue={managedPoll.title} onBlur={(e) => handleRename(managedPoll, e.target.value)} />
            </Form.Group>

            <div className="polls-signup">
              <Form.Check
                type="switch"
                id={`poll-voting-${managedPoll.id}`}
                className="polls-signup__switch polls-signup__switch--voting"
                checked={!!managedPoll.active}
                onChange={async () => {
                  try {
                    await updatePoll(managedPoll.id, { active: !managedPoll.active });
                    load(true);
                  } catch {
                    toast.error('Erro ao atualizar a votação.');
                  }
                }}
                label={managedPoll.active ? 'Votação aberta (o público pode votar)' : 'Votação parada (iniciar para o público votar)'}
              />
              <Form.Check
                type="switch"
                id={`poll-signup-${managedPoll.id}`}
                className="polls-signup__switch"
                checked={!!managedPoll.signupEnabled}
                onChange={async () => {
                  try {
                    await updatePoll(managedPoll.id, { signupEnabled: !managedPoll.signupEnabled });
                    load(true);
                  } catch {
                    toast.error('Erro ao atualizar a inscrição.');
                  }
                }}
                label="Inscrição de competidores aberta (o público pode se inscrever)"
              />
              {managedPoll.signupEnabled && (
                <p className="polls-signup__link">
                  Link público de inscrição: <code>{`${window.location.origin}/competicao`}</code>
                </p>
              )}
            </div>

            <div className="polls-config">
              <Form.Check
                type="switch"
                id={`poll-multiple-${managedPoll.id}`}
                className="polls-config__switch"
                checked={!!managedPoll.allowMultiple}
                onChange={() => updateManaged({ allowMultiple: !managedPoll.allowMultiple })}
                label="Permitir escolha múltipla (o votante marca mais de uma opção)"
              />
              {managedPoll.allowMultiple && (
                <Form.Group className="polls-config__max">
                  <Form.Label className="small mb-1">Máximo de opções que o votante pode escolher</Form.Label>
                  <Form.Control
                    type="number"
                    min={2}
                    style={{ maxWidth: '7rem' }}
                    defaultValue={managedPoll.maxChoices || 2}
                    key={`max-${managedPoll.id}-${managedPoll.maxChoices}`}
                    onBlur={(e) => {
                      const value = Math.max(2, parseInt(e.target.value, 10) || 2);
                      if (value !== managedPoll.maxChoices) updateManaged({ maxChoices: value });
                    }}
                  />
                </Form.Group>
              )}

              <div className="polls-config__timer">
                <span className="polls-config__timer-title">
                  <Icons typeIcon="clock" iconSize={15} fill="var(--admin-accent, #007185)" /> Cronômetro da votação
                </span>
                <div className="polls-config__timer-row">
                  <Form.Control
                    type="number"
                    min={0}
                    style={{ maxWidth: '6.5rem' }}
                    placeholder="min"
                    defaultValue={managedPoll.votingDurationSeconds ? Math.round(managedPoll.votingDurationSeconds / 60) : ''}
                    key={`dur-${managedPoll.id}-${managedPoll.votingDurationSeconds}`}
                    onBlur={(e) => {
                      const mins = Math.max(0, parseFloat(e.target.value) || 0);
                      const secs = Math.round(mins * 60);
                      if (secs !== (managedPoll.votingDurationSeconds || 0)) updateManaged({ votingDurationSeconds: secs });
                    }}
                  />
                  <span className="polls-config__timer-unit">minutos</span>
                  <span className="polls-config__timer-state">{timerStateLabel(managedPoll, now)}</span>
                </div>
                <div className="polls-config__timer-actions">
                  <Button size="sm" variant="teal-blue" className="d-inline-flex align-items-center gap-1" onClick={() => doTimer('start', managedPoll.id)}>
                    ▶ Iniciar
                  </Button>
                  <Button size="sm" variant="outline-teal-blue" onClick={() => doTimer('pause', managedPoll.id)}>
                    ⏸ Pausar
                  </Button>
                  <Button size="sm" variant="outline-secondary" onClick={() => doTimer('reset', managedPoll.id)}>
                    ↺ Reiniciar
                  </Button>
                </div>
              </div>
            </div>

            <div className="polls-manage__opt-head">
              <span className="fw-semibold">Opções</span>
              <span className="polls-manage__total">
                <Icons typeIcon="checked" iconSize={14} fill="var(--admin-accent)" /> {managedPoll.totalVotes || 0} voto(s)
              </span>
            </div>

            <div className="polls-options">
              {(managedPoll.options || []).length === 0 && (
                <p className="polls-options__empty">Nenhuma opção ainda. Adicione abaixo.</p>
              )}
              {(managedPoll.options || []).map((option) => {
                const total = managedPoll.totalVotes || 0;
                const votes = option.votes || 0;
                const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
                return (
                  <div className="polls-option" key={option.id}>
                    {option.hasImage ? (
                      <img className="polls-option__img" src={pollOptionImageUrl(option.id)} alt={option.label} />
                    ) : (
                      <span className="polls-option__img polls-option__img--empty">{option.label?.charAt(0)?.toUpperCase() || '?'}</span>
                    )}
                    <div className="polls-option__info">
                      <div className="polls-option__top">
                        <span className="polls-option__label">{option.label}</span>
                        <span className="polls-option__pct">{pct}%</span>
                      </div>
                      <div className="polls-option__bar">
                        <div className="polls-option__bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="polls-option__votes">{votes} voto(s)</span>
                      {(option.music || option.observation) && (
                        <div className="polls-option__details">
                          {option.music && (
                            <span className="polls-option__detail">🎵 {option.music}</span>
                          )}
                          {option.observation && (
                            <span className="polls-option__detail">📝 {option.observation}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button type="button" className="polls-option__del" onClick={() => handleDeleteOption(option.id)} title="Remover opção" aria-label="Remover opção">
                      <Icons typeIcon="delete" iconSize={16} fill="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="polls-add">
              <label className="polls-add__thumb" title="Foto da opção (opcional)">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setOptDraft({ ...optDraft, file: e.target.files?.[0] || null })}
                />
                {optDraft.file ? (
                  <img src={URL.createObjectURL(optDraft.file)} alt="Pré-visualização" />
                ) : (
                  <Icons typeIcon="camera" iconSize={22} fill="#9aa5ab" />
                )}
              </label>
              <Form.Control
                className="polls-add__input"
                placeholder="Nome da opção (ex.: competidor)"
                value={optDraft.label}
                onChange={(e) => setOptDraft({ ...optDraft, label: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOption(managedPoll.id)}
              />
              <Button variant="primary" className="polls-btn polls-add__btn d-inline-flex align-items-center gap-2" onClick={() => handleAddOption(managedPoll.id)} disabled={busy}>
                <Icons typeIcon="plus" iconSize={16} fill="#fff" /> Adicionar
              </Button>
            </div>
          </>
        )}
      </CustomModal>
    </div>
  );
};

AdminPolls.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminPolls;
